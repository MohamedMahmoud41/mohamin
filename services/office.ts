/**
 * Office service
 *
 * Replaces: src/Store/Slices/officeSlice.js
 * Now uses:  Supabase `offices` table
 */
import { createClient } from "@/lib/supabase/server";
import type { Office, ApiResponse } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapOffice(row: Record<string, any>): Office {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    description: row.description,
    ownerId: row.owner_id,
    membersIds: row.members_ids ?? [],
    casesIds: row.cases_ids ?? [],
    createdAt: row.created_at,
  };
}

export async function getOfficeById(
  id: string,
): Promise<ApiResponse<Office | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .eq("id", id)
    .single();

  return { data: data ? mapOffice(data) : null, error: error?.message ?? null };
}

export async function getAllOffices(): Promise<ApiResponse<Office[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offices")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data: data ? data.map(mapOffice) : [],
    error: error?.message ?? null,
  };
}

export async function createOffice(
  payload: Omit<Office, "id" | "created_at" | "updated_at">,
): Promise<ApiResponse<Office | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offices")
    .insert(payload)
    .select()
    .single();

  return { data: data ? mapOffice(data) : null, error: error?.message ?? null };
}

export async function updateOffice(
  id: string,
  payload: Partial<Omit<Office, "id" | "created_at">>,
): Promise<ApiResponse<Office | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offices")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  return { data: data ? mapOffice(data) : null, error: error?.message ?? null };
}
