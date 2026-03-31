"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/enums";
import type { Governorate } from "@/types";

function mapGovernorate(row: Record<string, unknown>): Governorate {
  return {
    id: row.id as string,
    name: row.name as string,
    code: (row.code as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function adminCreateGovernorate(data: {
  name: string;
  code?: string;
}): Promise<{ error: string | null; governorate?: Governorate }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("governorates")
    .insert({ name: normalizeName(data.name), code: data.code?.trim() || null })
    .select()
    .single();
  revalidatePath("/admin/governorates");
  if (error) {
    if (error.code === "23505")
      return { error: "هذه المحافظة مسجلة بالفعل، يرجى اختيار اسم مختلف" };
    return { error: error.message };
  }
  return { error: null, governorate: mapGovernorate(row) };
}

export async function adminUpdateGovernorate(
  id: string,
  data: { name: string; code?: string },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("governorates")
    .update({ name: normalizeName(data.name), code: data.code?.trim() || null })
    .eq("id", id);
  revalidatePath("/admin/governorates");
  if (error?.code === "23505")
    return { error: "هذه المحافظة مسجلة بالفعل، يرجى اختيار اسم مختلف" };
  return { error: error?.message ?? null };
}

export async function adminDeleteGovernorate(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("governorates").delete().eq("id", id);
  revalidatePath("/admin/governorates");
  return { error: error?.message ?? null };
}
