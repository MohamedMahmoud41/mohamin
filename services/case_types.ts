import { createClient } from "@/lib/supabase/server";
import type { CaseType, ApiResponse } from "@/types";

function mapCaseType(row: Record<string, unknown>): CaseType {
  const junctionRows =
    (row.case_type_courts as { court_id: string }[] | null) ?? [];
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as CaseType["category"],
    courtIds: junctionRows.map((r) => r.court_id),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getCaseTypes(): Promise<ApiResponse<CaseType[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_types")
    .select("*, case_type_courts(court_id)")
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapCaseType),
    error: error?.message ?? null,
  };
}

export async function getCaseTypesByCategory(
  category: string,
): Promise<ApiResponse<CaseType[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_types")
    .select("*, case_type_courts(court_id)")
    .eq("category", category)
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapCaseType),
    error: error?.message ?? null,
  };
}

export async function getCaseTypesByCourtAndCategory(
  courtId: string,
  category: string,
): Promise<ApiResponse<CaseType[]>> {
  const supabase = await createClient();
  // Get case_type_ids linked to this court
  const { data: junctionRows, error: junctionError } = await supabase
    .from("case_type_courts")
    .select("case_type_id")
    .eq("court_id", courtId);

  if (junctionError) {
    return { data: [], error: junctionError.message };
  }

  const caseTypeIds = (junctionRows ?? []).map(
    (r: { case_type_id: string }) => r.case_type_id,
  );
  if (caseTypeIds.length === 0) return { data: [], error: null };

  const { data, error } = await supabase
    .from("case_types")
    .select("*, case_type_courts(court_id)")
    .in("id", caseTypeIds)
    .eq("category", category)
    .order("name", { ascending: true });

  return {
    data: (data ?? []).map(mapCaseType),
    error: error?.message ?? null,
  };
}
