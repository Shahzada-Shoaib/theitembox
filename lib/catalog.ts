import {
  fallbackCatalog,
  type Product,
  type StorefrontCatalog,
} from "@/app/products";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  category_id: string | null;
  subcategory_id: string | null;
  collection: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  image_alt?: string;
  gallery: string[];
  gallery_alts?: string[];
  meta_title?: string;
  meta_description?: string;
  color: string;
  fit: string;
  tag: string;
  sizes: string[];
  active: boolean;
};

type PlacementRow = {
  product_id: string;
  section: "slider" | "reel" | "collection";
  sort_order: number;
};

type CategoryRow = { id: string; name: string; sort_order: number };
type SubcategoryRow = { id: string; category_id: string; name: string; sort_order: number };

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category,
    categoryId: row.category_id,
    subcategoryId: row.subcategory_id,
    collection: row.collection,
    subtitle: row.subtitle,
    description: row.description,
    price: row.price,
    image: row.image,
    imageAlt: row.image_alt || row.subtitle || row.name,
    gallery: row.gallery?.length ? row.gallery : [row.image],
    galleryAlts: row.gallery_alts ?? [],
    metaTitle: row.meta_title || undefined,
    metaDescription: row.meta_description || undefined,
    color: row.color,
    fit: row.fit,
    tag: row.tag,
    sizes: row.sizes ?? [],
    active: row.active,
  };
}

export async function getStorefrontCatalog(): Promise<StorefrontCatalog> {
  if (!isSupabaseConfigured()) return fallbackCatalog;

  try {
    const supabase = createSupabaseClient();
    const productFields = "id,slug,name,category,category_id,subcategory_id,collection,subtitle,description,price,image,image_alt,gallery,gallery_alts,meta_title,meta_description,color,fit,tag,sizes,active";
    const legacyProductFields = "id,slug,name,category,category_id,subcategory_id,collection,subtitle,description,price,image,gallery,color,fit,tag,sizes,active";
    const productQuery = (fields: string) => supabase
      .from("products")
      .select(fields)
      .eq("active", true)
      .order("created_at", { ascending: false });
    let productsResult = await productQuery(productFields);
    if (productsResult.error) productsResult = await productQuery(legacyProductFields);
    const [placementsResult, categoriesResult, subcategoriesResult] = await Promise.all([
      supabase
        .from("homepage_product_placements")
        .select("product_id,section,sort_order")
        .order("sort_order", { ascending: true }),
      supabase.from("categories").select("id,name,sort_order").order("sort_order"),
      supabase.from("subcategories").select("id,category_id,name,sort_order").order("sort_order"),
    ]);

    if (productsResult.error || placementsResult.error || categoriesResult.error || subcategoriesResult.error || !productsResult.data?.length) {
      return fallbackCatalog;
    }

    const products = (productsResult.data as unknown as ProductRow[]).map(toProduct);
    const productMap = new Map(products.map(product => [product.id, product]));
    const placements = placementsResult.data as PlacementRow[];
    const placed = (section: PlacementRow["section"]) => placements
      .filter(placement => placement.section === section)
      .map(placement => productMap.get(placement.product_id))
      .filter((product): product is Product => Boolean(product));

    return {
      categories: (categoriesResult.data as CategoryRow[]).map(category => ({ id: category.id, name: category.name, sortOrder: category.sort_order })),
      subcategories: (subcategoriesResult.data as SubcategoryRow[]).map(subcategory => ({ id: subcategory.id, categoryId: subcategory.category_id, name: subcategory.name, sortOrder: subcategory.sort_order })),
      products,
      sliderProducts: placed("slider"),
      reelProducts: placed("reel"),
      collectionProducts: placed("collection"),
    };
  } catch (error) {
    console.warn("Using the local product catalog because Supabase could not be read.", error);
    return fallbackCatalog;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const catalog = await getStorefrontCatalog();
  return catalog.products.find(product => product.slug === slug) ?? null;
}
