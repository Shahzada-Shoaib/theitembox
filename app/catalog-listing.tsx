"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "./brand";
import { ProductCard } from "./product-card";
import type { BagItem, Product, StorefrontCatalog } from "./products";
import { ShopDialog, type Panel } from "./shop-dialog";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";
import { useBag } from "./use-bag";

type CatalogListingProps = {
  catalog: StorefrontCatalog;
  products: readonly Product[];
};

export function CatalogListing({ catalog, products }: CatalogListingProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState("");
  const [bag, setBag] = useBag(catalog.products);
  const dialogOpen = Boolean(panel || selected);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialogOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
  }, [dialogOpen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function closeDialog() {
    setPanel(null);
    setSelected(null);
  }

  function openPanel(next: Panel) {
    setSelected(null);
    setPanel(next);
  }

  function addToBag(product: Product) {
    const size = product.sizes.includes("M") ? "M" : product.sizes[0] || "One size";
    setBag(current => {
      const match = current.find(item => item.id === product.id && item.size === size);
      return match
        ? current.map(item => item === match ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item)
        : [...current, { id: product.id, size, quantity: 1 }];
    });
    setToast(`${product.name} added to your bag`);
  }

  function changeQuantity(id: Product["id"], size: string, delta: number) {
    setBag(current => current
      .map(item => item.id === id && item.size === size ? { ...item, quantity: Math.min(99, item.quantity + delta) } : item)
      .filter(item => item.quantity > 0));
  }

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bag.reduce((sum, item) => sum + (catalog.products.find(product => product.id === item.id)?.price ?? 0) * item.quantity, 0);
  const searchResults = catalog.products.filter(product => `${product.name} ${product.category} ${product.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <main id="top" className="catalog-page">
      <section className="catalog-hero">
        <SiteHeader
          categories={catalog.categories}
          subcategories={catalog.subcategories}
          bagCount={bagCount}
          bagButtonRef={bagButtonRef}
          onOpenBag={() => openPanel("bag")}
          onOpenMenu={() => openPanel("menu")}
          onOpenSearch={() => { setQuery(""); openPanel("search"); }}
        />
      </section>

      <section className="catalog-products" aria-labelledby="catalog-grid-title">
        <header><h2 id="catalog-grid-title">Explore the collection <i aria-hidden="true" /></h2></header>
        {products.length > 0 ? (
          <div className="catalog-grid">
            {products.map(product => <ProductCard key={product.id} product={product} onQuickAdd={() => addToBag(product)} />)}
          </div>
        ) : (
          <div className="catalog-empty"><Icon name="bag" /><h2>No products here yet.</h2><p>New pieces will appear here as soon as they are added.</p><Link href="/collections">View all products</Link></div>
        )}
      </section>
      <SiteFooter />
    </main>

    <ShopDialog
      products={catalog.products}
      categories={catalog.categories}
      subcategories={catalog.subcategories}
      dialogRef={dialogRef}
      panel={panel}
      selected={selected}
      query={query}
      bag={bag as BagItem[]}
      bagCount={bagCount}
      subtotal={subtotal}
      searchResults={[...searchResults]}
      onClose={closeDialog}
      onOpenProduct={product => { setSelected(product); setPanel(null); }}
      onPanelChange={openPanel}
      onQueryChange={setQuery}
      onQuantityChange={changeQuantity}
    />
    <div className={`catalog-toast ${toast ? "is-visible" : ""}`} role="status">{toast}</div>
  </>;
}
