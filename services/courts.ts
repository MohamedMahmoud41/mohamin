/**
 * Courts service
 *
 * Replaces: src/Store/Slices/courtsSlice.js + src/firestore/fireStoreFuctions/courtsService.js
 * Now uses:  Supabase `courts` table
 */
import { createClient } from "@/lib/supabase/server";
import type { Court, ApiResponse } from "@/types";

export async function getCourts(): Promise<ApiResponse<Court[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name", { ascending: true });

  return { data: (data as Court[]) ?? [], error: error?.message ?? null };
}

export async function addCourt(
  name: string,
): Promise<ApiResponse<Court | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .insert({ name })
    .select()
    .single();

  return { data: (data as Court) ?? null, error: error?.message ?? null };
}

export async function updateCourt(
  id: string,
  payload: Partial<Pick<Court, "name">>,
): Promise<ApiResponse<Court | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  return { data: (data as Court) ?? null, error: error?.message ?? null };
}

export async function deleteCourt(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("courts").delete().eq("id", id);

  return { data: null, error: error?.message ?? null };
}
