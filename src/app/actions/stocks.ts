"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addPosition(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from("stock_positions").insert({
    symbol: formData.get("symbol"),
    shares_qty: formData.get("qty"),
    avg_cost_basis: formData.get("cost"),
    user_id: user?.id,
    created_by: user?.id,
  });

  revalidatePath("/");
}
