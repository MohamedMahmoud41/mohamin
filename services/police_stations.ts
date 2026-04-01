import { createClient } from "@/lib/supabase/server";
import type { PoliceStation, ApiResponse } from "@/types";

function mapStation(row: Record<string, unknown>): PoliceStation {
  return {
    id: row.id as string,
    name: row.name as string,
    governorateId: (row.governorate_id as string | null) ?? null,
    address: (row.address as string) ?? "",
    locationUrl: (row.location_url as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getPoliceStations(): Promise<
  ApiResponse<PoliceStation[]>
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("police_stations")
    .select("*")
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapStation),
    error: error?.message ?? null,
  };
}

export async function getPoliceStationsByGovernorate(
  governorateId: string,
): Promise<ApiResponse<PoliceStation[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("police_stations")
    .select("*")
    .eq("governorate_id", governorateId)
    .order("name", { ascending: true });
  return {
    data: (data ?? []).map(mapStation),
    error: error?.message ?? null,
  };
}
