"use client";

import { useEffect, useRef, useState } from "react";
import { SiteFooter } from "./site-footer";
import { Icon } from "./brand";
import { CollectionSection } from "./collection-section";
import { HeroSection } from "./hero-section";
import { LookbookSection } from "./lookbook-section";
import { collectionProducts, heroProducts, lookbookProducts, products, reelProducts, sliderProducts, type Product } from "./products";
import { ProductReel } from "./product-reel";
import { ShopDialog, type Panel } from "./shop-dialog";
import { TeeSlider } from "./tee-slider";
import { useBag } from "./use-bag";
import { useCartFlight } from "./use-cart-flight";

export default function Storefront() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerBagRef = useRef<HTMLButtonElement>(null);
  const floatingBagRef = useRef<HTMLButtonElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [size, setSize] = useState("M");
  const [filter, setFilter] = useState("All items");
  const [query, setQuery] = useState("");
  const [bag, setBag] = useBag();
  const [toast, setToast] = useState("");
  const [showFloatingBag, setShowFloatingBag] = useState(false);
  const flyToBag = useCartFlight(false);

  useEffect(() => {
    const button = headerBagRef.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setShowFloatingBag(!entry.isIntersecting), { threshold: 0 });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  const dialogOpen = Boolean(panel || selected);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialogOpen) {
      dialog.close();
      return;
    }
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      dialog.close();
    };
  }, [dialogOpen]);

  function openPanel(next: Panel) {
    setSelected(null);
    setPanel(next);
  }

  function openProduct(product: Product) {
    setSelected(product);
    setSize("M");
    setPanel(null);
  }

  function closeDialog() {
    setPanel(null);
    setSelected(null);
  }

  function playAddToBagSound() {
    if (typeof window === "undefined" || !window.AudioContext) return;
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;
      const playChime = () => {
        const startAt = context.currentTime + 0.015;
        for (const note of [
          { frequency: 740, delay: 0, duration: 0.2, volume: 0.025 },
          { frequency: 990, delay: 0.065, duration: 0.27, volume: 0.018 },
        ]) {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.setValueAtTime(note.frequency, startAt + note.delay);
          gain.gain.setValueAtTime(0.0001, startAt + note.delay);
          gain.gain.exponentialRampToValueAtTime(note.volume, startAt + note.delay + 0.012);
          gain.gain.exponentialRampToValueAtTime(0.0001, startAt + note.delay + note.duration);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start(startAt + note.delay);
          oscillator.stop(startAt + note.delay + note.duration + 0.02);
        }
      };
      if (context.state === "suspended") void context.resume().then(playChime).catch(() => undefined);
      else playChime();
    } catch {
      // Sound is optional; the bag update should always continue.
    }
  }

  function addToBag(product: Product, source: HTMLElement | null) {
    playAddToBagSound();
    const chosenSize = product.category === "Apparel" ? size : "One size";
    setBag(current => {
      const match = current.find(item => item.id === product.id && item.size === chosenSize);
      return match
        ? current.map(item => item === match ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item)
        : [...current, { id: product.id, size: chosenSize, quantity: 1 }];
    });
    const bagButton = showFloatingBag ? floatingBagRef.current : headerBagRef.current;
    try {
      flyToBag(source, bagButton?.querySelector<HTMLElement>(".bag-flight-target") ?? bagButton);
    } catch (error) {
      console.warn("The bag was updated, but the flight animation could not start.", error);
    }
    setToast(`${product.name} added to your bag`);
    closeDialog();
  }

  function changeQuantity(id: Product["id"], itemSize: string, delta: number) {
    setBag(current => current.map(item => item.id === id && item.size === itemSize ? { ...item, quantity: Math.min(99, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  }

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bag.reduce((sum, item) => sum + (products.find(product => product.id === item.id)?.price ?? 0) * item.quantity, 0);
  const searchResults = products.filter(product => `${product.name} ${product.category} ${product.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <a className="fixed left-5 -top-[70px] z-[100] bg-[#b7ff00] px-[25px] py-[15px] text-[#0b0b0b] focus:top-3" href="#collection">Skip to collection</a>
    <main>
      <HeroSection products={heroProducts} bagCount={bagCount} bagButtonRef={headerBagRef} onOpenProduct={openProduct} onOpenBag={() => openPanel("bag")} onOpenMenu={() => openPanel("menu")} onOpenSearch={() => { setQuery(""); openPanel("search"); }} />
      <TeeSlider products={sliderProducts} onOpenProduct={openProduct} />
      <ProductReel products={reelProducts} onOpenProduct={openProduct} />
      <CollectionSection products={collectionProducts} filter={filter} onFilterChange={setFilter} onOpenProduct={openProduct} onQuickAdd={addToBag} />
      <LookbookSection products={lookbookProducts} onOpenProduct={openProduct} />
      <SiteFooter />
    </main>
    <button ref={floatingBagRef} type="button" className={`fixed right-[4.1%] top-[max(24px,env(safe-area-inset-top))] z-50 flex min-h-[54px] items-center gap-[11px] rounded-[50px] border border-white/15 bg-[#141710ed] px-[17px] py-3 text-xs text-[#f6f6f2] shadow-[0_8px_28px_#00000024] backdrop-blur-2xl transition-[opacity,visibility] duration-200 hover:border-[#b7ff0060] max-[600px]:right-[6%] max-[600px]:top-[max(16px,env(safe-area-inset-top))] max-[600px]:min-h-12 max-[600px]:gap-[7px] max-[600px]:px-3.5 max-[600px]:py-2.5 max-[600px]:text-[11px] ${showFloatingBag ? "visible pointer-events-auto opacity-100" : "invisible pointer-events-none opacity-0"}`} aria-label={`Open bag, ${bagCount} items`} aria-hidden={!showFloatingBag} tabIndex={showFloatingBag ? 0 : -1} onClick={() => openPanel("bag")}>
      <span className="bag-flight-target grid size-[26px] shrink-0 place-items-center rounded-full [&>svg]:size-[19px]"><Icon name="bag" /></span><span>Bag</span><span className="grid size-[26px] place-items-center rounded-full border border-[#b7ff0045] text-[10px] text-[#b7ff00] max-[600px]:size-[22px] max-[600px]:text-[9px]">{bagCount.toString().padStart(2, "0")}</span>
    </button>
    <ShopDialog dialogRef={dialogRef} panel={panel} selected={selected} query={query} bag={bag} bagCount={bagCount} subtotal={subtotal} searchResults={[...searchResults]} onClose={closeDialog} onOpenProduct={openProduct} onPanelChange={openPanel} onQueryChange={setQuery} onQuantityChange={changeQuantity} />
    <div className={`fixed bottom-[25px] left-1/2 z-[100] flex w-max max-w-[calc(100vw-30px)] -translate-x-1/2 items-center gap-3 bg-[#d0ff58] px-[22px] py-[17px] text-xs text-[#19230a] shadow-[0_8px_30px_#0005] transition duration-200 max-[600px]:px-[18px] max-[600px]:py-3.5 max-[600px]:text-[10px] ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-5 opacity-0"}`} role="status"><Icon name="check" />{toast}</div>
  </>;
}
