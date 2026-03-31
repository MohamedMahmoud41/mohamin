import { createClient } from "@/lib/supabase/server";
import type { PartialProsecution, ApiResponse } from "@/types";

function mapPP(row: Record<string, unknown>): PartialProsecution {
  return {
    id: row.id as string,
    name: row.name as string,
    courtId: (row.court_id as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getPartialProsecutions(): Promise<
  ApiResponse<PartialProsecution[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partial_prosecution")
    .select("*")
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapPP),
    error: error?.message ?? null,
  };
}
