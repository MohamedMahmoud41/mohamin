"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Court } from "@/types";

function mapCourt(row: Record<string, unknown>): Court {
  return {
    id: row.id as string,
    name: row.name as string,
    city: row.city as string,
    createdAt: row.created_at as string,
  };
}

export async function adminCreateCourt(data: {
  name: string;
  city: string;
}): Promise<{ error: string | null; court?: Court }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("courts")
    .insert({ name: data.name, city: data.city })
    .select()
    .single();
  revalidatePath("/admin/courts");
  if (error) return { error: error.message };
  return { error: null, court: mapCourt(row) };
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
