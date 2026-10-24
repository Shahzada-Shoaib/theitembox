"use client";

import { useEffect, useRef, useState } from "react";
import { ProductImage } from "./product-image";
import type { Product } from "./products";

type TeeSliderProps = {
  products: readonly Product[];
  onOpenProduct: (product: Product) => void;
};

export function TeeSlider({ products, onOpenProduct }: TeeSliderProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const [poofing, setPoofing] = useState<string | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function playPoofSound() {
    if (!window.AudioContext) return;
    try {
      const context = audioContextRef.current ?? new AudioContext();
      audioContextRef.current = context;

      const play = () => {
        const duration = 0.28;
        const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index += 1) {
          samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
        }

        const source = context.createBufferSource();
        const filter = context.createBiquadFilter();
        const gain = context.createGain();
        const now = context.currentTime;
        source.buffer = buffer;
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(850, now);
        filter.frequency.exponentialRampToValueAtTime(180, now + duration);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        source.connect(filter);
        filter.connect(gain);
        gain.connect(context.destination);
        source.start(now);
      };

      if (context.state === "suspended") void context.resume().then(play).catch(() => undefined);
      else play();
    } catch {
      // The product interaction still works when audio is unavailable.
    }
  }

  function openWithPoof(product: Product, key: string) {
    if (poofing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onOpenProduct(product);
      return;
    }
    playPoofSound();
    setPoofing(key);
    timerRef.current = setTimeout(() => {
      setPoofing(null);
      timerRef.current = null;
      onOpenProduct(product);
    }, 520);
  }

  return (
    <section className="tee-queue relative overflow-hidden bg-[#f2f2ed] py-[clamp(40px,4vw,58px)] max-[600px]:py-9" aria-label="Featured graphic tees">
      <div className="tee-queue-track">
        {[0, 1].map(group => (
          <div className="flex min-w-[100vw] flex-none items-center justify-around gap-[clamp(2px,.45vw,8px)] px-[clamp(2px,.4vw,7px)]" key={group}>
            {products.map(product => {
              const key = `${group}-${product.id}`;
              return (
                <button type="button" className={`tee-queue-item ${poofing === key ? "is-poofing" : ""}`} key={key} onClick={() => openWithPoof(product, key)} aria-label={`View ${product.name}`}>
                  <ProductImage product={product} sizes="(max-width: 600px) 34vw, (max-width: 1100px) 18vw, 12vw" className="tee-queue-image" unoptimized={false} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
