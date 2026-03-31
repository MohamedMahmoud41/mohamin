"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/enums";
import type { CourtDivision, CaseCategory } from "@/types";

function mapDivision(row: Record<string, unknown>): CourtDivision {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as CaseCategory,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function adminCreateCourtDivision(data: {
  name: string;
  category: CaseCategory;
}): Promise<{ error: string | null; division?: CourtDivision }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("court_divisions")
    .insert({ name: normalizeName(data.name), category: data.category })
    .select()
    .single();
  revalidatePath("/admin/court-divisions");
  if (error) {
    if (error.code === "23505")
      return { error: "هذا القسم مسجل بالفعل، يرجى اختيار اسم مختلف" };
    return { error: error.message };
  }
  return { error: null, division: mapDivision(row) };
}

export async function adminUpdateCourtDivision(
  id: string,
  data: { name: string; category: CaseCategory },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("court_divisions")
    .update({ name: normalizeName(data.name), category: data.category })
    .eq("id", id);
  revalidatePath("/admin/court-divisions");
  if (error?.code === "23505")
    return { error: "هذا القسم مسجل بالفعل، يرجى اختيار اسم مختلف" };
  return { error: error?.message ?? null };
}

export async function adminDeleteCourtDivision(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("court_divisions")
    .delete()
    .eq("id", id);
  revalidatePath("/admin/court-divisions");
  return { error: error?.message ?? null };
}
