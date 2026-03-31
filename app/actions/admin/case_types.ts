"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/enums";
import type { CaseType, CaseCategory } from "@/types";

export async function adminCreateCaseType(data: {
  name: string;
  category: CaseCategory;
  courtIds?: string[];
}): Promise<{ error: string | null; caseType?: CaseType }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("case_types")
    .insert({
      name: normalizeName(data.name),
      category: data.category,
    })
    .select()
    .single();
  if (error) {
    if (error.code === "23505")
      return { error: "نوع القضية مسجل بالفعل، يرجى اختيار اسم مختلف" };
    return { error: error.message };
  }
  const courtIds = data.courtIds ?? [];
  if (courtIds.length > 0) {
    const { error: junctionError } = await supabase
      .from("case_type_courts")
      .insert(
        courtIds.map((courtId) => ({
          case_type_id: row.id,
          court_id: courtId,
        })),
      );
    if (junctionError) return { error: junctionError.message };
  }
  revalidatePath("/admin/case-types");
  return {
    error: null,
    caseType: {
      id: row.id as string,
      name: row.name as string,
      category: row.category as CaseCategory,
      courtIds,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    },
  };
}

export async function adminUpdateCaseType(
  id: string,
  data: { name: string; category: CaseCategory; courtIds?: string[] },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("case_types")
    .update({
      name: normalizeName(data.name),
      category: data.category,
    })
    .eq("id", id);
  if (error?.code === "23505")
    return { error: "نوع القضية مسجل بالفعل، يرجى اختيار اسم مختلف" };
  if (error) return { error: error.message };

  // Replace junction rows
  const { error: deleteError } = await supabase
    .from("case_type_courts")
    .delete()
    .eq("case_type_id", id);
  if (deleteError) return { error: deleteError.message };

  const courtIds = data.courtIds ?? [];
  if (courtIds.length > 0) {
    const { error: insertError } = await supabase
      .from("case_type_courts")
      .insert(
        courtIds.map((courtId) => ({ case_type_id: id, court_id: courtId })),
      );
    if (insertError) return { error: insertError.message };
  }
  revalidatePath("/admin/case-types");
  return { error: null };
}

export async function adminDeleteCaseType(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("case_types").delete().eq("id", id);
  revalidatePath("/admin/case-types");
  return { error: error?.message ?? null };
}
