/**
 * Lawyers service
 *
 * Replaces: src/Store/Slices/lawyersSlice.js
 * Now uses:  Supabase `users` table filtered by role containing 'lawyer'
 *            (or a dedicated `lawyers` view/table)
 */
import { createClient } from "@/lib/supabase/server";
import type { Lawyer, ApiResponse } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLawyer(row: Record<string, any>): Lawyer {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    specialization: row.specialization,
    experience: row.experience,
    officeId: row.office_id ?? null,
    officeCasesIds: row.office_cases_ids ?? [],
    profileImageUrl: row.profile_image_url,
    createdAt: row.created_at,
  };
}

export async function getAllLawyers(): Promise<ApiResponse<Lawyer[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .contains("role", ["lawyer"])
    .order("created_at", { ascending: false });

  return {
    data: data ? data.map(mapLawyer) : [],
    error: error?.message ?? null,
  };
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

  return {
    data: data ? data.map(mapLawyer) : [],
    error: error?.message ?? null,
  };
}
