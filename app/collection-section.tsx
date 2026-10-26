import { Icon } from "./brand";
import { ProductCard } from "./product-card";
import type { Product } from "./products";

type CollectionSectionProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product, source: HTMLElement | null) => void;
};

export function CollectionSection({ products, onOpenProduct, onQuickAdd }: CollectionSectionProps) {
  return (
    <section className="featured-section" id="collection" aria-labelledby="collection-title">
      <header className="store-section-header">
        <h2 id="collection-title">Featured collection <i aria-hidden="true" /></h2>
        <a href="#collection-grid">View all <Icon name="arrow" /></a>
      </header>
      <div id="collection-grid" className="featured-grid">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onOpen={() => onOpenProduct(product)} onQuickAdd={source => onQuickAdd(product, source)} />
        ))}
      </div>
    </section>
  );
}
