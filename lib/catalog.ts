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
  gallery: string[];
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
    gallery: row.gallery?.length ? row.gallery : [row.image],
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
    const [productsResult, placementsResult] = await Promise.all([
      supabase
        .from("products")
        .select("id,slug,name,category,category_id,subcategory_id,collection,subtitle,description,price,image,gallery,color,fit,tag,sizes,active")
        .eq("active", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("homepage_product_placements")
        .select("product_id,section,sort_order")
        .order("sort_order", { ascending: true }),
    ]);

    if (productsResult.error || placementsResult.error || !productsResult.data?.length) {
      return fallbackCatalog;
    }

    const products = (productsResult.data as ProductRow[]).map(toProduct);
    const productMap = new Map(products.map(product => [product.id, product]));
    const placements = placementsResult.data as PlacementRow[];
    const placed = (section: PlacementRow["section"]) => placements
      .filter(placement => placement.section === section)
      .map(placement => productMap.get(placement.product_id))
      .filter((product): product is Product => Boolean(product));

    return {
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
