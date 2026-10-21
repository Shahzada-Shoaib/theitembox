"use client";

import { useState, type CSSProperties } from "react";
import { ProductImage } from "./product-image";
import { formatPrice, type Product } from "./products";

type ProductReelProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

export function ProductReel({ products, onOpenProduct }: ProductReelProps) {
  const [paused, setPaused] = useState(false);
  const [activeProductId, setActiveProductId] = useState(products[0]?.id ?? "");
  const activeProduct = products.find(product => product.id === activeProductId) ?? products[0];

  return (
    <section
      id="product-reel"
      className={`product-reel-section ${paused ? "is-paused" : ""}`}
      aria-labelledby="product-reel-title"
    >
      <header className="product-reel-header">
        <h2 id="product-reel-title">PICK YOUR PLAYER.</h2>
      </header>

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
                  onMouseEnter={() => setActiveProductId(product.id)}
                  onFocus={() => setActiveProductId(product.id)}
                  aria-label={`View ${product.name}`}
                >
                  <span className="product-reel-depth">
                    <span className="product-reel-facing-offset">
                      <span className="product-reel-facing">
                        <span className="product-reel-image">
                          <ProductImage product={product} sizes="(max-width: 600px) 52vw, 310px" unoptimized={false} />
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

      {activeProduct && (
        <div className="product-reel-info">
          <span className="product-reel-summary">
            <strong aria-live="polite">{activeProduct.name}</strong>
          </span>
          <button type="button" className="product-reel-view" onClick={() => onOpenProduct(activeProduct)}>
            <span>{formatPrice(activeProduct.price)}</span>
            VIEW PRODUCT
          </button>
        </div>
      )}

      <div className="product-reel-controls" aria-label="Product reel controls">
        <button type="button" onClick={() => setPaused(current => !current)} aria-label={paused ? "Resume rotation" : "Pause rotation"} aria-pressed={paused}>
          {paused ? "PLAY" : "PAUSE"}
        </button>
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
