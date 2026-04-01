import { createClient } from "@/lib/supabase/server";
import type { Client, ApiResponse } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapClient(row: Record<string, any>): Client {
  return {
    id: row.id,
    officeId: row.office_id,
    name: row.name,
    type: row.type ?? "individual",
    nationalId: row.national_id ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    address: row.address ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getClientsByOffice(
  officeId: string,
): Promise<ApiResponse<Client[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("office_id", officeId)
    .order("name", { ascending: true });

  return {
    data: data ? data.map(mapClient) : [],
    error: error?.message ?? null,
  };
}

export async function getClientById(
  clientId: string,
): Promise<ApiResponse<Client>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", clientId)
    .single();

  return {
    data: data ? mapClient(data) : null,
    error: error?.message ?? null,
  };
}

/**
 * Get clients linked to a specific lawyer's cases (via case_lawyers → cases.client_id)
 */
export async function getClientsByLawyer(
  lawyerId: string,
): Promise<ApiResponse<Client[]>> {
  const supabase = await createClient();

  // Get case IDs assigned to this lawyer
  const { data: caseLawyers, error: clErr } = await supabase
    .from("case_lawyers")
    .select("case_id")
    .eq("lawyer_id", lawyerId);

  if (clErr) return { data: [], error: clErr.message };
  if (!caseLawyers?.length) return { data: [], error: null };

  const caseIds = caseLawyers.map((cl) => cl.case_id);

  // Get distinct client_ids from those cases
  const { data: cases, error: cErr } = await supabase
    .from("cases")
    .select("client_id")
    .in("id", caseIds)
    .not("client_id", "is", null);

  if (cErr) return { data: [], error: cErr.message };

  const clientIds = [
    ...new Set(cases?.map((c) => c.client_id).filter(Boolean) as string[]),
  ];
  if (!clientIds.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .in("id", clientIds)
    .order("name", { ascending: true });

  return {
    data: data ? data.map(mapClient) : [],
    error: error?.message ?? null,
  };
}
