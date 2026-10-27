"use client";

import { getImageProps } from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { ProductImage } from "./product-image";
import type { Product } from "./products";
import { SiteHeader } from "./site-header";

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const entryStarts = [0, 0.14, 0.28, 0.42];
const entryDuration = 0.26;

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

  const bannerImage = {
    alt: "Vice City Vibes — Wear the heat of Leonida",
    sizes: "100vw",
    fetchPriority: "high" as const,
  };
  const {
    props: { srcSet: desktopBannerSrcSet },
  } = getImageProps({
    ...bannerImage,
    src: "/banner.jpeg",
    width: 1365,
    height: 768,
  });
  const {
    props: { srcSet: mobileBannerSrcSet, alt: mobileBannerAlt, ...mobileBannerProps },
  } = getImageProps({
    ...bannerImage,
    src: "/mob-banner-tall.png",
    width: 841,
    height: 1870,
  });

  useEffect(() => {
    const story = storyRef.current;
    if (!story) return;

    let frame = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const render = () => {
      frame = 0;
      currentProgress += (targetProgress - currentProgress) * 0.16;
      if (Math.abs(targetProgress - currentProgress) < 0.001) {
        currentProgress = targetProgress;
      }
      setProgress(currentProgress);
      if (currentProgress !== targetProgress) frame = requestAnimationFrame(render);
    };

    const onWheel = (event: WheelEvent) => {
      if (reducedMotion) {
        currentProgress = 1;
        targetProgress = 1;
        setProgress(1);
        return;
      }

      const heroAtTop = Math.abs(story.getBoundingClientRect().top) < 2;
      const animatingForward = event.deltaY > 0 && currentProgress < 0.72;
      const animatingBackward = event.deltaY < 0 && targetProgress > 0;
      if (!heroAtTop || (!animatingForward && !animatingBackward)) return;

      event.preventDefault();
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
      targetProgress = clamp(targetProgress + (event.deltaY * unit) / 650);
      if (!frame) frame = requestAnimationFrame(render);
    };

    if (reducedMotion) frame = requestAnimationFrame(() => setProgress(1));
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, []);

  function productStyle(index: number): CSSProperties {
    const entrance = clamp((progress - entryStarts[index]) / entryDuration);
    const easedEntrance = 1 - Math.pow(1 - entrance, 3);
    const springEntrance = 1 + 2.4 * Math.pow(entrance - 1, 3) + 1.4 * Math.pow(entrance - 1, 2);
    const fromRight = index < 2;
    const direction = fromRight ? 1 : -1;
    const restingRotation = [4, -3, -4, 3][index];
    const startingRotation = direction * (14 + index * 2);
    const rotation = startingRotation + (restingRotation - startingRotation) * springEntrance + Math.sin(progress * Math.PI * 1.5 + index) * 1.2 * easedEntrance;
    const depth = 0.72 + springEntrance * 0.28;
    const blur = (1 - easedEntrance) * 6;
    return {
      opacity: clamp(entrance * 1.5),
      visibility: entrance === 0 ? "hidden" : "visible",
      pointerEvents: entrance > 0.7 ? "auto" : "none",
      filter: `blur(${blur}px) drop-shadow(0 ${12 + easedEntrance * 12}px ${18 + easedEntrance * 14}px rgb(0 0 0 / ${0.18 + easedEntrance * 0.18}))`,
      transform: `translate3d(${direction * (1 - easedEntrance) * (180 + index * 24)}px, ${(1 - easedEntrance) * (90 + index * 13) - progress * (index % 2 ? 18 : 30)}px, 0) scale(${depth}) rotateX(${(1 - easedEntrance) * -12}deg) rotateY(${direction * (1 - easedEntrance) * 18}deg) rotateZ(${rotation}deg)`,
      transformOrigin: "50% 18%",
    };
  }

  return (
    <section id="top" aria-labelledby="hero-title" className="campaign-hero">
      <SiteHeader bagCount={bagCount} bagButtonRef={bagButtonRef} productCount={products.length} onOpenBag={onOpenBag} onOpenMenu={onOpenMenu} onOpenSearch={onOpenSearch} />
      <div ref={storyRef} className="campaign-hero-story">
        <div className="campaign-hero-sticky">
          <div className="campaign-hero-media">
            <picture className="campaign-hero-picture">
              <source media="(min-width: 601px)" srcSet={desktopBannerSrcSet} />
              <source media="(max-width: 600px)" srcSet={mobileBannerSrcSet} />
              <img {...mobileBannerProps} alt={mobileBannerAlt} className="campaign-hero-banner" />
            </picture>
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
                        <animate attributeName="scale" values="2;6;3.5;7;2" dur={`${5.8 + index * 0.55}s`} repeatCount="indefinite" />
                      </feDisplacementMap>
                    </filter>
                  ))}
                </defs>
              </svg>
              {products.slice(0, 4).map((product, index) => (
                <button type="button" key={product.id} className={`floating-tee float-${index}`} style={productStyle(index)} onClick={() => onOpenProduct(product)} tabIndex={progress > entryStarts[index] + 0.11 ? 0 : -1} aria-label={`View ${product.name}`}>
                  <span className="hero-tee-float">
                    <ProductImage product={product} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
