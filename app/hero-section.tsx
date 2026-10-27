"use client";

import { getImageProps } from "next/image";
import { useEffect, useState, type RefObject } from "react";
import type { Product } from "./products";
import { SiteHeader } from "./site-header";

const bannerSlides = [
  { desktop: "/banner.jpeg", desktopWidth: 1365, desktopHeight: 768, mobile: "/mob-banner-tall.png", mobileWidth: 841, mobileHeight: 1870 },
  { desktop: "/hero-desktop-man-v2.png", desktopWidth: 1672, desktopHeight: 941, mobile: "/hero-mobile-man-v2.png", mobileWidth: 841, mobileHeight: 1870 },
  { desktop: "/hero-desktop-couple-v2.png", desktopWidth: 1672, desktopHeight: 941, mobile: "/hero-mobile-couple-v2.png", mobileWidth: 841, mobileHeight: 1870 },
].map((slide, index) => {
  const common = {
    alt: index === 0 ? "Vice City Vibes — Wear the heat of Leonida" : "",
    sizes: "100vw",
    fetchPriority: index === 0 ? "high" as const : undefined,
  };
  const {
    props: { srcSet: desktopSrcSet },
  } = getImageProps({ ...common, src: slide.desktop, width: slide.desktopWidth, height: slide.desktopHeight });
  const {
    props: { srcSet: mobileSrcSet, alt, ...mobileProps },
  } = getImageProps({ ...common, src: slide.mobile, width: slide.mobileWidth, height: slide.mobileHeight });
  return { desktopSrcSet, mobileSrcSet, alt, mobileProps };
});

type HeroSectionProps = {
  products: readonly Product[];
  bagCount: number;
  bagButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenProduct: (product: Product) => void;
  onOpenBag: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
};

export function HeroSection({ products, bagCount, bagButtonRef, onOpenBag, onOpenMenu, onOpenSearch }: HeroSectionProps) {
  const [activeBanner, setActiveBanner] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActiveBanner(current => (current + 1) % bannerSlides.length), 8000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section id="top" aria-labelledby="hero-title" className="campaign-hero">
      <SiteHeader bagCount={bagCount} bagButtonRef={bagButtonRef} productCount={products.length} onOpenBag={onOpenBag} onOpenMenu={onOpenMenu} onOpenSearch={onOpenSearch} />
      <div className="campaign-hero-story">
        <div className="campaign-hero-sticky">
          <div className="campaign-hero-media">
            {bannerSlides.map((slide, index) => (
              <picture key={slide.mobileProps.src} className={`campaign-hero-picture campaign-hero-slide ${index === 0 ? "is-layout" : ""} ${activeBanner === index ? "is-active" : ""}`}>
                <source media="(min-width: 601px)" srcSet={slide.desktopSrcSet} />
                <source media="(max-width: 600px)" srcSet={slide.mobileSrcSet} />
                <img {...slide.mobileProps} alt={slide.alt} className="campaign-hero-banner" />
              </picture>
            ))}
            <h1 id="hero-title" className="sr-only">The Item Box Vice City Drop</h1>
          </div>
        </div>
      </div>
    </section>
  );
}
