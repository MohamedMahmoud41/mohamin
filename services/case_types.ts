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
