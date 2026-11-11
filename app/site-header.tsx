import type { RefObject } from "react";
import Link from "next/link";
import { Brand, Icon } from "./brand";
import type { CatalogCategory, CatalogSubcategory } from "./products";
import { categoryPath, subcategoryPath } from "@/lib/catalog-routes";
import { IconButton } from "./ui";

type SiteHeaderProps = {
  bagCount: number;
  bagButtonRef: RefObject<HTMLButtonElement | null>;
  categories: readonly CatalogCategory[];
  subcategories: readonly CatalogSubcategory[];
  onOpenBag: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
};

export function SiteHeader({ bagCount, bagButtonRef, categories, subcategories, onOpenBag, onOpenMenu, onOpenSearch }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link href="/" className="site-header-brand" aria-label="The Item Box home"><Brand compact /></Link>
      <nav className="site-header-nav" aria-label="Main navigation">
        {categories.map(category => {
          const children = subcategories.filter(item => item.categoryId === category.id);
          return <div className="site-header-category" key={category.id}>
            <Link className="site-header-category-trigger" href={categoryPath(category)} aria-haspopup={children.length ? "true" : undefined}>
              {category.name}{children.length > 0 && <span aria-hidden="true">⌄</span>}
            </Link>
            {children.length > 0 && <div className="site-header-submenu">
              <span>{category.name}</span>
              {children.map(subcategory => <Link href={subcategoryPath(category, subcategory)} key={subcategory.id}>{subcategory.name}</Link>)}
            </div>}
          </div>;
        })}
      </nav>
      <div className="site-header-actions">
        <IconButton label="Search the collection" icon="search" onClick={onOpenSearch} />
        <button ref={bagButtonRef} type="button" className="site-header-bag" onClick={onOpenBag} aria-label={`Open bag, ${bagCount} items`}>
          <span className="bag-flight-target"><Icon name="bag" /></span>
          <span className="site-header-count">{bagCount}</span>
        </button>
        <span className="site-header-menu"><IconButton label="Open menu" icon="menu" onClick={onOpenMenu} /></span>
      </div>
    </header>
  );
}
