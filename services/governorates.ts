import { createClient } from "@/lib/supabase/server";
import type { Governorate, ApiResponse } from "@/types";

function mapGovernorate(row: Record<string, unknown>): Governorate {
  return {
    id: row.id as string,
    name: row.name as string,
    code: (row.code as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getGovernorates(): Promise<ApiResponse<Governorate[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("governorates")
    .select("*")
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapGovernorate),
    error: error?.message ?? null,
  };
}
