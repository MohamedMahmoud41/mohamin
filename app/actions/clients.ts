"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Client } from "@/types";

export interface ClientInput {
  name: string;
  type: "individual" | "company";
  nationalId?: string;
  phone?: string;
  email?: string;
  address?: string;
  officeId: string;
}

export async function createClientAction(
  data: ClientInput,
): Promise<{ data: Client | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "غير مصرح" };

  const { data: result, error } = await supabase
    .from("clients")
    .insert({
      office_id: data.officeId,
      name: data.name.trim(),
      type: data.type,
      national_id: data.nationalId?.trim() || "",
      phone: data.phone?.trim() || "",
      email: data.email?.trim() || "",
      address: data.address?.trim() || "",
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  revalidatePath("/cases");
  return {
    data: {
      id: result.id,
      officeId: result.office_id,
      name: result.name,
      type: result.type ?? "individual",
      nationalId: result.national_id ?? "",
      phone: result.phone ?? "",
      email: result.email ?? "",
      address: result.address ?? "",
      createdAt: result.created_at,
      updatedAt: result.updated_at,
    },
    error: null,
  };
}

export async function updateClientAction(
  clientId: string,
  data: Partial<Omit<ClientInput, "officeId">>,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row: Record<string, any> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) row.name = data.name.trim();
  if (data.type !== undefined) row.type = data.type;
  if (data.nationalId !== undefined) row.national_id = data.nationalId.trim();
  if (data.phone !== undefined) row.phone = data.phone.trim();
  if (data.email !== undefined) row.email = data.email.trim();
  if (data.address !== undefined) row.address = data.address.trim();

  const { error } = await supabase
    .from("clients")
    .update(row)
    .eq("id", clientId);

  if (error) return { error: error.message };
  revalidatePath("/cases");
  return { error: null };
}
