"use client";

import Image from "next/image";
import { useState, type RefObject } from "react";
import { Icon } from "./brand";
import type { Product } from "./products";
import { SiteHeader } from "./site-header";

type HeroSectionProps = {
  products: readonly Product[];
  bagCount: number;
  bagButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenBag: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
};

export function HeroSection({ products, bagCount, bagButtonRef, onOpenBag, onOpenMenu, onOpenSearch }: HeroSectionProps) {
  const [videoReady, setVideoReady] = useState(false);

  return (
    <section id="top" aria-labelledby="hero-title" className="campaign-hero">
      <SiteHeader bagCount={bagCount} bagButtonRef={bagButtonRef} productCount={products.length} onOpenBag={onOpenBag} onOpenMenu={onOpenMenu} onOpenSearch={onOpenSearch} />
      <div className="campaign-hero-media">
        <Image src="/home-poster.webp" alt="Vice City sunset campaign featuring two players beside a classic car" fill preload sizes="100vw" className="object-cover object-center" />
        <video className={`campaign-hero-video ${videoReady ? "is-ready" : ""}`} autoPlay loop muted playsInline preload="metadata" poster="/home-poster.webp" aria-hidden="true" onCanPlay={() => setVideoReady(true)}>
          <source src="/home.mp4" type="video/mp4" />
        </video>
        <h1 id="hero-title" className="sr-only">The Item Box Vice City Drop</h1>
      </div>
      <a className="campaign-scroll" href="#new-arrivals" aria-label="Scroll to new arrivals"><Icon name="down" /></a>
    </section>
  );
}
