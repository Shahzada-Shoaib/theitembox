import type { MetadataRoute } from "next";
import { getStorefrontCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import { categoryPath, subcategoryPath } from "@/lib/catalog-routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories, subcategories } = await getStorefrontCatalog();

  return [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/collections"), changeFrequency: "weekly", priority: 0.9 },
    ...categories.map(category => ({
      url: absoluteUrl(categoryPath(category)),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...subcategories.flatMap(subcategory => {
      const category = categories.find(item => item.id === subcategory.categoryId);
      return category ? [{ url: absoluteUrl(subcategoryPath(category, subcategory)), changeFrequency: "weekly" as const, priority: 0.7 }] : [];
    }),
    ...products.map(product => ({
      url: absoluteUrl(`/products/${product.slug}`),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
