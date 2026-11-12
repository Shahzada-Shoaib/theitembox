import type { Metadata } from "next";
import { getStorefrontCatalog } from "@/lib/catalog";
import { CheckoutClient } from "./checkout-client";
import "./checkout.css";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const { products } = await getStorefrontCatalog();
  return <CheckoutClient products={products} />;
}
