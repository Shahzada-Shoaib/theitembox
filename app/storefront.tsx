"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Brand, Icon } from "./brand";
import { products, formatPrice, type Product } from "./products";
import { useBag } from "./use-bag";
import { useCartFlight } from "./use-cart-flight";
type Panel = "search" | "bag" | "menu" | null;

function ProductImage({ product, priority = false }: { product: Product; priority?: boolean }) {
  return <Image src={product.image} alt={product.subtitle} fill unoptimized sizes="(max-width: 600px) 50vw, 350px" priority={priority} loading={priority ? undefined : "eager"} className={`product-image image-${product.id}`} />;
}

export default function Storefront() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerBagRef = useRef<HTMLButtonElement>(null);
  const floatingBagRef = useRef<HTMLButtonElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [panel, setPanelState] = useState<Panel>(null);
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
    if (dialogOpen) {
      dialog.showModal();
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = previous; dialog.close(); };
    }
    dialog.close();
  }, [dialogOpen]);

  function setPanel(next: Panel) { setPanelState(next); }

  function openProduct(product: Product) { setSelected(product); setSize("M"); setPanel(null); }
  function closeDialog() { setPanel(null); setSelected(null); }

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
      // Audio is optional; adding to the bag must keep working if playback is unavailable.
    }
  }

  function addToBag(product: Product, source: HTMLElement | null) {
    playAddToBagSound();
    const chosenSize = product.category === "Apparel" ? size : "One size";
    setBag(current => {
      const match = current.find(item => item.id === product.id && item.size === chosenSize);
      return match ? current.map(item => item === match ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item) : [...current, { id: product.id, size: chosenSize, quantity: 1 }];
    });
    const bagButton = showFloatingBag ? floatingBagRef.current : headerBagRef.current;
    try {
      flyToBag(source, bagButton?.querySelector<HTMLElement>(".bag-flight-target") ?? bagButton);
    } catch (error) {
      // Visual feedback must never interrupt the cart update or leave the dialog open.
      console.warn("The bag was updated, but the flight animation could not start.", error);
    }
    setToast(`${product.name} added to your bag`);
    closeDialog();
  }

  function changeQuantity(id: string, itemSize: string, delta: number) {
    setBag(current => current.map(item => item.id === id && item.size === itemSize ? { ...item, quantity: Math.min(99, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  }

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bag.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price ?? 0) * item.quantity, 0);
  const filteredProducts = products.filter(p => filter === "All items" || p.category === filter);
  const searchResults = products.filter(p => `${p.name} ${p.category} ${p.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <a className="skip-link" href="#collection">Skip to collection</a>
    <main>
      <section className="scroll-story" id="top" aria-label="The Item Box collection film">
        <div className="cinema-stage">
          <video className="hero-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true">
            <source src="/home.mp4" type="video/mp4" />
          </video>
          <h1 className="sr-only">The Item Box — The collection film</h1>
          <header className="site-header">
            <a href="#top" className="brand-link" aria-label="The Item Box home"><Brand /></a>
            <nav className="desktop-nav" aria-label="Main navigation"><a href="#collection">The collection <span className="nav-count">04</span></a><a href="#about">Our world</a></nav>
            <div className="header-actions"><button className="icon-button search-button" aria-label="Search the collection" onClick={() => { setQuery(""); setPanel("search"); }}><Icon name="search" /></button><span className="header-divider" /><button ref={headerBagRef} className="bag-button" onClick={() => setPanel("bag")} aria-label={`Open bag, ${bagCount} items`}><span className="bag-flight-target"><Icon name="bag" /></span><span>Bag</span><span className="bag-count">{bagCount.toString().padStart(2, "0")}</span></button><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setPanel("menu")}><Icon name="menu" /></button></div>
          </header>
        </div>
      </section>
      <section className="collection-section" id="collection">
        <div className="section-overline"><span><span className="status-dot" /> THE CURATED COLLECTION</span><span>01 — 04 / EVERYDAY ORIGINALS</span></div>
        <div className="collection-heading"><h2>YOUR NEXT<br /><span>GOOD FIND.</span></h2><p>Small details. Big personality.<br />A few things we think you&apos;ll love.</p></div>
        <div className="collection-toolbar"><div className="filter-tabs" aria-label="Filter collection">{["All items", "Tech", "Accessories", "Apparel"].map(category => <button key={category} className={filter === category ? "active" : ""} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}{category === "All items" && <span>04</span>}</button>)}</div><span className="results-count">{filteredProducts.length.toString().padStart(2, "0")} GOOD FINDS</span></div>
        <div className="product-grid">{filteredProducts.map((product, index) => <article className="collection-product" key={product.id}><div className="collection-image"><button className="product-image-button" onClick={() => openProduct(product)} aria-label={`View ${product.name}`}><ProductImage product={product} /><span className="product-number">0{products.indexOf(product) + 1}</span>{index === 0 && <span className="product-badge">THE EDIT</span>}</button><button className="product-quick-add" aria-label={product.category === "Apparel" ? `Choose size for ${product.name}` : `Add ${product.name} to bag`} onClick={event => product.category === "Apparel" ? openProduct(product) : addToBag(product, event.currentTarget.closest(".collection-image"))}><Icon name="plus" /></button></div><button className="product-info-button" onClick={() => openProduct(product)}><span className="product-info"><span><span className="product-category">{product.category}</span><span className="product-name">{product.name}</span></span><span className="product-price">{formatPrice(product.price)}</span></span><span className="product-color"><span style={{ background: product.id === "sound" ? "#252525" : product.id === "frames" ? "#aa9877" : "#e8e6df" }} />{product.color}</span></button></article>)}</div>
        <p className="collection-note">A preview of what&apos;s inside. Sample products & pricing.</p>
      </section>
      <section className="about-section" id="about"><div className="about-mark"><Brand compact /><span>EST. FOR THE EVERYDAY.</span></div><div className="about-copy"><span className="eyebrow">NOT JUST THINGS. YOUR THINGS.</span><h2>A little less ordinary.<br />A little more <em>you.</em></h2><p>We&apos;re The Item Box. A home for everyday pieces with a point of view. The things you wear, the things you carry, the things that become part of your story. Thoughtfully brought together. Ready to make your own.</p><a href="#collection" className="text-link">Find your thing <Icon name="arrow" /></a></div></section>
      <footer className="site-footer"><a href="#top" aria-label="Back to top"><Brand /></a><span>© {new Date().getFullYear()} THE ITEM BOX</span><a href="#top" className="back-top">BACK TO TOP <Icon name="arrow" /></a></footer>
    </main>
    <button ref={floatingBagRef} className={`bag-button floating-bag ${showFloatingBag ? "is-visible" : ""}`} aria-label={`Open bag, ${bagCount} items`} aria-hidden={!showFloatingBag} tabIndex={showFloatingBag ? 0 : -1} onClick={() => setPanel("bag")}><span className="bag-flight-target"><Icon name="bag" /></span><span>Bag</span><span className="bag-count">{bagCount.toString().padStart(2, "0")}</span></button>
    <dialog ref={dialogRef} className={`shop-dialog ${selected ? "product-dialog" : ""}`} onCancel={closeDialog} onClick={event => { if (event.target === event.currentTarget) closeDialog(); }} aria-label={selected?.name ?? (panel === "bag" ? "Your shopping bag" : panel === "search" ? "Search collection" : "Navigation menu")}>
      <div className="dialog-content"><button className="dialog-close icon-button" onClick={closeDialog} aria-label="Close dialog"><Icon name="close" /></button>
        {selected && <div className="product-detail"><div className="detail-image"><ProductImage product={selected} /><span className="detail-image-label">THE ITEM BOX / THE EVERYDAY EDIT</span></div><div className="detail-copy"><span className="eyebrow">{selected.tag}</span><h2>{selected.name}</h2><span className="detail-price">{formatPrice(selected.price)}</span><p>{selected.description}</p><div className="detail-color">COLOR <span>{selected.color}</span></div>{selected.category === "Apparel" && <fieldset className="size-picker"><legend>SELECT SIZE</legend>{["S", "M", "L", "XL"].map(s => <button key={s} className={size === s ? "selected" : ""} onClick={() => setSize(s)} aria-pressed={size === s}>{s}</button>)}</fieldset>}<button className="primary-button add-to-bag" onClick={() => addToBag(selected, dialogRef.current?.querySelector(".detail-image") ?? null)}>Add to bag <Icon name="plus" /></button><span className="preview-note">Collection preview · sample product and pricing</span></div></div>}
        {panel === "search" && <div className="panel-inner"><span className="eyebrow">SOMETHING GOOD IS IN HERE.</span><h2>Find your thing.</h2><div className="search-field"><Icon name="search" /><input autoFocus type="search" placeholder="Headphones, frames, your next favourite…" value={query} onChange={event => setQuery(event.target.value)} aria-label="Search products" /></div><div className="search-results">{searchResults.length ? searchResults.map(product => <button key={product.id} className="search-result" onClick={() => openProduct(product)}><span className="result-image"><ProductImage product={product} /></span><span><strong>{product.name}</strong><small>{product.category} · {formatPrice(product.price)}</small></span><Icon name="arrow" /></button>) : <p className="empty-message">No finds for “{query}”. Try “tech”, “tee”, or “frames”.</p>}</div></div>}
        {panel === "bag" && <div className="panel-inner bag-panel"><span className="eyebrow">EXCELLENT TASTE.</span><h2>Your bag. <span>({bagCount})</span></h2>{bag.length ? <><div className="bag-items">{bag.map(item => { const product = products.find(p => p.id === item.id)!; return <div className="bag-item" key={`${item.id}-${item.size}`}><span className="result-image"><ProductImage product={product} /></span><div className="bag-item-copy"><h3>{product.name}</h3><p>{item.size} · {formatPrice(product.price)}</p><div className="quantity-control"><button onClick={() => changeQuantity(item.id, item.size, -1)} aria-label={`Remove one ${product.name}`}><Icon name="minus" /></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, item.size, 1)} aria-label={`Add one ${product.name}`}><Icon name="plus" /></button></div></div><span>{formatPrice(product.price * item.quantity)}</span></div>; })}</div><div className="bag-total"><span>Subtotal</span><strong>{formatPrice(subtotal)}</strong></div><p className="bag-disclaimer">This is a collection preview. Your bag is saved on this device; checkout isn&apos;t available yet.</p><button className="primary-button" onClick={closeDialog}>Keep discovering <Icon name="arrow" /></button></> : <div className="empty-bag"><Icon name="bag" /><h3>A little room for something good.</h3><p>Your next favourite is waiting in the collection.</p><a href="#collection" onClick={closeDialog} className="primary-button">Explore the collection <Icon name="arrow" /></a></div>}</div>}
        {panel === "menu" && <nav className="panel-inner menu-links" aria-label="Mobile navigation"><Brand /><a href="#collection" onClick={closeDialog}>The collection <Icon name="arrow" /></a><a href="#about" onClick={closeDialog}>Our world <Icon name="arrow" /></a><button onClick={() => setPanel("search")}>Search <Icon name="search" /></button></nav>}
      </div>
    </dialog>
    <div className={`toast ${toast ? "visible" : ""}`} role="status"><Icon name="check" />{toast}</div>
  </>;
}
