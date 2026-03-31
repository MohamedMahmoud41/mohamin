"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/enums";
import type { PartialProsecution } from "@/types";

function mapPP(row: Record<string, unknown>): PartialProsecution {
  return {
    id: row.id as string,
    name: row.name as string,
    courtId: (row.court_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function adminCreatePartialProsecution(data: {
  name: string;
  courtId?: string | null;
}): Promise<{ error: string | null; item?: PartialProsecution }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("partial_prosecution")
    .insert({ name: normalizeName(data.name), court_id: data.courtId || null })
    .select()
    .single();
  revalidatePath("/admin/partial-prosecution");
  if (error) {
    if (error.code === "23505")
      return { error: "هذه النيابة مسجلة بالفعل، يرجى اختيار اسم مختلف" };
    return { error: error.message };
  }
  return { error: null, item: mapPP(row) };
}

export async function adminUpdatePartialProsecution(
  id: string,
  data: { name: string; courtId?: string | null },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partial_prosecution")
    .update({ name: normalizeName(data.name), court_id: data.courtId || null })
    .eq("id", id);
  revalidatePath("/admin/partial-prosecution");
  if (error?.code === "23505")
    return { error: "هذه النيابة مسجلة بالفعل، يرجى اختيار اسم مختلف" };
  return { error: error?.message ?? null };
}

export async function adminDeletePartialProsecution(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("partial_prosecution")
    .delete()
    .eq("id", id);
  revalidatePath("/admin/partial-prosecution");
  return { error: error?.message ?? null };
}
