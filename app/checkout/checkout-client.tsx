"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brand } from "@/app/brand";
import { formatPrice, type Product } from "@/app/products";
import { useBag } from "@/app/use-bag";

export function CheckoutClient({ products }: { products: readonly Product[] }) {
  const [bag, setBag] = useBag(products);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const items = bag.map(item => ({ ...item, product: products.find(product => product.id === item.id) })).filter(item => item.product);
  const subtotal = items.reduce((sum, item) => sum + item.product!.price * item.quantity, 0);

  function changeQuantity(id: string, size: string, delta: number) {
    setBag(current => current.map(item => item.id === id && item.size === size
      ? { ...item, quantity: Math.min(99, item.quantity + delta) }
      : item).filter(item => item.quantity > 0));
  }

  async function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            name: form.get("name"), phone: form.get("phone"), address: form.get("address"),
            city: form.get("city"), notes: form.get("notes"),
          },
          items: bag,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Order could not be placed.");
      setOrderNumber(result.orderNumber);
      setBag(() => []);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Order could not be placed.");
    } finally {
      setBusy(false);
    }
  }

  if (orderNumber) return <main className="checkout-state checkout-success">
    <Link href="/" aria-label="The Item Box home"><Brand /></Link>
    <span>ORDER RECEIVED</span><h1>Thank you.</h1>
    <p>Your order <strong>{orderNumber}</strong> has been placed. We&apos;ll contact you to confirm delivery.</p>
    <Link className="checkout-primary" href="/">Continue shopping</Link>
  </main>;

  if (!items.length) return <main className="checkout-state">
    <Link href="/" aria-label="The Item Box home"><Brand /></Link>
    <h1>Your bag is empty.</h1><p>Add something you like, then come back to checkout.</p>
    <Link className="checkout-primary" href="/collections">Browse products</Link>
  </main>;

  return <main className="checkout-page">
    <header className="checkout-header"><Link href="/" aria-label="The Item Box home"><Brand /></Link><Link href="/collections">Continue shopping</Link></header>
    <div className="checkout-layout">
      <form className="checkout-form" onSubmit={placeOrder}>
        <span>CHECKOUT</span><h1>Delivery details</h1>
        <div className="checkout-fields two"><label><span>Full name</span><input name="name" autoComplete="name" required /></label><label><span>Phone</span><input name="phone" type="tel" autoComplete="tel" required /></label></div>
        <label><span>Address</span><textarea name="address" rows={3} autoComplete="street-address" required /></label>
        <label><span>City</span><input name="city" autoComplete="address-level2" required /></label>
        <label><span>Order notes <small>optional</small></span><textarea name="notes" rows={2} /></label>
        {error && <p className="checkout-error" role="alert">{error}</p>}
        <div className="checkout-total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
        <button className="checkout-primary" type="submit" disabled={busy}>{busy ? "Placing order…" : "Place order — Cash on delivery"}</button>
      </form>

      <aside className="checkout-summary">
        <h2>Your order</h2>
        {items.map(item => <article key={`${item.id}-${item.size}`}>
          <div><Image src={item.product!.image} alt={item.product!.imageAlt || item.product!.name} fill sizes="76px" /></div>
          <section><strong>{item.product!.name}</strong><span>{item.size}</span><p><button type="button" onClick={() => changeQuantity(item.id, item.size, -1)}>−</button><b>{item.quantity}</b><button type="button" onClick={() => changeQuantity(item.id, item.size, 1)}>+</button></p></section>
          <small>{formatPrice(item.product!.price * item.quantity)}</small>
        </article>)}
        <p className="checkout-payment"><span>Payment</span><strong>Cash on delivery</strong></p>
      </aside>
    </div>
  </main>;
}
