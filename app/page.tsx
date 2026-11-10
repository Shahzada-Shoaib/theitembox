import Storefront from "./storefront";
import { getStorefrontCatalog } from "@/lib/catalog";

export default async function Home() {
  const catalog = await getStorefrontCatalog();
  return <Storefront catalog={catalog} />;
}
