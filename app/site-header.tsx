import type { RefObject } from "react";
import { Brand, Icon } from "./brand";
import { IconButton } from "./ui";

type SiteHeaderProps = {
  bagCount: number;
  bagButtonRef: RefObject<HTMLButtonElement | null>;
  productCount: number;
  onOpenBag: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
};

export function SiteHeader({ bagCount, bagButtonRef, productCount, onOpenBag, onOpenMenu, onOpenSearch }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a href="#top" className="site-header-brand" aria-label="The Item Box home"><Brand compact /></a>
      <nav className="site-header-nav" aria-label="Main navigation">
        <a href="#new-arrivals">Shop</a>
        <a href="#collection">Collections <sup>{productCount.toString().padStart(2, "0")}</sup></a>
        <a href="#lookbook">About</a>
        <a href="#site-footer">Contact</a>
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
