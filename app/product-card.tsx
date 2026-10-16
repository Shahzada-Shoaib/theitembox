import { Icon } from "./brand";
import { ProductImage } from "./product-image";
import { formatPrice, type Product } from "./products";

type ProductCardProps = {
  product: Product;
  featured?: boolean;
  onOpen: () => void;
  onQuickAdd: (source: HTMLElement | null) => void;
};

export function ProductCard({ product, featured = false, onOpen, onQuickAdd }: ProductCardProps) {
  const colorDot = product.id === "sound" ? "#252525" : product.id === "frames" ? "#aa9877" : "#e8e6df";

  return (
    <article className="group min-w-0 p-0 text-left">
      <div className="relative aspect-[1/1.25] overflow-hidden border-0 bg-transparent min-[601px]:aspect-[1/1.1] min-[901px]:aspect-[4/4.9]">
        <button className="absolute inset-0 block h-full w-full p-0 text-left focus-visible:outline-offset-[-5px]" onClick={onOpen} aria-label={`View ${product.name}`}>
          <ProductImage product={product} className="transition-transform duration-[650ms] ease-[cubic-bezier(.2,.65,.3,1)] group-hover:scale-[1.07]" />
          {featured && <span className="absolute right-2 top-[9px] bg-[#b7ff00] px-1.5 py-1 text-[5px] tracking-[1px] text-[#272c19] min-[601px]:right-[13px] min-[601px]:top-[13px] min-[601px]:px-2 min-[601px]:py-1.5 min-[601px]:text-[7px]">THE EDIT</span>}
        </button>
        <button className="absolute bottom-[9px] right-[9px] z-[2] grid size-[27px] place-items-center rounded-full bg-[#f7f7f0] transition-[background,box-shadow] duration-200 group-hover:bg-[#b7ff00] hover:bg-[#b7ff00] hover:shadow-[0_0_0_5px_#b7ff0026] min-[601px]:bottom-3 min-[601px]:right-3 min-[601px]:size-[33px] [&>svg]:size-[13px] min-[601px]:[&>svg]:size-[17px]" aria-label={product.category === "Apparel" ? `Choose size for ${product.name}` : `Add ${product.name} to bag`} onClick={event => onQuickAdd(event.currentTarget.parentElement)}>
          <Icon name="plus" />
        </button>
      </div>
      <button className="block w-full p-0 text-left" onClick={onOpen}>
        <span className="mt-3 block min-[601px]:mt-[17px] min-[601px]:flex min-[601px]:items-end min-[601px]:justify-between min-[601px]:gap-[5px]">
          <span>
            <span className="block text-[6px] uppercase tracking-[.8px] text-[#7e8274] min-[601px]:text-[8px] min-[601px]:tracking-[1.2px]">{product.category}</span>
            <span className="mt-[5px] block text-[11px] font-semibold tracking-[-.3px] min-[601px]:mt-1.5 min-[601px]:text-[13px]">{product.name}</span>
          </span>
          <span className="mt-[7px] inline-block whitespace-nowrap text-[9px] text-[#505747] min-[601px]:mt-0 min-[601px]:mb-px min-[601px]:text-[10px]">{formatPrice(product.price)}</span>
        </span>
        <span className="mt-2 flex items-center gap-1 text-[7px] text-[#888c80] min-[601px]:mt-[11px] min-[601px]:gap-1.5 min-[601px]:text-[9px]"><span className="size-[7px] rounded-full border border-[#a2a697]" style={{ background: colorDot }} />{product.color}</span>
      </button>
    </article>
  );
}
