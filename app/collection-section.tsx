import { ProductCard } from "./product-card";
import type { Product } from "./products";

type CollectionSectionProps = {
  products: readonly Product[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onOpenProduct: (product: Product) => void;
  onQuickAdd: (product: Product, source: HTMLElement | null) => void;
};

export function CollectionSection({ products, filter, onFilterChange, onOpenProduct, onQuickAdd }: CollectionSectionProps) {
  const filtered = products.filter(product => filter === "All items" || product.category === filter);

  return (
    <section className="bg-[#f2f2ed] px-[6.5%]  text-[#141510]" id="collection">
      {/* <div className="mb-[clamp(26px,2.5vw,36px)] flex items-end justify-between max-[600px]:mb-6">
        <h2 className="m-0 text-[clamp(46px,5.4vw,80px)] font-black leading-[.94] tracking-[-3.8px] max-[600px]:text-[clamp(36px,11.5vw,46px)] max-[600px]:tracking-[-2.2px]">YOUR NEXT<br /><span className="text-[#898b81]">GOOD FIND.</span></h2>
      </div> */}
      {/* <div className="flex items-center border-[#d6d7cc] pb-8  max-[600px]:pb-6 max-[600px]:pt-3.5">
        <div className="flex gap-2 max-[600px]:w-full max-[600px]:justify-between max-[600px]:gap-0.5" aria-label="Filter collection">
          {["Apparel"].map(category => {
            const active = filter === category;
            return (
              <button type="button" key={category} className={`min-h-10 rounded-[30px] border px-[15px] py-[9px] text-[10px] transition-all hover:border-[#b1b4a5] max-[600px]:px-4 max-[600px]:text-[10px] ${active ? "border-transparent bg-[#1d2118] text-[#f5f5ee]" : "border-transparent text-[#717569]"}`} aria-pressed={active} onClick={() => onFilterChange(category)}>
                {category}
              </button>
            );
          })}
        </div>
      </div> */}
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-8 min-[601px]:gap-x-6 min-[601px]:gap-y-11 min-[901px]:grid-cols-4 min-[901px]:gap-x-6 min-[901px]:gap-y-12">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onOpen={() => onOpenProduct(product)}
            onQuickAdd={source => onQuickAdd(product, source)}
          />
        ))}
      </div>
    </section>
  );
}
