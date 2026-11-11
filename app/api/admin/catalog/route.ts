import { revalidatePath } from "next/cache";
import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { isAdminAuthenticated } from "@/lib/admin-auth";

type Section = "slider" | "reel" | "collection";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  return createSupabaseClient();
}

function fail(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized.", 401);
  try {
    const supabase = getClient();
    const [categories, subcategories, placements] = await Promise.all([
      supabase.from("categories").select("id,name,sort_order").order("sort_order"),
      supabase.from("subcategories").select("id,category_id,name,sort_order").order("sort_order"),
      supabase
        .from("homepage_product_placements")
        .select("product_id,section,sort_order")
        .order("sort_order"),
    ]);
    const productQuery = (fields: string) => supabase
      .from("products")
      .select(fields)
      .order("created_at", { ascending: false });
    let products = await productQuery("id,slug,name,category,category_id,subcategory_id,collection,subtitle,description,price,image,image_alt,gallery,gallery_alts,meta_title,meta_description,color,fit,tag,sizes,active,created_at,updated_at");
    if (products.error) {
      products = await productQuery("id,slug,name,category,category_id,subcategory_id,collection,subtitle,description,price,image,gallery,color,fit,tag,sizes,active,created_at,updated_at");
    }

    const error = categories.error ?? subcategories.error ?? products.error ?? placements.error;
    if (error) return fail(`${error.message} Run supabase/schema.sql in the Supabase SQL Editor.`, 502);

    return Response.json({
      categories: categories.data,
      subcategories: subcategories.data,
      products: ((products.data ?? []) as unknown as Array<Record<string, unknown>>).map(product => ({
        ...product,
        image_alt: String(product.image_alt ?? product.subtitle ?? product.name ?? ""),
        gallery_alts: Array.isArray(product.gallery_alts) ? product.gallery_alts : [],
        meta_title: String(product.meta_title ?? ""),
        meta_description: String(product.meta_description ?? ""),
      })),
      placements: placements.data,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load the catalog.", 500);
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return fail("Unauthorized.", 401);
  try {
    const body = await request.json();
    const action = String(body.action ?? "");
    const supabase = getClient();

    if (action === "save-category") {
      const name = String(body.name ?? "").trim();
      if (!name) return fail("Category name is required.");
      const id = String(body.id || slugify(name));
      const { error } = await supabase.from("categories").upsert({ id, name });
      if (error) return fail(error.message, 502);
    } else if (action === "delete-category") {
      const { error } = await supabase.from("categories").delete().eq("id", String(body.id));
      if (error) return fail(error.message, 502);
    } else if (action === "save-subcategory") {
      const name = String(body.name ?? "").trim();
      const categoryId = String(body.categoryId ?? "");
      if (!name || !categoryId) return fail("Subcategory name and category are required.");
      const id = String(body.id || `${categoryId}--${slugify(name)}`);
      const { error } = await supabase
        .from("subcategories")
        .upsert({ id, category_id: categoryId, name });
      if (error) return fail(error.message, 502);
    } else if (action === "delete-subcategory") {
      const { error } = await supabase.from("subcategories").delete().eq("id", String(body.id));
      if (error) return fail(error.message, 502);
    } else if (action === "save-product") {
      const product = body.product ?? {};
      const name = String(product.name ?? "").trim();
      const categoryId = String(product.category_id ?? "");
      const image = String(product.image ?? "").trim();
      if (!name || !categoryId || !image) return fail("Name, category, and main image are required.");

      const { data: category, error: categoryError } = await supabase
        .from("categories")
        .select("name")
        .eq("id", categoryId)
        .single();
      if (categoryError) return fail(categoryError.message, 502);

      const id = String(product.id || crypto.randomUUID());
      const gallery = Array.isArray(product.gallery)
        ? product.gallery.map(String).map((value: string) => value.trim()).filter(Boolean)
        : [];
      const imageAlt = String(product.image_alt || product.subtitle || name).trim();
      const rawGalleryAlts = Array.isArray(product.gallery_alts)
        ? product.gallery_alts.map(String).map((value: string) => value.trim())
        : [];
      if (!gallery.includes(image)) {
        gallery.unshift(image);
        rawGalleryAlts.unshift(imageAlt);
      }
      const galleryAlts = gallery.map((url: string, index: number) =>
        rawGalleryAlts[index] || (url === image ? imageAlt : `${name} product image ${index + 1}`)
      );

      const row = {
        id,
        slug: slugify(String(product.slug || name)),
        name,
        category: category.name,
        category_id: categoryId,
        subcategory_id: product.subcategory_id || null,
        collection: String(product.collection || "Core Collection").trim(),
        subtitle: String(product.subtitle || name).trim(),
        description: String(product.description || "").trim(),
        price: Math.max(0, Number(product.price) || 0),
        image,
        image_alt: imageAlt,
        gallery,
        gallery_alts: galleryAlts,
        meta_title: String(product.meta_title || `${name} | The Item Box`).trim(),
        meta_description: String(product.meta_description || product.description || product.subtitle || name).trim(),
        color: String(product.color || "Not specified").trim(),
        fit: String(product.fit || "Regular").trim(),
        tag: String(product.tag || "NEW").trim().toUpperCase(),
        sizes: Array.isArray(product.sizes)
          ? product.sizes.map(String).map((value: string) => value.trim()).filter(Boolean)
          : [],
        active: product.active !== false,
        updated_at: new Date().toISOString(),
      };

      const { error: productError } = await supabase.from("products").upsert(row);
      if (productError) return fail(productError.message, 502);

      const rawSections: unknown[] = Array.isArray(body.sections) ? body.sections : [];
      const requestedSections = rawSections
        .filter((section: unknown): section is Section =>
          typeof section === "string" && ["slider", "reel", "collection"].includes(section)
        );
      const { error: deleteError } = await supabase
        .from("homepage_product_placements")
        .delete()
        .eq("product_id", id);
      if (deleteError) return fail(deleteError.message, 502);

      if (requestedSections.length) {
        const { data: existing, error: placementReadError } = await supabase
          .from("homepage_product_placements")
          .select("section,sort_order");
        if (placementReadError) return fail(placementReadError.message, 502);
        const placements = requestedSections.map(section => ({
          product_id: id,
          section,
          sort_order: Math.max(
            -1,
            ...(existing ?? [])
              .filter(item => item.section === section)
              .map(item => item.sort_order)
          ) + 1,
        }));
        const { error: placementError } = await supabase
          .from("homepage_product_placements")
          .insert(placements);
        if (placementError) return fail(placementError.message, 502);
      }
    } else if (action === "delete-product") {
      const { error } = await supabase.from("products").delete().eq("id", String(body.id));
      if (error) return fail(error.message, 502);
    } else if (action === "reorder-section") {
      const section = String(body.section) as Section;
      const productIds = Array.isArray(body.productIds) ? body.productIds.map(String) : [];
      if (!["slider", "reel", "collection"].includes(section)) return fail("Unknown homepage section.");
      const { error: deleteError } = await supabase
        .from("homepage_product_placements")
        .delete()
        .eq("section", section);
      if (deleteError) return fail(deleteError.message, 502);
      if (productIds.length) {
        const { error: insertError } = await supabase
          .from("homepage_product_placements")
          .insert(productIds.map((productId: string, index: number) => ({
            product_id: productId,
            section,
            sort_order: index,
          })));
        if (insertError) return fail(insertError.message, 502);
      }
    } else {
      return fail("Unknown catalog action.");
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/collections/[[...path]]", "page");
    revalidatePath("/products/[slug]", "page");
    revalidatePath("/sitemap.xml");
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Catalog update failed.", 500);
  }
}
