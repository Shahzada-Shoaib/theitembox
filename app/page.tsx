import Storefront from "./storefront";
import { getStorefrontCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";

export default async function Home() {
  const catalog = await getStorefrontCatalog();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Item Box",
    url: absoluteUrl("/"),
    logo: absoluteUrl("/icon.svg"),
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
    <Storefront catalog={catalog} />
  </>;
}
