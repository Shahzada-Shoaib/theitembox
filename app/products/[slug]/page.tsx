import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Brand } from "@/app/brand";
import { formatPrice } from "@/app/products";
import { getProductBySlug, getStorefrontCatalog } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/site";
import "./product.css";

type ProductPageProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { products } = await getStorefrontCatalog();
  return products.map(product => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.metaTitle || `${product.name} | The Item Box`;
  const description = product.metaDescription || product.description;
  const url = `/products/${product.slug}`;

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      title,
      description,
      url,
      siteName: "The Item Box",
      images: [{ url: product.image, alt: product.imageAlt || product.subtitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const { products } = await getStorefrontCatalog();
  const related = products.filter(item => item.id !== product.id).slice(0, 4);
  const gallery = [...new Set([product.image, ...product.gallery])];
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: gallery.map(image => absoluteUrl(image)),
    sku: product.id,
    category: product.category,
    color: product.color,
    brand: { "@type": "Brand", name: "The Item Box" },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "PKR",
      price: product.price,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: product.category, item: absoluteUrl("/#collection") },
      { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
    ],
  };

  return (
    <main className="seo-product-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <header className="seo-product-header">
        <Link href="/" aria-label="The Item Box home"><Brand /></Link>
        <Link href="/#collection">Back to collection <span aria-hidden="true">↗</span></Link>
      </header>

      <nav className="seo-product-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/#collection">{product.category}</Link><span>/</span><span>{product.name}</span>
      </nav>

      <article className="seo-product-detail">
        <div className="seo-product-gallery">
          {gallery.slice(0, 4).map((image, index) => (
            <div className={index === 0 ? "is-main" : ""} key={image}>
              <Image
                src={image}
                alt={product.galleryAlts?.[index] || (index === 0 ? product.imageAlt : "") || `${product.name} ${index + 1}`}
                fill
                sizes={index === 0 ? "(max-width: 760px) 100vw, 58vw" : "(max-width: 760px) 50vw, 29vw"}
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <div className="seo-product-copy">
          <span>{product.tag}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <strong>{formatPrice(product.price)}</strong>
          <dl>
            <div><dt>Collection</dt><dd>{product.collection}</dd></div>
            <div><dt>Colour</dt><dd>{product.color}</dd></div>
            <div><dt>Fit</dt><dd>{product.fit}</dd></div>
          </dl>
          {product.sizes.length > 0 && <div className="seo-product-sizes"><span>Available sizes</span><p>{product.sizes.join(" · ")}</p></div>}
          <Link className="seo-product-cta" href="/#collection">Shop the collection</Link>
        </div>
      </article>

      {related.length > 0 && <section className="seo-related" aria-labelledby="related-title">
        <header><span>KEEP EXPLORING</span><h2 id="related-title">More from the drop.</h2></header>
        <div>
          {related.map(item => <Link href={`/products/${item.slug}`} key={item.id}>
            <span><Image src={item.image} alt={item.imageAlt || item.subtitle} fill sizes="(max-width: 600px) 50vw, 25vw" /></span>
            <strong>{item.name}</strong><small>{formatPrice(item.price)}</small>
          </Link>)}
        </div>
      </section>}
    </main>
  );
}
