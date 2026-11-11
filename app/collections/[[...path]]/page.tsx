import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogListing } from "@/app/catalog-listing";
import { getStorefrontCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import { catalogSlug, categoryPath, subcategoryPath } from "@/lib/catalog-routes";
import "./catalog.css";

type CollectionPageProps = { params: Promise<{ path?: string[] }> };

async function resolveCollection(path: string[] = []) {
  const catalog = await getStorefrontCatalog();
  if (path.length > 2) return null;

  if (path.length === 0) {
    return { catalog, products: catalog.products, title: "All collections", eyebrow: "Everything in one place", canonical: "/collections" };
  }

  const category = catalog.categories.find(item => catalogSlug(item.name) === path[0]);
  if (!category) return null;

  if (path.length === 1) {
    return {
      catalog,
      products: catalog.products.filter(product => product.categoryId === category.id || (!product.categoryId && product.category === category.name)),
      title: category.name,
      eyebrow: "Shop by category",
      categoryName: category.name,
      canonical: categoryPath(category),
    };
  }

  const subcategory = catalog.subcategories.find(item => item.categoryId === category.id && catalogSlug(item.name) === path[1]);
  if (!subcategory) return null;

  return {
    catalog,
    products: catalog.products.filter(product => product.subcategoryId === subcategory.id),
    title: subcategory.name,
    eyebrow: category.name,
    categoryName: category.name,
    canonical: subcategoryPath(category, subcategory),
  };
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { path } = await params;
  const collection = await resolveCollection(path);
  if (!collection) return {};
  const description = `Shop ${collection.title} products from The Item Box. Explore available styles, colours and the latest drops in Pakistan.`;
  return {
    title: collection.title,
    description,
    alternates: { canonical: collection.canonical },
    openGraph: { title: `${collection.title} | The Item Box`, description, url: collection.canonical, type: "website" },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { path } = await params;
  const collection = await resolveCollection(path);
  if (!collection) notFound();

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.title,
    url: absoluteUrl(collection.canonical),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: collection.products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/products/${product.slug}`),
        name: product.name,
      })),
    },
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    <CatalogListing {...collection} />
  </>;
}
