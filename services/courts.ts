/**
 * Courts service
 *
 * Updated to reflect new schema: governorate_id, court_degree, address, location_url
 */
import { createClient } from "@/lib/supabase/server";
import type { Court, ApiResponse } from "@/types";

function mapCourt(row: Record<string, unknown>): Court {
  return {
    id: row.id as string,
    name: row.name as string,
    governorateId: (row.governorate_id as string | null) ?? null,
    courtDegree: (row.court_degree as Court["courtDegree"]) ?? null,
    address: (row.address as string) ?? "",
    locationUrl: (row.location_url as string) ?? "",
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getCourts(): Promise<ApiResponse<Court[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .order("name", { ascending: true });

  return {
    data: (data ?? []).map(mapCourt),
    error: error?.message ?? null,
  };
}

export async function getCourtsByDegree(
  degree: string,
): Promise<ApiResponse<Court[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("court_degree", degree)
    .order("name", { ascending: true });

  return {
    data: (data ?? []).map(mapCourt),
    error: error?.message ?? null,
  };
}

export async function getCourtsByGovernorate(
  governorateId: string,
): Promise<ApiResponse<Court[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .select("*")
    .eq("governorate_id", governorateId)
    .order("name", { ascending: true });

  return {
    data: (data ?? []).map(mapCourt),
    error: error?.message ?? null,
  };
}

export async function addCourt(
  payload: Partial<
    Pick<
      Court,
      "name" | "governorateId" | "courtDegree" | "address" | "locationUrl"
    >
  >,
): Promise<ApiResponse<Court | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .insert({
      name: payload.name,
      governorate_id: payload.governorateId ?? null,
      court_degree: payload.courtDegree ?? null,
      address: payload.address ?? "",
      location_url: payload.locationUrl ?? "",
    })
    .select()
    .single();

  return { data: data ? mapCourt(data) : null, error: error?.message ?? null };
}

export async function updateCourt(
  id: string,
  payload: Partial<
    Pick<
      Court,
      "name" | "governorateId" | "courtDegree" | "address" | "locationUrl"
    >
  >,
): Promise<ApiResponse<Court | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courts")
    .update({
      name: payload.name,
      governorate_id: payload.governorateId ?? null,
      court_degree: payload.courtDegree ?? null,
      address: payload.address ?? "",
      location_url: payload.locationUrl ?? "",
    })
    .eq("id", id)
    .select()
    .single();

  return { data: data ? mapCourt(data) : null, error: error?.message ?? null };
}

export async function deleteCourt(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("courts").delete().eq("id", id);
  return { data: null, error: error?.message ?? null };
}
