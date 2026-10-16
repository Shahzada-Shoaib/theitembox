"use client";

import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { ProductImage } from "./product-image";
import type { Product } from "./products";
import { SiteHeader } from "./site-header";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const entryStarts = [0.03, 0.13, 0.24, 0.35];

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
  const storyRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;
    let frame = 0;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(frame);
    }

    const update = () => {
      frame = 0;
      const distance = Math.max(1, story.offsetHeight - window.innerHeight);
      setProgress(clamp(-story.getBoundingClientRect().top / distance));
    };
    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  function productStyle(index: number): CSSProperties {
    const entrance = clamp((progress - entryStarts[index]) / 0.16);
    const fromRight = index < 2;
    return {
      opacity: entrance,
      visibility: entrance === 0 ? "hidden" : "visible",
      pointerEvents: entrance > 0.7 ? "auto" : "none",
      transform: `translate3d(${(fromRight ? 1 : -1) * (1 - entrance) * 130}px, ${-progress * (index % 2 ? 28 : 48)}px, 0) rotate(${[6, -5, -6, 5][index]}deg)`,
    };
  }

  return (
    <section ref={storyRef} id="top" aria-label="The Item Box interactive collection" className="relative h-[300svh] min-h-[300svh] motion-reduce:h-screen motion-reduce:min-h-screen max-[600px]:h-[280svh] max-[600px]:min-h-[280svh]">
      <div className="sticky top-0 isolate h-[100svh] min-h-[620px] overflow-hidden bg-[#f2f2ed] motion-reduce:relative max-[600px]:min-h-[660px]">
        <video className="absolute inset-0 block size-full origin-center scale-[1.33] object-cover object-center max-[600px]:object-[58%_50%]" autoPlay loop muted playsInline preload="auto" aria-hidden="true">
          <source src="/home.mp4" type="video/mp4" />
        </video>
        <h1 className="sr-only">The Item Box — The collection film</h1>
        <SiteHeader bagCount={bagCount} bagButtonRef={bagButtonRef} productCount={products.length} onOpenBag={onOpenBag} onOpenMenu={onOpenMenu} onOpenSearch={onOpenSearch} />
        <div className="pointer-events-none absolute inset-0" aria-label="Featured products">
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
            <button
              type="button"
              key={product.id}
              className={`floating-tee float-${index}`}
              style={productStyle(index)}
              onClick={() => onOpenProduct(product)}
              tabIndex={progress > entryStarts[index] + 0.11 ? 0 : -1}
              aria-label={`View ${product.name}`}
            >
              <ProductImage product={product} priority={index < 2} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
