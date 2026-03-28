/**
 * Missions service
 *
 * Replaces: src/Store/Slices/missionsSlice.js (Firestore)
 * Now uses:  Supabase `missions` table
 */
import { createClient } from "@/lib/supabase/server";
import type { Mission, ApiResponse } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMission(row: Record<string, any>): Mission {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    isCompleted: row.is_completed ?? false,
    assignedTo: row.assigned_to ?? null,
    contextType: row.context_type,
    contextId: row.context_id,
    dueDate: row.due_date,
    createdAt: row.created_at,
  };
}

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
  return {
    data: data ? data.map(mapMission) : [],
    error: error?.message ?? null,
  };
}
