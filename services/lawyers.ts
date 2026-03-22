/**
 * Lawyers service
 *
 * Replaces: src/Store/Slices/lawyersSlice.js
 * Now uses:  Supabase `users` table filtered by role containing 'lawyer'
 *            (or a dedicated `lawyers` view/table)
 */
import { createClient } from "@/lib/supabase/server";
import type { Lawyer, ApiResponse } from "@/types";

export async function getAllLawyers(): Promise<ApiResponse<Lawyer[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .contains("role", ["lawyer"])
    .order("created_at", { ascending: false });

  return { data: (data as Lawyer[]) ?? [], error: error?.message ?? null };
}

export async function getLawyersByOffice(
  officeId: string,
): Promise<ApiResponse<Lawyer[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("office_id", officeId)
    .contains("role", ["lawyer"]);

  return { data: (data as Lawyer[]) ?? [], error: error?.message ?? null };
}
