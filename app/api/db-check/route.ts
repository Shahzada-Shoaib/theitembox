import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured()) {
    return Response.json(
      {
        status: "not_configured",
        message:
          "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      },
      { status: 503 }
    );
  }

  const supabase = createSupabaseClient();
  const { error } = await supabase
    .from("products")
    .select("id", { head: true })
    .limit(1);

  if (error) {
    return Response.json(
      { status: "error", message: error.message },
      { status: 502 }
    );
  }

  console.log("DB connected");

  return Response.json({ status: "connected" });
}
