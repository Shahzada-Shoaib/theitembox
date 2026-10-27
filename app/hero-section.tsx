"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { ProductImage } from "./product-image";
import type { Product } from "./products";
import { SiteHeader } from "./site-header";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const entryStarts = [0.04, 0.24, 0.44, 0.64];
const entryDuration = 0.14;

type HeroSectionProps = {
  products: readonly Product[];
  bagCount: number;
  bagButtonRef: RefObject<HTMLButtonElement | null>;
  onOpenProduct: (product: Product) => void;
  onOpenBag: () => void;
  onOpenMenu: () => void;
  onOpenSearch: () => void;
};

export function HeroSection({ products, bagCount, bagButtonRef, onOpenProduct, onOpenBag, onOpenMenu, onOpenSearch }: HeroSectionProps) {
  const storyRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    let frame = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const update = () => {
      frame = 0;
      if (reducedMotion) {
        setProgress(1);
        return;
      }
      const distance = Math.max(1, story.offsetHeight - window.innerHeight);
      setProgress(clamp(-story.getBoundingClientRect().top / distance));
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("load", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("load", requestUpdate);
      window.removeEventListener("pageshow", requestUpdate);
    };
  }, []);

  function productStyle(index: number): CSSProperties {
    const entrance = clamp((progress - entryStarts[index]) / entryDuration);
    const fromRight = index < 2;
    return {
      opacity: entrance,
      visibility: entrance === 0 ? "hidden" : "visible",
      pointerEvents: entrance > 0.7 ? "auto" : "none",
      transform: `translate3d(${(fromRight ? 1 : -1) * (1 - entrance) * 130}px, ${-progress * (index % 2 ? 28 : 48)}px, 0) rotate(${[6, -5, -6, 5][index]}deg)`,
    };
  }

  return (
    <section id="top" aria-labelledby="hero-title" className="campaign-hero">
      <SiteHeader bagCount={bagCount} bagButtonRef={bagButtonRef} productCount={products.length} onOpenBag={onOpenBag} onOpenMenu={onOpenMenu} onOpenSearch={onOpenSearch} />
      <div ref={storyRef} className="campaign-hero-story">
        <div className="campaign-hero-sticky">
          <div className="campaign-hero-media">
            <Image src="/home-poster.webp" alt="Vice City sunset campaign featuring two players beside a classic car" fill preload sizes="100vw" className="object-cover object-center" />
            <video className={`campaign-hero-video ${videoReady ? "is-ready" : ""}`} autoPlay loop muted playsInline preload="metadata" poster="/home-poster.webp" aria-hidden="true" onCanPlay={() => setVideoReady(true)}>
              <source src="/home.mp4" type="video/mp4" />
            </video>
            <h1 id="hero-title" className="sr-only">The Item Box Vice City Drop</h1>
            <div className="pointer-events-none absolute inset-0" role="group" aria-label="Featured products">
              <svg className="absolute pointer-events-none" width="0" height="0" aria-hidden="true" focusable="false">
                <defs>
                  {products.slice(0, 4).map((product, index) => (
                    <filter key={product.id} id={`tee-wave-${index}`} x="-18%" y="-18%" width="136%" height="136%">
                      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.018" numOctaves="1" seed={index + 3} result="wind">
                        <animate attributeName="baseFrequency" values="0.004 0.018;0.006 0.024;0.003 0.02;0.004 0.018" dur={`${7.2 + index * 0.55}s`} repeatCount="indefinite" />
                      </feTurbulence>
                      <feDisplacementMap in="SourceGraphic" in2="wind" scale="2" xChannelSelector="R" yChannelSelector="G">
                        <animate attributeName="scale" values="1;2.6;1.8;3;1" dur={`${6.8 + index * 0.6}s`} repeatCount="indefinite" />
                      </feDisplacementMap>
                    </filter>
                  ))}
                </defs>
              </svg>
              {products.slice(0, 4).map((product, index) => (
                <button type="button" key={product.id} className={`floating-tee float-${index}`} style={productStyle(index)} onClick={() => onOpenProduct(product)} tabIndex={progress > entryStarts[index] + 0.11 ? 0 : -1} aria-label={`View ${product.name}`}>
                  <ProductImage product={product} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
