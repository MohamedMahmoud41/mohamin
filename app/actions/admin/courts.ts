"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function adminCreateCourt(data: {
  name: string;
  city: string;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("courts")
    .insert({ name: data.name, city: data.city });
  revalidatePath("/admin/courts");
  return { error: error?.message ?? null };
}

export async function adminUpdateCourt(
  id: string,
  data: { name: string; city: string },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("courts").update(data).eq("id", id);
  revalidatePath("/admin/courts");
  return { error: error?.message ?? null };
}

export async function adminDeleteCourt(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("courts").delete().eq("id", id);
  revalidatePath("/admin/courts");
  return { error: error?.message ?? null };
}
