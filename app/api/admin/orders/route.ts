import { isAdminAuthenticated } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { orderStatuses, type OrderStatus } from "@/app/orders";

export async function GET() {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const { data, error } = await createSupabaseAdminClient()
      .from("orders")
      .select("*,order_items(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return Response.json({ orders: data ?? [] });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Orders could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminAuthenticated())) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try {
    const body = await request.json() as { id?: string; status?: OrderStatus };
    if (!body.id || !body.status || !orderStatuses.includes(body.status)) {
      return Response.json({ error: "Invalid order update." }, { status: 400 });
    }
    const { error } = await createSupabaseAdminClient().from("orders").update({ status: body.status }).eq("id", body.id);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Order could not be updated." }, { status: 500 });
  }
}
