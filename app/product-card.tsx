import { Icon } from "./brand";
import { ProductImage } from "./product-image";
import { formatPrice, type Product } from "./products";

type ProductCardProps = {
  product: Product;
  onOpen: () => void;
  onQuickAdd: (source: HTMLElement | null) => void;
};

export function ProductCard({ product, onOpen, onQuickAdd }: ProductCardProps) {
  return (
    <article className="group min-w-0 p-0 text-left">
      <div className="relative aspect-[1/1.25] overflow-hidden border-0 bg-transparent min-[601px]:aspect-[1/1.1] min-[901px]:aspect-[4/4.9]">
        <button className="absolute inset-0 block h-full w-full p-0 text-left focus-visible:outline-offset-[-5px]" onClick={onOpen} aria-label={`View ${product.name}`}>
          <ProductImage product={product} className="transition-transform duration-[650ms] ease-[cubic-bezier(.2,.65,.3,1)] group-hover:scale-[1.07]" />
        </button>
        <button className="absolute bottom-[9px] right-[9px] z-[2] grid size-9 place-items-center rounded-full bg-[#f7f7f0] transition-[background,box-shadow] duration-200 group-hover:bg-[#b7ff00] hover:bg-[#b7ff00] hover:shadow-[0_0_0_5px_#b7ff0026] min-[601px]:bottom-3 min-[601px]:right-3 min-[601px]:size-[33px] [&>svg]:size-[15px] min-[601px]:[&>svg]:size-[17px]" aria-label={`Add ${product.name} to bag`} onClick={event => onQuickAdd(event.currentTarget.parentElement)}>
          <Icon name="plus" />
        </button>
      </div>
      <button className="block w-full p-0 text-left" onClick={onOpen}>
        <span className="mt-3 flex items-end justify-between gap-3 min-[601px]:mt-[17px]">
          <span className="block text-[13px] font-semibold leading-[1.2] tracking-[-.3px] min-[601px]:text-sm">{product.name}</span>
          <span className="mb-px inline-block whitespace-nowrap text-[11px] text-[#62675b]">{formatPrice(product.price)}</span>
        </span>
      </button>
    </article>
  );
}
