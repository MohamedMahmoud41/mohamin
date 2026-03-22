/**
 * Cases service
 *
 * Replaces: src/Store/Slices/casesSlice.js (Firebase Firestore calls)
 * Now uses:  Supabase (PostgreSQL)
 *
 * Table assumed: `cases` with columns matching the Case type in types/index.ts
 *
 * Old → New mapping:
 *   fetchCasesByIds(ids)  →  getCasesByIds(ids)
 *   fetchCaseById(id)     →  getCaseById(id)
 *   fetchCases()          →  getAllCases()
 *   addCase(data)         →  createCase(data)
 *   updateCase(data)      →  updateCase(id, data)
 *   fetchCaseNotes(id)    →  getCaseNotes(caseId)
 *   addCaseNote(...)      →  addCaseNote(caseId, data)
 *   fetchCaseSessions(id) →  getCaseSessions(caseId)
 *   addCaseSession(...)   →  addCaseSession(caseId, data)
 *   fetchCaseAttachments  →  getCaseAttachments(caseId)
 */
import { createClient } from "@/lib/supabase/server";
import type {
  Case,
  CaseNote,
  CaseSession,
  CaseAttachment,
  ApiResponse,
} from "@/types";

export async function getCaseById(caseId: string): Promise<ApiResponse<Case>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .single();

  return { data: data as Case | null, error: error?.message ?? null };
}

export async function getCasesByIds(
  ids: string[],
): Promise<ApiResponse<Case[]>> {
  if (!ids.length) return { data: [], error: null };
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .in("id", ids);

  return { data: (data as Case[]) ?? [], error: error?.message ?? null };
}

export async function getAllCases(): Promise<ApiResponse<Case[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as Case[]) ?? [], error: error?.message ?? null };
}

export async function getCaseNotes(
  caseId: string,
): Promise<ApiResponse<CaseNote[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_notes")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });

  return { data: (data as CaseNote[]) ?? [], error: error?.message ?? null };
}

export async function getCaseSessions(
  caseId: string,
): Promise<ApiResponse<CaseSession[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_sessions")
    .select("*")
    .eq("case_id", caseId)
    .order("session_date", { ascending: true });

  return { data: (data as CaseSession[]) ?? [], error: error?.message ?? null };
}

export async function getCasesByUser(
  userId: string,
  officeId?: string | null,
): Promise<ApiResponse<Case[]>> {
  const supabase = await createClient();

  // Fetch cases where the user is the assigned lawyer OR it's an office case
  let query = supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  if (officeId) {
    query = query.or(`lawyer_id.eq.${userId},office_id.eq.${officeId}`);
  } else {
    query = query.eq("lawyer_id", userId);
  }

  const { data, error } = await query;
  return { data: (data as Case[]) ?? [], error: error?.message ?? null };
}

export async function getCaseAttachments(
  caseId: string,
): Promise<ApiResponse<CaseAttachment[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_attachments")
    .select("*")
    .eq("case_id", caseId);

  return {
    data: (data as CaseAttachment[]) ?? [],
    error: error?.message ?? null,
  };
}
