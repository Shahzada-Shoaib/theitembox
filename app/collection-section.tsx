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
    <section className="bg-[#f2f2ed] px-[6.5%] pb-[85px] pt-[90px] text-[#141510] max-[900px]:px-[6%] max-[900px]:py-[65px] max-[600px]:px-[6%] max-[600px]:pb-11 max-[600px]:pt-12" id="collection">
      <div className="flex justify-between text-[8px] tracking-[1.8px] text-[#74756e] max-[600px]:text-[6px] max-[600px]:tracking-[1px]">
        <span className="flex items-center gap-[9px] text-[#33372a]"><span className="inline-block size-[5px] rounded-full bg-[#687d36] shadow-[0_0_10px_#b7ff0040]" /> THE CURATED COLLECTION</span>
      </div>
      <div className="my-[38px] flex items-end justify-between max-[600px]:my-[27px] max-[600px]:mt-6">
        <h2 className="m-0 text-[clamp(44px,5.2vw,76px)] font-black leading-none tracking-[-3.8px] max-[600px]:text-[44px] max-[600px]:tracking-[-2.5px]">YOUR NEXT<br /><span className="text-[#898b81]">GOOD FIND.</span></h2>
      </div>
      <div className="flex items-center justify-between border-t border-[#d6d7cc] pb-[25px] pt-[21px] max-[600px]:pb-[22px] max-[600px]:pt-4">
        <div className="flex gap-2 max-[600px]:w-full max-[600px]:justify-between max-[600px]:gap-0.5" aria-label="Filter collection">
          {["All items", "Apparel"].map(category => {
            const active = filter === category;
            return (
              <button type="button" key={category} className={`rounded-[30px] border px-[15px] py-[9px] text-[10px] transition-all hover:border-[#b1b4a5] max-[600px]:px-[11px] max-[600px]:py-2 max-[600px]:text-[9px] ${active ? "border-transparent bg-[#1d2118] text-[#f5f5ee]" : "border-transparent text-[#717569]"}`} aria-pressed={active} onClick={() => onFilterChange(category)}>
                {category}{category === "All items" && <span className="ml-[9px] text-[7px] text-[#b7ff00]">{products.length.toString().padStart(2, "0")}</span>}
              </button>
            );
          })}
        </div>
        <span className="text-[8px] tracking-[1px] text-[#878a7d] max-[600px]:hidden">{filtered.length.toString().padStart(2, "0")} GOOD FINDS</span>
      </div>
      <div className="grid grid-cols-2 gap-x-[13px] gap-y-[26px] min-[601px]:gap-x-5 min-[601px]:gap-y-8 min-[901px]:grid-cols-4 min-[901px]:gap-[15px] min-[1101px]:gap-[23px]">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            featured={products.indexOf(product) === 0}
            onOpen={() => onOpenProduct(product)}
            onQuickAdd={source => onQuickAdd(product, source)}
          />
        ))}
      </div>
    </section>
  );
}
