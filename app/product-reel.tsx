"use client";

import type { CSSProperties } from "react";
import { ProductImage } from "./product-image";
import type { Product } from "./products";

type ProductReelProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

const ORBIT_DURATION = 26;

export function ProductReel({ products, onOpenProduct }: ProductReelProps) {
  return (
    <section id="product-reel" className="product-reel-section" aria-labelledby="product-reel-title">
      <h2 id="product-reel-title" className="sr-only">Continuously rotating shirt collection</h2>
      <div className="product-reel-stage" role="region" aria-label="Shirts moving continuously around a 3D circular track">
        {products.map((product, index) => {
          const style = {
            "--orbit-delay": `${-(index * ORBIT_DURATION / products.length)}s`,
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
                <span className="product-reel-facing">
                  <span className="product-reel-image">
                    <ProductImage product={product} sizes="(max-width: 600px) 52vw, 310px" unoptimized={false} />
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
