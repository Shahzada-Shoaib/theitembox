"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { Brand } from "./brand";

const blocks = Array.from({ length: 48 }, (_, index) => ({
  id: index,
  desktopOrder: Math.abs(index % 8 - 3.5) + Math.abs(Math.floor(index / 8) - 2.5) - 1,
  mobileOrder: Math.abs(index % 6 - 2.5) + Math.abs(Math.floor(index / 6) - 3.5) - 1,
}));

export function PageLoader() {
  const [finished, setFinished] = useState(false);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    let secondFrame = 0;
    let timer = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        setRevealing(true);
        timer = window.setTimeout(() => setFinished(true), 1750);
      });
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(timer);
    };
  }, []);

  if (finished) return null;

  return (
    <div className={`page-loader ${revealing ? "is-revealing" : ""}`} aria-hidden="true">
      <span className="page-loader-brand"><Brand compact /><small>Outside the ordinary</small></span>
      {blocks.map(block => (
        <span
          className="page-loader-block"
          key={block.id}
          style={{
            "--loader-fill-delay": `${60 + (5 - block.desktopOrder) * 35}ms`,
            "--loader-unfill-delay": `${800 + block.desktopOrder * 40}ms`,
            "--loader-mobile-fill-delay": `${60 + (5 - block.mobileOrder) * 35}ms`,
            "--loader-mobile-unfill-delay": `${800 + block.mobileOrder * 40}ms`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
