"use client";

import type { CSSProperties } from "react";
import { ProductImage } from "./product-image";
import { formatPrice, type Product } from "./products";

type ProductReelProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

export function ProductReel({ products, onOpenProduct }: ProductReelProps) {
  return (
    <section
      id="product-reel"
      className="product-reel-section"
      aria-labelledby="set-builder-title"
    >
      <div className="set-builder-copy">
        <span>Mix it your way <i aria-hidden="true" /></span>
        <h2 id="set-builder-title">Build your set.</h2>
        <p>Five graphic tees. One sun-soaked drop. Pick the pieces that match your player.</p>
        <a href="#collection">Shop the collection <span aria-hidden="true">→</span></a>
      </div>
      <div className="product-reel-stage" role="region" aria-label="Shirts rotating continuously around a 3D circular track">
        <div className="product-reel-orbit-plane">
          <div className="product-reel-rig">
            {products.map((product, index) => {
              const angle = index * 360 / products.length;
              const style = {
                "--orbit-angle": `${angle}deg`,
                "--facing-angle": `${-angle}deg`,
              } as CSSProperties;

              return (
                <button
                  type="button"
                  className="product-reel-card"
                  style={style}
                  key={product.id}
                  onClick={() => onOpenProduct(product)}
                  aria-label={`View ${product.name}`}
                >
                  <span className="product-reel-depth">
                    <span className="product-reel-facing-offset">
                      <span className="product-reel-facing">
                        <span className="product-reel-image">
                          <ProductImage product={product} sizes="(max-width: 600px) 58vw, 360px" unoptimized={false} />
                        </span>
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="product-reel-static" aria-label="Shirt collection">
        {products.map(product => (
          <button type="button" key={product.id} onClick={() => onOpenProduct(product)}>
            <span><ProductImage product={product} sizes="42vw" unoptimized={false} /></span>
            <strong>{product.name}</strong>
            <small>{formatPrice(product.price)}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
