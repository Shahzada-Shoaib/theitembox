"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { Brand, Icon } from "./brand";
import { products, formatPrice, type Product } from "./products";
import { useBag } from "./use-bag";
import { useCartFlight } from "./use-cart-flight";

// Preserve the complete supplied film, including its opening frame.
const FILM_START = 0;
// Version the media URL and remount its element so an open tab drops its old buffer.
const FILM_SOURCE = "/download.mp4?v=52abfa9e34a2";
const FILM_POSTER = "/images/download-poster.jpg?v=52abfa9e34a2";
const clamp = (n: number) => Math.min(1, Math.max(0, n));
type Panel = "search" | "bag" | "menu" | null;

function ProductImage({ product, priority = false }: { product: Product; priority?: boolean }) {
  return <Image src={product.image} alt={product.subtitle} fill unoptimized sizes="(max-width: 600px) 50vw, 350px" priority={priority} loading={priority ? undefined : "eager"} className={`product-image image-${product.id}`} />;
}

export default function Storefront() {
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const headerBagRef = useRef<HTMLButtonElement>(null);
  const floatingBagRef = useRef<HTMLButtonElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackRef = useRef(0);
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [panel, setPanelState] = useState<Panel>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [size, setSize] = useState("M");
  const [filter, setFilter] = useState("All items");
  const [query, setQuery] = useState("");
  const [bag, setBag] = useBag();
  const [toast, setToast] = useState("");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showFloatingBag, setShowFloatingBag] = useState(false);
  const flyToBag = useCartFlight();

  useEffect(() => {
    const button = headerBagRef.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => setShowFloatingBag(!entry.isIntersecting), { threshold: 0 });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);

  const stopPlayback = useCallback(() => {
    cancelAnimationFrame(playbackRef.current);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const section = storyRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    let frame = 0;
    let targetTime = FILM_START;
    const seek = () => {
      if (video.readyState >= 1 && !video.seeking && Math.abs(video.currentTime - targetTime) > 0.025) video.currentTime = targetTime;
    };
    const update = () => {
      frame = 0;
      const p = clamp(-section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - window.innerHeight));
      progressRef.current = p;
      setProgress(p);
      if (Number.isFinite(video.duration)) {
        targetTime = FILM_START + p * Math.max(0, video.duration - FILM_START - 0.04);
        if (!reducedMotion) seek();
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    const onMetadata = () => { video.pause(); video.currentTime = FILM_START; update(); };
    video.addEventListener("loadedmetadata", onMetadata);
    video.addEventListener("seeked", seek);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    window.addEventListener("wheel", stopPlayback, { passive: true });
    window.addEventListener("touchstart", stopPlayback, { passive: true });
    window.addEventListener("keydown", stopPlayback);
    // Updating a nested <source> alone does not reload an already selected resource.
    // Explicitly load the active source after registering the scrubbing listeners.
    video.load();
    update();
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(playbackRef.current);
      video.removeEventListener("loadedmetadata", onMetadata);
      video.removeEventListener("seeked", seek);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("wheel", stopPlayback);
      window.removeEventListener("touchstart", stopPlayback);
      window.removeEventListener("keydown", stopPlayback);
    };
  }, [reducedMotion, stopPlayback]);

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

  function setPanel(next: Panel) { stopPlayback(); setPanelState(next); }

  function seekTo(p: number) {
    const section = storyRef.current;
    if (!section) return;
    if (reducedMotion) {
      document.querySelector("#collection")?.scrollIntoView({ behavior: "instant" });
      return;
    }
    window.scrollTo({ top: section.offsetTop + p * (section.offsetHeight - window.innerHeight), behavior: "instant" });
  }

  function togglePlayback() {
    if (isPlaying) { stopPlayback(); return; }
    setIsPlaying(true);
    const startProgress = progressRef.current >= 0.99 ? 0 : progressRef.current;
    const start = performance.now();
    const animate = (time: number) => {
      const p = clamp(startProgress + (time - start) / 14000);
      seekTo(p);
      if (p < 1) playbackRef.current = requestAnimationFrame(animate);
      else setIsPlaying(false);
    };
    playbackRef.current = requestAnimationFrame(animate);
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setToast("Fullscreen is unavailable in this browser. The film already fills your screen.");
    } catch { setToast("Fullscreen is unavailable in this browser."); }
  }

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
    const bagButton = showFloatingBag ? floatingBagRef.current : headerBagRef.current;
    flyToBag(source, bagButton?.querySelector<HTMLElement>(".bag-flight-target") ?? bagButton);
    const chosenSize = product.category === "Apparel" ? size : "One size";
    setBag(current => {
      const match = current.find(item => item.id === product.id && item.size === chosenSize);
      return match ? current.map(item => item === match ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item) : [...current, { id: product.id, size: chosenSize, quantity: 1 }];
    });
    setToast(`${product.name} added to your bag`);
    closeDialog();
  }

  function changeQuantity(id: string, itemSize: string, delta: number) {
    setBag(current => current.map(item => item.id === id && item.size === itemSize ? { ...item, quantity: Math.min(99, item.quantity + delta) } : item).filter(item => item.quantity > 0));
  }

  function cardStyle(index: number): CSSProperties {
    if (reducedMotion) return { opacity: 0, pointerEvents: "none", visibility: "hidden" };
    const starts = [0.015, 0.065, 0.19, 0.43];
    const ends = [0.52, 0.72, 1.12, 1.3];
    const entrance = clamp((progress - starts[index]) / 0.14);
    const exit = clamp((progress - ends[index] + 0.13) / 0.13);
    const visible = entrance * (1 - exit);
    return {
      opacity: visible,
      transform: `translate3d(${(index < 2 ? 1 : -1) * (1 - entrance) * 110}px, calc(${-progress * (index % 2 ? 58 : 95) + exit * -70} * var(--card-drift, 1px)), 0) rotate(${[7, -7, -6, 6][index] + progress * (index % 2 ? 7 : -8)}deg) scale(${0.92 + visible * 0.08})`,
      pointerEvents: visible > 0.65 ? "auto" : "none",
      visibility: visible === 0 ? "hidden" : "visible",
    };
  }

  const bagCount = bag.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = bag.reduce((sum, item) => sum + (products.find(p => p.id === item.id)?.price ?? 0) * item.quantity, 0);
  const chapter = progress < 0.3 ? 0 : progress < 0.68 ? 1 : 2;
  const filteredProducts = products.filter(p => filter === "All items" || p.category === filter);
  const searchResults = products.filter(p => `${p.name} ${p.category} ${p.subtitle}`.toLowerCase().includes(query.toLowerCase()));

  return <>
    <a className="skip-link" href="#collection">Skip to collection</a>
    <main>
      <section className="scroll-story" ref={storyRef} id="top" aria-label="The Item Box interactive lookbook">
        <div className="cinema-stage" ref={stageRef}>
          <video key={FILM_SOURCE} ref={videoRef} src={FILM_SOURCE} className="hero-video" muted playsInline preload="auto" poster={FILM_POSTER} onError={() => setVideoError(true)} aria-hidden="true" />
          <h1 className="sr-only">The Item Box — The collection film</h1>
          <header className="site-header">
            <a href="#top" className="brand-link" aria-label="The Item Box home"><Brand /></a>
            <nav className="desktop-nav" aria-label="Main navigation"><a href="#collection">The collection <span className="nav-count">04</span></a><button onClick={() => seekTo(0.45)}>The lookbook <span className="tiny-dot" /></button><a href="#about">Our world</a></nav>
            <div className="header-actions"><button className="icon-button search-button" aria-label="Search the collection" onClick={() => { setQuery(""); setPanel("search"); }}><Icon name="search" /></button><span className="header-divider" /><button ref={headerBagRef} className="bag-button" onClick={() => setPanel("bag")} aria-label={`Open bag, ${bagCount} items`}><span className="bag-flight-target"><Icon name="bag" /></span><span>Bag</span><span className="bag-count">{bagCount.toString().padStart(2, "0")}</span></button><button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setPanel("menu")}><Icon name="menu" /></button></div>
          </header>
          <div className="floating-products" aria-label="Featured products">{products.map((product, index) => <button key={product.id} className={`floating-card float-${index} ${index === 1 ? "card-dark" : ""}`} style={cardStyle(index)} onClick={() => openProduct(product)} tabIndex={Number(cardStyle(index).opacity) > 0.65 ? 0 : -1} aria-label={`View ${product.name}`}><div className="floating-card-top"><span>{index === 0 ? "IN THE SPOTLIGHT" : product.category.toUpperCase()}</span><Icon name="arrow" /></div><div className="floating-image"><ProductImage product={product} priority={index < 2} /></div><div className="floating-card-info"><div><h2>{product.name}</h2><span>{formatPrice(product.price)}</span></div><span className="card-plus"><Icon name="plus" /></span></div></button>)}</div>
          <div className="story-bottom">
            <div className="story-bottom-top"><button className="scroll-prompt" onClick={() => seekTo(Math.min(1, progress + 0.18))}><span className="scroll-icon"><Icon name="down" /></span><span>SCROLL TO UNBOX<span className="prompt-sub">A little discovery with every scroll</span></span></button><div className="chapter-links" aria-label="Film chapters">{["THE INTRO", "THE DETAILS", "THE COLLECTION"].map((label, index) => <button key={label} className={chapter === index ? "active" : ""} onClick={() => seekTo([0, 0.44, 0.86][index])}><span>0{index + 1}</span> {label}</button>)}</div><div className="film-controls"><button className="icon-button" onClick={togglePlayback} aria-label={isPlaying ? "Pause film" : "Play film"}><Icon name={isPlaying ? "pause" : "play"} /></button><span>{isPlaying ? "PLAYING" : "SCROLL FILM"}</span><button className="icon-button" onClick={toggleFullscreen} aria-label="Toggle fullscreen"><Icon name="expand" /></button></div></div>
            <div className="timeline-wrap"><input className="film-timeline" type="range" min="0" max="1000" value={Math.round(progress * 1000)} onChange={event => { stopPlayback(); seekTo(Number(event.target.value) / 1000); }} aria-label="Film progress" aria-valuetext={`${Math.round(progress * 100)} percent`} style={{ "--progress": `${progress * 100}%` } as CSSProperties} /></div>
            <div className="film-meta"><span>THE ITEM BOX — OBJECTS WITH ATTITUDE.</span><span>{videoError ? "FILM UNAVAILABLE · EXPLORE BELOW" : reducedMotion ? "REDUCED MOTION · EXPLORE AT YOUR PACE" : "AN INTERACTIVE DISCOVERY"}<span className="progress-number">{Math.round(progress * 100).toString().padStart(2, "0")} / 100</span></span></div>
          </div>
        </div>
      </section>
      <div className="brand-strip" aria-label="Play. Wear. Repeat."><div>{Array.from({ length: 4 }, (_, i) => <span key={i} aria-hidden={i > 0}>GOOD TASTE. <span className="strip-outline">GREAT FINDS.</span><span className="strip-star">✳</span> PLAY. WEAR. REPEAT.<span className="strip-star">✳</span></span>)}</div></div>
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
        {panel === "menu" && <nav className="panel-inner menu-links" aria-label="Mobile navigation"><Brand /><a href="#collection" onClick={closeDialog}>The collection <Icon name="arrow" /></a><button onClick={() => { closeDialog(); seekTo(0.45); }}>The lookbook <Icon name="arrow" /></button><a href="#about" onClick={closeDialog}>Our world <Icon name="arrow" /></a><button onClick={() => setPanel("search")}>Search <Icon name="search" /></button></nav>}
      </div>
    </dialog>
    <div className={`toast ${toast ? "visible" : ""}`} role="status"><Icon name="check" />{toast}</div>
  </>;
}
