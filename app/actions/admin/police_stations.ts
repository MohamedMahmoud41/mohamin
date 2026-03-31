"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { normalizeName } from "@/lib/enums";
import type { PoliceStation } from "@/types";

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

export async function adminCreatePoliceStation(data: {
  name: string;
  governorateId?: string | null;
  address?: string;
  locationUrl?: string | null;
}): Promise<{ error: string | null; station?: PoliceStation }> {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("police_stations")
    .insert({
      name: normalizeName(data.name),
      governorate_id: data.governorateId || null,
      address: data.address?.trim() ?? "",
      location_url: data.locationUrl?.trim() || null,
    })
    .select()
    .single();
  revalidatePath("/admin/police-stations");
  if (error) {
    if (error.code === "23505")
      return { error: "هذا المركز مسجل بالفعل، يرجى اختيار اسم مختلف" };
    return { error: error.message };
  }
  return { error: null, station: mapStation(row) };
}

export async function adminUpdatePoliceStation(
  id: string,
  data: {
    name: string;
    governorateId?: string | null;
    address?: string;
    locationUrl?: string | null;
  },
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("police_stations")
    .update({
      name: normalizeName(data.name),
      governorate_id: data.governorateId || null,
      address: data.address?.trim() ?? "",
      location_url: data.locationUrl?.trim() || null,
    })
    .eq("id", id);
  revalidatePath("/admin/police-stations");
  if (error?.code === "23505")
    return { error: "هذا المركز مسجل بالفعل، يرجى اختيار اسم مختلف" };
  return { error: error?.message ?? null };
}

export async function adminDeletePoliceStation(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("police_stations")
    .delete()
    .eq("id", id);
  revalidatePath("/admin/police-stations");
  return { error: error?.message ?? null };
}
