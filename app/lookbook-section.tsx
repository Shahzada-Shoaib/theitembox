import { Icon } from "./brand";
import { ProductImage } from "./product-image";
import type { Product } from "./products";

type LookbookSectionProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

const campaignImages = [
  "/campaign/men-editorial.png",
  "/campaign/women-editorial.png",
  "/campaign/players-editorial.png",
] as const;

export function LookbookSection({ products, onOpenProduct }: LookbookSectionProps) {
  return (
    <section id="lookbook" className="lookbook-section" aria-labelledby="lookbook-title">
      <div className="lookbook-copy">
        <h2 id="lookbook-title">Worn by<br /><em>players.</em></h2>
        <p>For the dreamers, the risk takers and the late-night grinders. This is more than a tee. This is your story.</p>
        <a href="#collection">Explore the drop <Icon name="arrow" /></a>
      </div>
      <div className="lookbook-grid" aria-label="Player fit lookbook">
        {products.map((product, index) => (
          <button type="button" className={`lookbook-frame lookbook-frame-${index + 1}`} key={product.id} onClick={() => onOpenProduct(product)} aria-label={`View ${product.name}`}>
            <ProductImage product={product} image={campaignImages[index] ?? product.gallery[1]} alt={`${product.name} player campaign`} sizes="(max-width: 600px) 88vw, 45vw" fit="cover" />
            <span className="lookbook-action" aria-hidden="true"><Icon name="arrow" /></span>
          </button>
        ))}
      </div>
    </section>
  );
}
