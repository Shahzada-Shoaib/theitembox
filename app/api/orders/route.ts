import { getStorefrontCatalog } from "@/lib/catalog";
import { createSupabaseAdminClient } from "@/lib/supabase";

type OrderRequest = {
  customer?: { name?: string; phone?: string; address?: string; city?: string; notes?: string };
  items?: Array<{ id?: string; size?: string; quantity?: number }>;
};

function clean(value: unknown, max: number) {
  return String(value ?? "").trim().slice(0, max);
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as OrderRequest;
    const customer = {
      name: clean(body.customer?.name, 100),
      phone: clean(body.customer?.phone, 30),
      address: clean(body.customer?.address, 300),
      city: clean(body.customer?.city, 80),
      notes: clean(body.customer?.notes, 500),
    };
    if (!customer.name || customer.phone.length < 7 || !customer.address || !customer.city) {
      return Response.json({ error: "Please complete your name, phone, address and city." }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 30) {
      return Response.json({ error: "Your bag is empty or too large." }, { status: 400 });
    }

    const { products } = await getStorefrontCatalog();
    const normalized = body.items.map(item => {
      const product = products.find(entry => entry.id === item.id && entry.active !== false);
      const quantity = Number(item.quantity);
      const size = clean(item.size, 30);
      if (!product || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) throw new Error("One of the bag items is invalid.");
      if (product.sizes.length && !product.sizes.includes(size)) throw new Error(`Choose an available size for ${product.name}.`);
      return { product, size: size || "One size", quantity };
    });
    const subtotal = normalized.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const orderNumber = `TIB-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`;
    const supabase = createSupabaseAdminClient();
    const { data: order, error: orderError } = await supabase.from("orders").insert({
      order_number: orderNumber,
      customer_name: customer.name,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      notes: customer.notes,
      subtotal,
    }).select("id,order_number").single();
    if (orderError || !order) throw new Error(orderError?.message || "Order could not be created.");

    const { error: itemsError } = await supabase.from("order_items").insert(normalized.map(item => ({
      order_id: order.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_slug: item.product.slug,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.product.price,
    })));
    if (itemsError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw new Error(itemsError.message);
    }
    return Response.json({ ok: true, orderNumber: order.order_number });
  } catch (error) {
    console.error("Order creation failed.", error);
    return Response.json({ error: error instanceof Error ? error.message : "Order could not be created." }, { status: 500 });
  }
}
