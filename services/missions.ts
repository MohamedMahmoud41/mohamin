/**
 * Missions service
 *
 * Replaces: src/Store/Slices/missionsSlice.js (Firestore)
 * Now uses:  Supabase `missions` table
 */
import { createClient } from "@/lib/supabase/server";
import type { Mission, ApiResponse } from "@/types";

export async function getMissions(
  contextType: "user" | "office",
  contextId: string,
  assignedToFilter?: string,
): Promise<ApiResponse<Mission[]>> {
  const supabase = await createClient();

  let query = supabase
    .from("missions")
    .select("*")
    .eq("context_type", contextType)
    .eq("context_id", contextId)
    .order("due_date", { ascending: true });

  if (assignedToFilter) {
    query = query.eq("assigned_to", assignedToFilter);
  }

  const { data, error } = await query;
  return { data: (data as Mission[]) ?? [], error: error?.message ?? null };
}
