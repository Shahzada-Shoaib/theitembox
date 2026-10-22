import { Icon } from "./brand";
import { ProductImage } from "./product-image";
import type { Product } from "./products";

type LookbookSectionProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

export function LookbookSection({ products, onOpenProduct }: LookbookSectionProps) {
  return (
    <section className="lookbook-section" aria-labelledby="lookbook-title">
      <header className="lookbook-header">
        <h2 id="lookbook-title">WORN BY<br /><em>PLAYERS.</em></h2>
      </header>

      <div className="lookbook-grid" aria-label="Player fit lookbook">
        {products.map((product, index) => (
          <article className={`lookbook-card ${index === 0 ? "is-primary" : "is-secondary"}`} key={product.id}>
            <button type="button" className="lookbook-frame" onClick={() => onOpenProduct(product)} aria-label={`View ${product.name}`}>
              <ProductImage
                product={product}
                image={product.gallery[1] ?? product.image}
                alt={`${product.name} campaign view`}
                sizes={index === 0 ? "(max-width: 600px) 84vw, 58vw" : "(max-width: 600px) 84vw, 34vw"}
                fit="cover"
                unoptimized={false}
              />
              <span className="lookbook-action" aria-hidden="true"><Icon name="arrow" /></span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
