"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Category = { id: string; name: string; sort_order: number };
type Subcategory = { id: string; category_id: string; name: string; sort_order: number };
type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  category_id: string | null;
  subcategory_id: string | null;
  collection: string;
  subtitle: string;
  description: string;
  price: number;
  image: string;
  image_alt: string;
  gallery: string[];
  gallery_alts: string[];
  meta_title: string;
  meta_description: string;
  color: string;
  fit: string;
  tag: string;
  sizes: string[];
  active: boolean;
};
type Section = "slider" | "reel" | "collection";
type Placement = { product_id: string; section: Section; sort_order: number };
type CatalogData = {
  categories: Category[];
  subcategories: Subcategory[];
  products: ProductRow[];
  placements: Placement[];
};
type GalleryItem = { url: string; alt: string };
type ProductDraft = Omit<ProductRow, "gallery" | "gallery_alts" | "sizes"> & {
  galleryItems: GalleryItem[];
  sizesText: string;
};

const EMPTY_DATA: CatalogData = { categories: [], subcategories: [], products: [], placements: [] };
const SECTION_META: Record<Section, { label: string; hint: string; index: string }> = {
  slider: { label: "Moving slider", hint: "The fast product strip below the hero.", index: "01" },
  reel: { label: "3D rotation", hint: "Products orbiting inside the pink stage.", index: "02" },
  collection: { label: "Featured grid", hint: "The product cards below the category split.", index: "03" },
};

function isPreviewableImage(value: string) {
  return value.startsWith("/") || value.startsWith("https://res.cloudinary.com/");
}

function emptyProduct(categoryId = ""): ProductDraft {
  return {
    id: "",
    slug: "",
    name: "",
    category: "",
    category_id: categoryId,
    subcategory_id: "",
    collection: "Vice City Drop",
    subtitle: "",
    description: "",
    price: 0,
    image: "",
    image_alt: "",
    galleryItems: [],
    meta_title: "",
    meta_description: "",
    color: "",
    fit: "Relaxed",
    tag: "NEW DROP",
    sizesText: "S, M, L, XL",
    active: true,
  };
}

export default function AdminDashboard() {
  const [data, setData] = useState<CatalogData>(EMPTY_DATA);
  const [tab, setTab] = useState<"products" | "homepage" | "structure">("products");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<ProductDraft | null>(null);
  const [draftSections, setDraftSections] = useState<Section[]>([]);
  const [uploading, setUploading] = useState(false);

  const loadCatalog = useCallback(async () => {
    try {
      setError("");
      const response = await fetch("/api/admin/catalog", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Catalog could not be loaded.");
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Catalog could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCatalog(), 0);
    return () => window.clearTimeout(timer);
  }, [loadCatalog]);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function runAction(payload: Record<string, unknown>, success: string) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Update failed.");
      await loadCatalog();
      setNotice(success);
      return true;
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Update failed.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  const productMap = useMemo(() => new Map(data.products.map(product => [product.id, product])), [data.products]);
  const filteredProducts = data.products.filter(product =>
    `${product.name} ${product.category} ${product.collection}`.toLowerCase().includes(query.toLowerCase())
  );

  function placementSections(productId: string) {
    return data.placements.filter(item => item.product_id === productId).map(item => item.section);
  }

  function openProduct(product?: ProductRow) {
    if (product) {
      setDraft({
        ...product,
        image_alt: product.image_alt ?? product.subtitle,
        meta_title: product.meta_title ?? "",
        meta_description: product.meta_description ?? "",
        galleryItems: product.gallery
          .map((url, index) => ({ url, alt: product.gallery_alts?.[index] ?? "" }))
          .filter(item => item.url !== product.image),
        sizesText: product.sizes.join(", "),
      });
      setDraftSections(placementSections(product.id));
    } else {
      setDraft(emptyProduct(data.categories[0]?.id));
      setDraftSections([]);
    }
  }

  async function saveProduct(event: FormEvent) {
    event.preventDefault();
    if (!draft) return;
    const galleryItems = draft.galleryItems.filter(item => item.url.trim());
    const product = {
      ...draft,
      gallery: [draft.image.trim(), ...galleryItems.map(item => item.url.trim())].filter(Boolean),
      gallery_alts: [draft.image_alt.trim(), ...galleryItems.map(item => item.alt.trim())],
      sizes: draft.sizesText.split(",").map(value => value.trim()).filter(Boolean),
    };
    const saved = await runAction(
      { action: "save-product", product, sections: draftSections },
      draft.id ? "Product updated." : "Product created."
    );
    if (saved) setDraft(null);
  }

  async function uploadImage(file?: File, target: "main" | number = "main") {
    if (!file || !draft) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Image upload failed.");
      setDraft(current => {
        if (!current) return current;
        if (target === "main") return { ...current, image: result.url };
        return {
          ...current,
          galleryItems: current.galleryItems.map((item, index) => index === target ? { ...item, url: result.url } : item),
        };
      });
      setNotice(target === "main" ? "Main image uploaded." : "Gallery image uploaded.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  function sectionIds(section: Section) {
    return data.placements
      .filter(item => item.section === section)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => item.product_id)
      .filter(id => productMap.has(id));
  }

  async function updateSection(section: Section, ids: string[], message = "Homepage order updated.") {
    await runAction({ action: "reorder-section", section, productIds: ids }, message);
  }

  function moveInSection(section: Section, productId: string, offset: number) {
    const ids = sectionIds(section);
    const index = ids.indexOf(productId);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    void updateSection(section, ids);
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <Link className="admin-mark" href="/" aria-label="The Item Box storefront">
          <span>TIB</span><i />
        </Link>
        <nav aria-label="Admin sections">
          {([
            ["products", "Products", "P"],
            ["homepage", "Homepage", "H"],
            ["structure", "Categories", "C"],
          ] as const).map(([value, label, initial]) => (
            <button key={value} type="button" className={tab === value ? "is-active" : ""} onClick={() => setTab(value)}>
              <span>{initial}</span>{label}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <span className="status-dot" /> Live catalog
          <Link href="/" target="_blank">View store ↗</Link>
        </div>
      </aside>

      <section className="admin-workspace">
        <header className="admin-topbar">
          <div><span>THE ITEM BOX / CONTROL DESK</span><strong>{new Date().toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}</strong></div>
          <form action="/api/admin/logout" method="post"><button type="submit">Sign out</button></form>
        </header>

        {error && <div className="admin-alert" role="alert"><span>!</span><p>{error}</p><button type="button" onClick={() => setError("")}>Dismiss</button></div>}
        {notice && <div className="admin-toast" role="status">✓ {notice}</div>}

        {loading ? <AdminLoading /> : (
          <>
            {tab === "products" && (
              <div className="admin-view">
                <div className="admin-heading">
                  <button className="admin-primary" type="button" onClick={() => openProduct()}>+ Add product</button>
                </div>
                <div className="admin-table-card">
                  <div className="admin-table-tools">
                    <label><span>⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search products, category, collection" /></label>
                    <small>{filteredProducts.length} result{filteredProducts.length === 1 ? "" : "s"}</small>
                  </div>
                  <div className="admin-product-list">
                    {filteredProducts.map(product => (
                      <article key={product.id} className={!product.active ? "is-muted" : ""}>
                        <div className="admin-product-image"><Image src={product.image} alt="" fill sizes="72px" /></div>
                        <div className="admin-product-name"><strong>{product.name}</strong><span>{product.collection}</span></div>
                        <div><small>Category</small><span>{product.category}</span></div>
                        <div><small>Price</small><span>Rs. {product.price.toLocaleString("en-PK")}</span></div>
                        <div className="admin-placement-tags">
                          {placementSections(product.id).map(section => <span key={section}>{SECTION_META[section].label}</span>)}
                          {!placementSections(product.id).length && <em>Not featured</em>}
                        </div>
                        <span className={`admin-state ${product.active ? "is-live" : ""}`}>{product.active ? "Live" : "Hidden"}</span>
                        <div className="admin-row-actions">
                          <button type="button" onClick={() => openProduct(product)}>Edit</button>
                          <button type="button" disabled={busy} onClick={() => {
                            if (window.confirm(`Delete ${product.name}?`)) void runAction({ action: "delete-product", id: product.id }, "Product deleted.");
                          }}>Delete</button>
                        </div>
                      </article>
                    ))}
                    {!filteredProducts.length && <div className="admin-empty"><strong>No products found.</strong><span>Try another search or add a new product.</span></div>}
                  </div>
                </div>
              </div>
            )}

            {tab === "homepage" && (
              <div className="admin-view">
                <div className="admin-section-grid">
                  {(Object.keys(SECTION_META) as Section[]).map(section => {
                    const ids = sectionIds(section);
                    const available = data.products.filter(product => product.active && !ids.includes(product.id));
                    return (
                      <article className="admin-section-card" key={section}>
                        <header><span>{SECTION_META[section].index}</span><div><h2>{SECTION_META[section].label}</h2><p>{SECTION_META[section].hint}</p></div><b>{ids.length}</b></header>
                        <div className="admin-sort-list">
                          {ids.map((id, index) => {
                            const product = productMap.get(id)!;
                            return <div key={id}>
                              <span className="admin-grip">{String(index + 1).padStart(2, "0")}</span>
                              <div className="admin-mini-image"><Image src={product.image} alt="" fill sizes="46px" /></div>
                              <strong>{product.name}</strong>
                              <div><button type="button" aria-label="Move up" onClick={() => moveInSection(section, id, -1)}>↑</button><button type="button" aria-label="Move down" onClick={() => moveInSection(section, id, 1)}>↓</button><button type="button" aria-label="Remove" onClick={() => void updateSection(section, ids.filter(value => value !== id), "Product removed from section.")}>×</button></div>
                            </div>;
                          })}
                          {!ids.length && <p className="admin-section-empty">No products assigned yet.</p>}
                        </div>
                        <form className="admin-add-slot" onSubmit={event => {
                          event.preventDefault();
                          const select = event.currentTarget.elements.namedItem("product") as HTMLSelectElement;
                          if (select.value) void updateSection(section, [...ids, select.value], "Product added to section.");
                        }}>
                          <select name="product" defaultValue=""><option value="" disabled>Add a product…</option>{available.map(product => <option value={product.id} key={product.id}>{product.name}</option>)}</select>
                          <button type="submit" disabled={busy || !available.length}>Add</button>
                        </form>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {tab === "structure" && <StructureView data={data} busy={busy} runAction={runAction} />}
          </>
        )}
      </section>

      {draft && (
        <div className="admin-drawer-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setDraft(null); }}>
          <form className="admin-drawer" onSubmit={saveProduct}>
            <header><div><span>PRODUCT EDITOR</span><h2>{draft.id ? "Edit product" : "New product"}</h2></div><button type="button" aria-label="Close" onClick={() => setDraft(null)}>×</button></header>
            <div className="admin-form-scroll">
              <section className="admin-form-section">
                <h3>Product essentials</h3>
                <div className="admin-fields two"><Field label="Product name"><input required value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></Field><Field label="Slug"><input value={draft.slug} onChange={event => setDraft({ ...draft, slug: event.target.value })} placeholder="Auto-generated from name" /></Field></div>
                <div className="admin-fields two"><Field label="Category"><select required value={draft.category_id ?? ""} onChange={event => setDraft({ ...draft, category_id: event.target.value, subcategory_id: "" })}><option value="">Choose category</option>{data.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Subcategory"><select value={draft.subcategory_id ?? ""} onChange={event => setDraft({ ...draft, subcategory_id: event.target.value })}><option value="">No subcategory</option>{data.subcategories.filter(item => item.category_id === draft.category_id).map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></Field></div>
                <div className="admin-fields two"><Field label="Collection"><input value={draft.collection} onChange={event => setDraft({ ...draft, collection: event.target.value })} /></Field><Field label="Price (PKR)"><input required min="0" type="number" value={draft.price} onChange={event => setDraft({ ...draft, price: Number(event.target.value) })} /></Field></div>
                <Field label="Short subtitle"><input value={draft.subtitle} onChange={event => setDraft({ ...draft, subtitle: event.target.value })} /></Field>
                <Field label="Description"><textarea rows={4} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} /></Field>
              </section>
              <section className="admin-form-section">
                <h3>Imagery</h3>
                <div className="admin-image-block-head"><div><strong>Main image</strong><small>Used on product cards and search previews.</small></div></div>
                <div className="admin-image-editor is-main">
                  <div className="admin-image-preview">
                    {isPreviewableImage(draft.image) ? <Image src={draft.image} alt="" fill sizes="110px" /> : <span>MAIN</span>}
                  </div>
                  <div className="admin-image-fields">
                    <Field label="Image URL"><input required value={draft.image} onChange={event => setDraft({ ...draft, image: event.target.value })} placeholder="Upload an image or paste its URL" /></Field>
                    <Field label="Alt text"><input required value={draft.image_alt} onChange={event => setDraft({ ...draft, image_alt: event.target.value })} placeholder="e.g. Pink graphic T-shirt, front view" /></Field>
                    <label className="admin-upload-action">{uploading ? "Uploading…" : draft.image ? "Replace image" : "Upload image"}<input type="file" accept="image/*" disabled={uploading} onChange={event => void uploadImage(event.target.files?.[0])} /></label>
                  </div>
                </div>

                <div className="admin-image-block-head gallery"><div><strong>Gallery images</strong><small>Add optional back, detail or lifestyle views.</small></div><button type="button" onClick={() => setDraft({ ...draft, galleryItems: [...draft.galleryItems, { url: "", alt: "" }] })}>+ Add image</button></div>
                <div className="admin-gallery-list">
                  {draft.galleryItems.map((item, index) => <div className="admin-image-editor" key={index}>
                    <div className="admin-image-preview">
                      {isPreviewableImage(item.url) ? <Image src={item.url} alt="" fill sizes="90px" /> : <span>{String(index + 1).padStart(2, "0")}</span>}
                    </div>
                    <div className="admin-image-fields">
                      <Field label="Image URL"><input required value={item.url} onChange={event => setDraft({ ...draft, galleryItems: draft.galleryItems.map((entry, itemIndex) => itemIndex === index ? { ...entry, url: event.target.value } : entry) })} placeholder="Upload an image or paste its URL" /></Field>
                      <Field label="Alt text"><input required value={item.alt} onChange={event => setDraft({ ...draft, galleryItems: draft.galleryItems.map((entry, itemIndex) => itemIndex === index ? { ...entry, alt: event.target.value } : entry) })} placeholder="Describe this exact view" /></Field>
                      <div className="admin-gallery-actions"><label className="admin-upload-action">{uploading ? "Uploading…" : item.url ? "Replace" : "Upload"}<input type="file" accept="image/*" disabled={uploading} onChange={event => void uploadImage(event.target.files?.[0], index)} /></label><button type="button" onClick={() => setDraft({ ...draft, galleryItems: draft.galleryItems.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button></div>
                    </div>
                  </div>)}
                  {!draft.galleryItems.length && <p className="admin-gallery-empty">No gallery images yet. Add one only when you need another product view.</p>}
                </div>
              </section>
              <section className="admin-form-section">
                <h3>Search preview</h3>
                <Field label="Meta title"><input maxLength={70} value={draft.meta_title} onChange={event => setDraft({ ...draft, meta_title: event.target.value })} placeholder={`${draft.name || "Product name"} | The Item Box`} /></Field>
                <Field label="Meta description"><textarea maxLength={170} rows={3} value={draft.meta_description} onChange={event => setDraft({ ...draft, meta_description: event.target.value })} placeholder="Short description shown in search results" /></Field>
              </section>
              <section className="admin-form-section">
                <h3>Details & visibility</h3>
                <div className="admin-fields two"><Field label="Color"><input value={draft.color} onChange={event => setDraft({ ...draft, color: event.target.value })} /></Field><Field label="Fit"><input value={draft.fit} onChange={event => setDraft({ ...draft, fit: event.target.value })} /></Field></div>
                <div className="admin-fields two"><Field label="Tag"><input value={draft.tag} onChange={event => setDraft({ ...draft, tag: event.target.value })} /></Field><Field label="Sizes — comma separated"><input value={draft.sizesText} onChange={event => setDraft({ ...draft, sizesText: event.target.value })} /></Field></div>
                <label className="admin-switch"><input type="checkbox" checked={draft.active} onChange={event => setDraft({ ...draft, active: event.target.checked })} /><span /><div><strong>Published</strong><small>Visible on the storefront and available for homepage sections.</small></div></label>
              </section>
              <section className="admin-form-section">
                <h3>Homepage placement</h3>
                <div className="admin-placement-options">{(Object.keys(SECTION_META) as Section[]).map(section => <label key={section}><input type="checkbox" checked={draftSections.includes(section)} onChange={event => setDraftSections(current => event.target.checked ? [...current, section] : current.filter(item => item !== section))} /><span>{SECTION_META[section].index}</span><div><strong>{SECTION_META[section].label}</strong><small>{SECTION_META[section].hint}</small></div></label>)}</div>
              </section>
            </div>
            <footer><button type="button" onClick={() => setDraft(null)}>Cancel</button><button className="admin-primary" disabled={busy || uploading} type="submit">{busy ? "Saving…" : "Save product"}</button></footer>
          </form>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="admin-field"><span>{label}</span>{children}</label>;
}

function StructureView({ data, busy, runAction }: { data: CatalogData; busy: boolean; runAction: (payload: Record<string, unknown>, success: string) => Promise<boolean> }) {
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id ?? "");
  return <div className="admin-view">
    <div className="admin-structure-grid">
      <section><header><span>01</span><div><h2>Categories</h2><p>Top-level product groups.</p></div></header><form onSubmit={async event => { event.preventDefault(); if (await runAction({ action: "save-category", name: categoryName }, "Category created.")) setCategoryName(""); }}><input value={categoryName} onChange={event => setCategoryName(event.target.value)} placeholder="e.g. Apparel" required /><button disabled={busy}>Add</button></form><div>{data.categories.map(category => <article key={category.id}><strong>{category.name}</strong><span>{data.subcategories.filter(item => item.category_id === category.id).length} subcategories</span><button type="button" onClick={() => { if (window.confirm(`Delete ${category.name}?`)) void runAction({ action: "delete-category", id: category.id }, "Category deleted."); }}>Delete</button></article>)}</div></section>
      <section><header><span>02</span><div><h2>Subcategories</h2><p>Optional groups within a category.</p></div></header><form onSubmit={async event => { event.preventDefault(); if (await runAction({ action: "save-subcategory", name: subcategoryName, categoryId }, "Subcategory created.")) setSubcategoryName(""); }}><select value={categoryId} onChange={event => setCategoryId(event.target.value)} required><option value="">Category</option>{data.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select><input value={subcategoryName} onChange={event => setSubcategoryName(event.target.value)} placeholder="e.g. Graphic Tees" required /><button disabled={busy}>Add</button></form><div>{data.subcategories.map(item => <article key={item.id}><strong>{item.name}</strong><span>{data.categories.find(category => category.id === item.category_id)?.name}</span><button type="button" onClick={() => { if (window.confirm(`Delete ${item.name}?`)) void runAction({ action: "delete-subcategory", id: item.id }, "Subcategory deleted."); }}>Delete</button></article>)}</div></section>
    </div>
  </div>;
}

function AdminLoading() {
  return <div className="admin-loading"><span /><span /><span /><p>Loading catalog…</p></div>;
}
