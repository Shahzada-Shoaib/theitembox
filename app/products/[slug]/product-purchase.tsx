"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/app/products";
import { useBag } from "@/app/use-bag";

export function ProductPurchase({ product, products }: { product: Product; products: readonly Product[] }) {
  const [size, setSize] = useState(product.sizes.includes("M") ? "M" : product.sizes[0] || "One size");
  const [added, setAdded] = useState(false);
  const [, setBag] = useBag(products);

  function addToBag() {
    setBag(current => {
      const match = current.find(item => item.id === product.id && item.size === size);
      return match
        ? current.map(item => item === match ? { ...item, quantity: Math.min(99, item.quantity + 1) } : item)
        : [...current, { id: product.id, size, quantity: 1 }];
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return <div className="seo-product-purchase">
    {product.sizes.length > 0 && <fieldset><legend>Select size</legend><div>{product.sizes.map(option => <button type="button" className={size === option ? "is-active" : ""} aria-pressed={size === option} onClick={() => setSize(option)} key={option}>{option}</button>)}</div></fieldset>}
    <button className="seo-product-cta" type="button" onClick={addToBag}>{added ? "Added to bag" : "Add to bag"}</button>
    <Link href="/checkout">Go to checkout</Link>
  </div>;
}
