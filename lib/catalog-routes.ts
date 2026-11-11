import type { CatalogCategory, CatalogSubcategory } from "@/app/products";

export function catalogSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function categoryPath(category: CatalogCategory) {
  return `/collections/${catalogSlug(category.name)}`;
}

export function subcategoryPath(category: CatalogCategory, subcategory: CatalogSubcategory) {
  return `${categoryPath(category)}/${catalogSlug(subcategory.name)}`;
}
