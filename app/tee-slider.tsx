"use client";

import { Icon } from "./brand";
import { ProductImage } from "./product-image";
import { formatPrice, type Product } from "./products";

type TeeSliderProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

export function TeeSlider({ products, onOpenProduct }: TeeSliderProps) {
  return (
    <section id="new-arrivals" className="arrival-section" aria-labelledby="arrival-title">
      <header className="store-section-header">
        <h2 id="arrival-title">New arrivals <i aria-hidden="true" /></h2>
        <a href="#collection">View all <Icon name="arrow" /></a>
      </header>
      <div className="arrival-rail">
        {products.map(product => (
          <button type="button" className="arrival-card" key={product.id} onClick={() => onOpenProduct(product)}>
            <span className="arrival-image"><ProductImage product={product} sizes="(max-width: 600px) 54vw, 20vw" /></span>
            <strong>{product.name}</strong>
            <small>{formatPrice(product.price)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
