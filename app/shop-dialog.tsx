import type { RefObject } from "react";
import { Brand, Icon } from "./brand";
import { ProductImage } from "./product-image";
import { formatPrice, products, type BagItem, type Product } from "./products";
import { IconButton, PrimaryButton, primaryButtonClass } from "./ui";

export type Panel = "search" | "bag" | "menu" | null;

type ShopDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  panel: Panel;
  selected: Product | null;
  query: string;
  bag: BagItem[];
  bagCount: number;
  subtotal: number;
  searchResults: Product[];
  onClose: () => void;
  onOpenProduct: (product: Product) => void;
  onPanelChange: (panel: Panel) => void;
  onQueryChange: (query: string) => void;
  onQuantityChange: (id: Product["id"], size: string, delta: number) => void;
};

const panelClass = "px-[34px] pb-[35px] pt-[47px] max-[600px]:px-[22px] max-[600px]:pb-[26px] max-[600px]:pt-[50px]";
const eyebrowClass = "flex items-center gap-[11px] text-[8px] font-medium tracking-[2.3px] text-[#b7ff00]";

export function ShopDialog({ dialogRef, panel, selected, query, bag, bagCount, subtotal, searchResults, onClose, onOpenProduct, onPanelChange, onQueryChange, onQuantityChange }: ShopDialogProps) {
  const label = selected?.name ?? (panel === "bag" ? "Your shopping bag" : panel === "search" ? "Search collection" : "Navigation menu");

  return (
    <dialog
      ref={dialogRef}
      className={`shop-dialog fixed m-auto max-h-[calc(100svh-40px)] overflow-auto border border-[#404438] bg-[#141710] p-0 text-[#f6f6ed] backdrop:bg-black/70 backdrop:backdrop-blur-lg ${selected ? "w-[1000px] max-w-[min(1000px,calc(100vw-32px))]" : "w-[650px] max-w-[min(650px,calc(100vw-32px))]"}`}
      onCancel={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      aria-label={label}
    >
      <div className="relative">
        <IconButton label="Close dialog" icon="close" className="absolute right-[15px] top-[15px] z-[3] rounded-full border border-[#4c5240] bg-[#141710]" onClick={onClose} />
        {selected && <ProductDetails product={selected} />}
        {panel === "search" && <SearchPanel query={query} results={searchResults} onQueryChange={onQueryChange} onOpenProduct={onOpenProduct} />}
        {panel === "bag" && <BagPanel bag={bag} bagCount={bagCount} subtotal={subtotal} onClose={onClose} onQuantityChange={onQuantityChange} />}
        {panel === "menu" && (
          <nav className={`${panelClass} flex flex-col gap-1.5 [&_.brand]:mb-7`} aria-label="Mobile navigation">
            <Brand />
            <a className="flex items-center justify-between border-b border-[#4c573b] py-[15px] text-left text-[25px]" href="#collection" onClick={onClose}>The collection <Icon name="arrow" /></a>
            <a className="flex items-center justify-between border-b border-[#4c573b] py-[15px] text-left text-[25px]" href="#about" onClick={onClose}>Our world <Icon name="arrow" /></a>
            <button type="button" className="flex items-center justify-between border-b border-[#4c573b] py-[15px] text-left text-[25px]" onClick={() => onPanelChange("search")}>Search <Icon name="search" /></button>
          </nav>
        )}
      </div>
    </dialog>
  );
}

type ProductDetailsProps = {
  product: Product;
};

function ProductDetails({ product }: ProductDetailsProps) {
  return (
    <div className="h-[620px] w-full bg-[linear-gradient(90deg,#b7ff00_0%,#b7ff00_50%,#090b07_50%,#090b07_100%)] max-[600px]:h-[680px] max-[600px]:bg-[linear-gradient(180deg,#b7ff00_0%,#b7ff00_46%,#090b07_46%,#090b07_100%)]">
      <div className="detail-image relative h-full overflow-hidden">
        <div className="absolute left-9 top-8 z-[1] text-[#0b0d08] opacity-90 [&_.brand]:w-[150px] max-[600px]:left-5 max-[600px]:top-5 max-[600px]:[&_.brand]:w-[105px]"><Brand compact /></div>
        <span className="absolute left-10 top-[98px] z-[1] text-[7px] font-semibold tracking-[2.2px] text-[#26320f] max-[600px]:left-5 max-[600px]:top-[73px] max-[600px]:text-[6px]">THE EVERYDAY EDIT / 2026</span>

        <div className="absolute bottom-3 left-1/2 z-[2] h-[91%] w-[48%] -translate-x-1/2 drop-shadow-[0_30px_35px_#0005] max-[600px]:bottom-auto max-[600px]:top-[85px] max-[600px]:h-[250px] max-[600px]:w-[72%]">
          <ProductImage product={product} />
        </div>

        <div className="absolute right-10 top-10 z-[3] w-[38%] max-[600px]:left-5 max-[600px]:right-auto max-[600px]:top-[52%] max-[600px]:w-[80%]">
          <span className="text-[7px] tracking-[2px] text-[#b7ff00]">{product.tag}</span>
          <h2 className="mt-2 max-w-[300px] text-[30px] font-semibold leading-[1.02] tracking-[-1.4px] max-[600px]:text-[22px]">{product.name}</h2>
        </div>

        <DetailChip side="right" label="PRICE" value={formatPrice(product.price)} className="right-[18%] top-[155px] max-[600px]:right-3 max-[600px]:top-[112px]" lineClassName="w-[92px] max-[600px]:w-6" />
        <DetailChip side="left" label="COLOR" value={product.color} className="left-[18%] top-[244px] max-[600px]:left-3 max-[600px]:top-[188px]" lineClassName="w-[110px] max-[600px]:w-6" />
        <DetailChip side="right" label="FIT" value="Relaxed" className="right-[18%] top-[333px] max-[600px]:right-3 max-[600px]:top-[264px]" lineClassName="w-[76px] max-[600px]:w-6" />
        <DetailChip side="left" label="TYPE" value={product.category} className="left-[18%] top-[420px] max-[600px]:left-3 max-[600px]:top-[112px]" lineClassName="w-[82px] max-[600px]:w-6" />
      </div>
    </div>
  );
}

function DetailChip({ side, label, value, className, lineClassName }: { side: "left" | "right"; label: string; value: string; className: string; lineClassName: string }) {
  const lineColor = side === "left" ? "bg-[#283114]/55" : "bg-white/35 max-[600px]:bg-[#283114]/55";
  const dotColor = side === "left" ? "bg-[#15180f]" : "bg-[#b7ff00] shadow-[0_0_8px_#b7ff00] max-[600px]:bg-[#15180f] max-[600px]:shadow-none";

  return (
    <div className={`absolute z-[4] min-w-[128px] border border-white/20 bg-[#10120de8] px-3 py-2.5 shadow-[0_8px_30px_#0003] max-[600px]:min-w-[104px] max-[600px]:px-2.5 max-[600px]:py-2 ${className}`}>
      <span className={`absolute top-1/2 h-px ${lineColor} ${side === "right" ? "right-full" : "left-full"} ${lineClassName}`}><span className={`absolute -top-0.5 size-[5px] rounded-full ${dotColor} ${side === "right" ? "-left-0.5" : "-right-0.5"}`} /></span>
      <span className="block text-[6px] tracking-[1.6px] text-[#7f8975]">{label}</span>
      <strong className="mt-1 block text-[10px] font-medium text-[#f4f5ee] max-[600px]:text-[9px]">{value}</strong>
    </div>
  );
}

function SearchPanel({ query, results, onQueryChange, onOpenProduct }: { query: string; results: Product[]; onQueryChange: (query: string) => void; onOpenProduct: (product: Product) => void }) {
  return (
    <div className={panelClass}>
      <span className={eyebrowClass}>SOMETHING GOOD IS IN HERE.</span>
      <h2 className="mb-[27px] mt-[18px] text-[37px] font-semibold leading-[1.1] tracking-[-1.5px] max-[600px]:text-[32px]">Find your thing.</h2>
      <div className="flex items-center gap-3 border-b border-[#6a7853] py-3.5 focus-within:border-[#b7ff00]">
        <Icon name="search" />
        <input autoFocus className="min-w-0 w-full border-0 bg-transparent text-xs text-[#f5f5ef] outline-none placeholder:text-[#79866b] max-[600px]:text-[10px]" type="search" placeholder="Headphones, frames, your next favourite…" value={query} onChange={event => onQueryChange(event.target.value)} aria-label="Search products" />
      </div>
      <div className="mt-4">
        {results.length ? results.map(product => (
          <button type="button" key={product.id} className="flex w-full items-center gap-[17px] border-b border-white/[.075] py-[13px] text-left hover:text-[#b7ff00]" onClick={() => onOpenProduct(product)}>
            <span className="relative block h-[78px] w-[75px] shrink-0 overflow-hidden"><ProductImage product={product} /></span>
            <span><strong className="block text-[13px] font-medium">{product.name}</strong><small className="mt-[7px] block text-[10px] text-[#8c9980]">{product.category} · {formatPrice(product.price)}</small></span>
            <Icon name="arrow" className="ml-auto w-4" />
          </button>
        )) : <p className="py-[25px] text-[13px] text-[#a9b39d]">No finds for “{query}”. Try “tech”, “tee”, or “frames”.</p>}
      </div>
    </div>
  );
}

function BagPanel({ bag, bagCount, subtotal, onClose, onQuantityChange }: { bag: BagItem[]; bagCount: number; subtotal: number; onClose: () => void; onQuantityChange: (id: Product["id"], size: string, delta: number) => void }) {
  return (
    <div className={panelClass}>
      <span className={eyebrowClass}>EXCELLENT TASTE.</span>
      <h2 className="mb-[27px] mt-[18px] text-[37px] font-semibold leading-[1.1] tracking-[-1.5px] max-[600px]:text-[32px]">Your bag. <span className="text-[#7e896e]">({bagCount})</span></h2>
      {bag.length ? <>
        <div>{bag.map(item => {
          const product = products.find(entry => entry.id === item.id)!;
          return (
            <div className="flex items-center gap-[15px] border-b border-white/10 py-[18px] max-[600px]:gap-2.5" key={`${item.id}-${item.size}`}>
              <span className="relative block h-[78px] w-[75px] shrink-0 overflow-hidden max-[600px]:h-[75px] max-[600px]:w-[58px]"><ProductImage product={product} /></span>
              <div className="flex-1"><h3 className="mb-1.5 text-xs font-medium max-[600px]:text-[10px]">{product.name}</h3><p className="mb-2.5 text-[10px] text-[#919c84] max-[600px]:text-[8px]">{item.size} · {formatPrice(product.price)}</p><div className="inline-flex items-center gap-[9px] border border-[#48523c] text-[10px]"><button type="button" className="grid size-[25px] place-items-center hover:text-[#b7ff00] [&>svg]:size-[11px]" onClick={() => onQuantityChange(item.id, item.size, -1)} aria-label={`Remove one ${product.name}`}><Icon name="minus" /></button><span>{item.quantity}</span><button type="button" className="grid size-[25px] place-items-center hover:text-[#b7ff00] [&>svg]:size-[11px]" onClick={() => onQuantityChange(item.id, item.size, 1)} aria-label={`Add one ${product.name}`}><Icon name="plus" /></button></div></div>
              <span className="text-[11px] max-[600px]:text-[9px]">{formatPrice(product.price * item.quantity)}</span>
            </div>
          );
        })}</div>
        <div className="my-[25px] flex justify-between text-base"><span>Subtotal</span><strong className="font-medium">{formatPrice(subtotal)}</strong></div>
        <p className="mb-5 bg-[#202817] p-3.5 text-[11px] leading-[1.7] text-[#909f80]">This is a collection preview. Your bag is saved on this device; checkout isn&apos;t available yet.</p>
        <PrimaryButton className="w-full" onClick={onClose}>Keep discovering <Icon name="arrow" /></PrimaryButton>
      </> : (
        <div className="pb-[15px] pt-[30px] text-center [&>svg]:mx-auto [&>svg]:mb-[22px] [&>svg]:size-[38px] [&>svg]:text-[#b7ff00]">
          <Icon name="bag" /><h3 className="text-lg font-medium">A little room for something good.</h3><p className="mb-[25px] mt-[13px] text-xs text-[#94a085]">Your next favourite is waiting in the collection.</p><a href="#collection" onClick={onClose} className={primaryButtonClass}>Explore the collection <Icon name="arrow" /></a>
        </div>
      )}
    </div>
  );
}
