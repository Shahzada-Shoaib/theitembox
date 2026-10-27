"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type RefObject } from "react";
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

const panelClass = "px-10 pb-11 pt-14 max-[600px]:px-[22px] max-[600px]:pb-7 max-[600px]:pt-[62px]";
const eyebrowClass = "flex items-center gap-[11px] text-[8px] font-medium tracking-[2.3px] text-[#b7ff00] max-[600px]:text-[7px] max-[600px]:tracking-[1.6px]";

export function ShopDialog({ dialogRef, panel, selected, query, bag, bagCount, subtotal, searchResults, onClose, onOpenProduct, onPanelChange, onQueryChange, onQuantityChange }: ShopDialogProps) {
  const [closing, setClosing] = useState(false);
  const [sizeChartPhase, setSizeChartPhase] = useState<"closed" | "open" | "closing">("closed");
  const closeTimerRef = useRef<number>(0);
  const sizeChartDialogRef = useRef<HTMLDialogElement>(null);
  const label = selected?.name ?? (panel === "bag" ? "Your shopping bag" : panel === "search" ? "Search collection" : "Navigation menu");

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  function requestClose() {
    if (closing) return;
    setClosing(true);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      onClose();
    }, 760);
  }

  function openSizeChart() {
    const chartDialog = sizeChartDialogRef.current;
    if (chartDialog && !chartDialog.open) chartDialog.showModal();
    setSizeChartPhase("open");
  }

  useEffect(() => {
    const chartDialog = sizeChartDialogRef.current;
    if (sizeChartPhase === "closed" && chartDialog?.open) chartDialog.close();
  }, [sizeChartPhase]);

  useEffect(() => {
    if (sizeChartPhase === "closed") return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setSizeChartPhase("closing");
    };
    const closeTimer = sizeChartPhase === "closing" ? window.setTimeout(() => setSizeChartPhase("closed"), 1200) : 0;
    window.addEventListener("keydown", closeOnEscape, true);
    return () => {
      window.removeEventListener("keydown", closeOnEscape, true);
      if (closeTimer) window.clearTimeout(closeTimer);
    };
  }, [sizeChartPhase]);

  return (
    <>
      <dialog
        ref={dialogRef}
        className={`shop-dialog fixed m-auto max-h-[calc(100svh-40px)] overflow-auto border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-lg max-[600px]:max-h-[calc(100svh-16px)] ${closing ? "is-closing" : ""} ${selected ? "w-[1000px] max-w-[min(1000px,calc(100vw-32px))] border-[#d5d5ce] bg-[#efefeb] text-[#171914] max-[600px]:max-w-[calc(100vw-16px)]" : "w-[650px] max-w-[min(650px,calc(100vw-32px))] border-[#404438] bg-[#141710] text-[#f6f6ed] max-[600px]:max-w-[calc(100vw-16px)]"}`}
        onCancel={event => { event.preventDefault(); requestClose(); }}
        onClick={event => { if (event.target === event.currentTarget) requestClose(); }}
        aria-label={label}
      >
        <div className="relative">
          <IconButton label="Close dialog" icon="close" className={`absolute right-[15px] top-[15px] z-[5] rounded-full ${selected ? "border border-[#c9c9c1] bg-[#f7f7f3]/90 text-[#171914] shadow-[0_8px_24px_#34352f14] backdrop-blur-md hover:bg-white" : "border border-[#4c5240] bg-[#141710]"}`} onClick={requestClose} />
          {selected && <ProductDetails key={selected.id} product={selected} onOpenSizeChart={openSizeChart} />}
          {panel === "search" && <SearchPanel query={query} results={searchResults} onQueryChange={onQueryChange} onOpenProduct={onOpenProduct} />}
          {panel === "bag" && <BagPanel bag={bag} bagCount={bagCount} subtotal={subtotal} onClose={requestClose} onQuantityChange={onQuantityChange} />}
          {panel === "menu" && (
            <nav className={`${panelClass} flex flex-col gap-1.5 [&_.brand]:mb-7`} aria-label="Mobile navigation">
              <Brand />
              <a className="flex min-h-14 items-center justify-between border-b border-[#4c573b] py-[15px] text-left text-[clamp(21px,7vw,25px)]" href="#collection" onClick={onClose}>The collection <Icon name="arrow" /></a>
              <button type="button" className="flex min-h-14 items-center justify-between border-b border-[#4c573b] py-[15px] text-left text-[clamp(21px,7vw,25px)]" onClick={() => onPanelChange("search")}>Search <Icon name="search" /></button>
            </nav>
          )}
        </div>
      </dialog>

      <dialog
        ref={sizeChartDialogRef}
        className={`size-chart-dialog ${sizeChartPhase === "closing" ? "is-closing" : ""}`}
        aria-label="T-shirt size chart"
        onCancel={event => { event.preventDefault(); setSizeChartPhase("closing"); }}
      >
        {sizeChartPhase !== "closed" && (
          <div className={`size-chart-overlay ${sizeChartPhase === "closing" ? "is-closing" : ""}`} onClick={event => { if (event.target === event.currentTarget) setSizeChartPhase("closing"); }}>
            <button autoFocus type="button" className="size-chart-close" onClick={() => setSizeChartPhase("closing")} aria-label="Close size chart"><Icon name="close" /></button>
            <div className="size-chart-card" onAnimationEnd={event => { if (event.target === event.currentTarget && sizeChartPhase === "closing") setSizeChartPhase("closed"); }}>
              <Image src="/size-chart.svg" alt="Relaxed T-shirt size chart with measurements in inches" width={900} height={980} />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

type ProductDetailsProps = {
  product: Product;
  onOpenSizeChart: () => void;
};

function ProductDetails({ product, onOpenSizeChart }: ProductDetailsProps) {
  const [activeImage, setActiveImage] = useState(product.image);
  const [zoom, setZoom] = useState(1);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const [pinching, setPinching] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const gestureRef = useRef({ distance: 0, zoom: 1 });

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const distanceBetween = (touches: TouchList) => Math.hypot(
      touches[1].clientX - touches[0].clientX,
      touches[1].clientY - touches[0].clientY,
    );

    const startPinch = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !window.matchMedia("(max-width: 600px)").matches) return;
      const bounds = image.getBoundingClientRect();
      const midpointX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const midpointY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      setZoomOrigin(`${((midpointX - bounds.left) / bounds.width) * 100}% ${((midpointY - bounds.top) / bounds.height) * 100}%`);
      gestureRef.current = { distance: distanceBetween(event.touches), zoom: zoomRef.current };
      setPinching(true);
    };

    const movePinch = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !gestureRef.current.distance) return;
      event.preventDefault();
      const nextZoom = Math.min(2.5, Math.max(1, gestureRef.current.zoom * distanceBetween(event.touches) / gestureRef.current.distance));
      zoomRef.current = nextZoom;
      setZoom(nextZoom);
    };

    const endPinch = (event: TouchEvent) => {
      if (event.touches.length >= 2) return;
      gestureRef.current.distance = 0;
      setPinching(false);
    };

    image.addEventListener("touchstart", startPinch, { passive: true });
    image.addEventListener("touchmove", movePinch, { passive: false });
    image.addEventListener("touchend", endPinch, { passive: true });
    image.addEventListener("touchcancel", endPinch, { passive: true });
    return () => {
      image.removeEventListener("touchstart", startPinch);
      image.removeEventListener("touchmove", movePinch);
      image.removeEventListener("touchend", endPinch);
      image.removeEventListener("touchcancel", endPinch);
    };
  }, []);

  function selectImage(image: string) {
    zoomRef.current = 1;
    gestureRef.current.distance = 0;
    setZoom(1);
    setZoomOrigin("50% 50%");
    setPinching(false);
    setActiveImage(image);
  }

  const baseScale = activeImage === product.image ? 1.32 : 1;

  return (
    <div className="product-detail-surface w-full text-[#171914]">
      <section className="detail-gallery" aria-label={`${product.name} image gallery`}>
        <div className="detail-brand"><Brand compact /><span>{product.collection} / 2026</span></div>
        <div ref={imageRef} className="detail-active-image">
          <ProductImage
            product={product}
            image={activeImage}
            sizes="(max-width: 600px) 92vw, 620px"
            className={`transition-transform ${pinching ? "duration-0" : "duration-300"}`}
            style={{ transform: `scale(${baseScale * zoom})`, transformOrigin: zoomOrigin }}
          />
        </div>
        <div className="detail-thumbnails" role="group" aria-label="Choose product image">
          {product.gallery.map((image, index) => (
            <button
              type="button"
              key={image}
              className={activeImage === image ? "is-active" : ""}
              onClick={() => selectImage(image)}
              aria-label={`Show image ${index + 1} of ${product.gallery.length}`}
              aria-pressed={activeImage === image}
            >
              <ProductImage product={product} image={image} alt="" sizes="64px" />
            </button>
          ))}
        </div>
      </section>

      <aside className="detail-copy">
        <span className="detail-tag">{product.tag}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <strong className="detail-price">{formatPrice(product.price)}</strong>
        <dl>
          <div><dt>COLOR</dt><dd>{product.color}</dd></div>
          <div><dt>FIT</dt><dd>{product.fit}</dd></div>
          <div><dt>TYPE</dt><dd>{product.category}</dd></div>
        </dl>
        <div className="detail-sizes" aria-label="Available sizes">
          <span className="detail-sizes-heading">
            <span>AVAILABLE SIZES</span>
            <button type="button" onClick={onOpenSizeChart}>SIZE CHART</button>
          </span>
          <div>{product.sizes.map(size => <span key={size}>{size}</span>)}</div>
        </div>
      </aside>
    </div>
  );
}

function SearchPanel({ query, results, onQueryChange, onOpenProduct }: { query: string; results: Product[]; onQueryChange: (query: string) => void; onOpenProduct: (product: Product) => void }) {
  return (
    <div className={panelClass}>
      <span className={eyebrowClass}>SOMETHING GOOD IS IN HERE.</span>
      <h2 className="mb-8 mt-5 text-[40px] font-semibold leading-[1.08] tracking-[-1.7px] max-[600px]:mb-7 max-[600px]:text-[32px]">Find your thing.</h2>
      <div className="flex items-center gap-3.5 border-b border-[#6a7853] py-4 focus-within:border-[#b7ff00]">
        <Icon name="search" />
        <input autoFocus className="min-w-0 w-full border-0 bg-transparent text-xs text-[#f5f5ef] outline-none placeholder:text-[#79866b] max-[600px]:text-base" type="search" placeholder="Headphones, frames, your next favourite…" value={query} onChange={event => onQueryChange(event.target.value)} aria-label="Search products" />
      </div>
      <div className="mt-4">
        {results.length ? results.map(product => (
          <button type="button" key={product.id} className="flex w-full items-center gap-5 border-b border-white/[.075] py-4 text-left hover:text-[#b7ff00] max-[600px]:gap-4" onClick={() => onOpenProduct(product)}>
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
      <h2 className="mb-8 mt-5 text-[40px] font-semibold leading-[1.08] tracking-[-1.7px] max-[600px]:mb-7 max-[600px]:text-[32px]">Your bag. <span className="text-[#7e896e]">({bagCount})</span></h2>
      {bag.length ? <>
        <div>{bag.map(item => {
          const product = products.find(entry => entry.id === item.id)!;
          return (
            <div className="flex items-center gap-[15px] border-b border-white/10 py-[18px] max-[600px]:gap-2.5" key={`${item.id}-${item.size}`}>
              <span className="relative block h-[78px] w-[75px] shrink-0 overflow-hidden max-[600px]:h-[75px] max-[600px]:w-[58px]"><ProductImage product={product} /></span>
              <div className="flex-1"><h3 className="mb-1.5 text-xs font-medium">{product.name}</h3><p className="mb-2.5 text-[10px] text-[#919c84]">{item.size} · {formatPrice(product.price)}</p><div className="inline-flex items-center gap-2 border border-[#48523c] text-[10px]"><button type="button" className="grid size-9 place-items-center hover:text-[#b7ff00] [&>svg]:size-[12px]" onClick={() => onQuantityChange(item.id, item.size, -1)} aria-label={`Remove one ${product.name}`}><Icon name="minus" /></button><span>{item.quantity}</span><button type="button" className="grid size-9 place-items-center hover:text-[#b7ff00] [&>svg]:size-[12px]" onClick={() => onQuantityChange(item.id, item.size, 1)} aria-label={`Add one ${product.name}`}><Icon name="plus" /></button></div></div>
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
