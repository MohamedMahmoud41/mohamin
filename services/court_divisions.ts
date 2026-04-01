import { createClient } from "@/lib/supabase/server";
import type { CourtDivision, ApiResponse } from "@/types";

function mapDivision(row: Record<string, unknown>): CourtDivision {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as CourtDivision["category"],
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getCourtDivisions(): Promise<
  ApiResponse<CourtDivision[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("court_divisions")
    .select("*")
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapDivision),
    error: error?.message ?? null,
  };
}

export async function getCourtDivisionsByCategory(
  category: string,
): Promise<ApiResponse<CourtDivision[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("court_divisions")
    .select("*")
    .eq("category", category)
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapDivision),
    error: error?.message ?? null,
  };
}
