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
  DashboardSession,
  ApiResponse,
} from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCase(row: Record<string, any>): Case {
  let caseNumbers: { caseNumber: string; caseYear: string }[] = [];
  try {
    const raw = row.case_numbers;
    if (typeof raw === "string") {
      caseNumbers = JSON.parse(raw);
    } else if (Array.isArray(raw)) {
      caseNumbers = raw;
    }
  } catch {
    caseNumbers = [];
  }

  return {
    id: row.id,
    caseTitle: row.case_title,
    caseCategory: row.case_category ?? "civil",
    caseType: row.case_type,
    caseStatus: row.case_status,
    caseDescription: row.case_description,
    startDate: row.start_date,
    nextSessionDate: row.next_session_date ?? null,
    officeId: row.office_id,
    lawyerID: row.lawyer_id,
    lawyerIDs: [], // populated separately from case_lawyers junction
    clientId: row.client_id ?? undefined,
    caseNumbers,
    // Civil
    civilDegree: row.civil_degree ?? "",
    courtId: row.court_id ?? "",
    caseTypeId: row.case_type_id ?? "",
    // Criminal
    courtDivisionId: row.court_division_id ?? "",
    governorateId: row.governorate_id ?? "",
    policeStationId: row.police_station_id ?? "",
    partialProsecutionId: row.partial_prosecution_id ?? "",
    // Personal
    personalServiceTypeId: row.personal_service_type_id ?? "",
    personalCourtDivisionId: row.personal_court_division_id ?? "",
    familyCourtId: row.family_court_id ?? "",
    personalPartialProsecutionId: row.personal_partial_prosecution_id ?? "",
    // Legacy
    courtName: row.court_name,
    courtHall: row.court_hall ?? "",
    courtNum: row.court_num ?? "",
    // Client
    clientName: row.client_name,
    clientPhone: row.client_phone,
    clientEmail: row.client_email,
    clientAddress: row.client_address ?? "",
    clientType: row.client_type ?? "",
    clientNationalId: row.client_national_id ?? "",
    clientRole: row.client_role ?? "",
    // Opponent
    opponentName: row.opponent_name,
    opponentPhone: row.opponent_phone,
    opponentEmail: row.opponent_email ?? "",
    opponentAddress: row.opponent_address ?? "",
    opponentType: row.opponent_type ?? "",
    opponentNationalId: row.opponent_national_id ?? "",
    opponentRole: row.opponent_role ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCaseNote(row: Record<string, any>): CaseNote {
  return {
    id: row.id,
    caseId: row.case_id,
    noteTitle: row.note_title,
    notes: row.notes,
    noteOwner: row.note_owner,
    noteDate: row.note_date,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCaseSession(row: Record<string, any>): CaseSession {
  return {
    id: row.id,
    caseId: row.case_id,
    sessionDate: row.session_date,
    status: row.status ?? "upcoming",
    decision: row.decision ?? null,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCaseAttachment(row: Record<string, any>): CaseAttachment {
  return {
    id: row.id,
    caseId: row.case_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileType: row.file_type,
    fileSize: row.file_size,
    uploadedAt: row.uploaded_at,
  };
}

export async function getCaseById(caseId: string): Promise<ApiResponse<Case>> {
  const supabase = await createClient();
  const [{ data, error }, { data: lawyerRows }] = await Promise.all([
    supabase.from("cases").select("*").eq("id", caseId).single(),
    supabase.from("case_lawyers").select("lawyer_id").eq("case_id", caseId),
  ]);

  if (!data) return { data: null, error: error?.message ?? null };
  const mapped = mapCase(data);
  mapped.lawyerIDs = lawyerRows?.map((r) => r.lawyer_id) ?? [];
  // Ensure the primary lawyer_id is included
  if (mapped.lawyerID && !mapped.lawyerIDs.includes(mapped.lawyerID)) {
    mapped.lawyerIDs.unshift(mapped.lawyerID);
  }
  return { data: mapped, error: null };
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

  return { data: data ? data.map(mapCase) : [], error: error?.message ?? null };
}

export async function getAllCases(): Promise<ApiResponse<Case[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: data ? data.map(mapCase) : [], error: error?.message ?? null };
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

  return {
    data: data ? data.map(mapCaseNote) : [],
    error: error?.message ?? null,
  };
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

  return {
    data: data ? data.map(mapCaseSession) : [],
    error: error?.message ?? null,
  };
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
  return { data: data ? data.map(mapCase) : [], error: error?.message ?? null };
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
    data: data ? data.map(mapCaseAttachment) : [],
    error: error?.message ?? null,
  };
}

/**
 * Fetch upcoming sessions (status="upcoming") for a given set of case IDs,
 * enriched with case information for dashboard display.
 */
export async function getUpcomingSessionsForCases(
  caseIds: string[],
  cases: Case[],
): Promise<ApiResponse<DashboardSession[]>> {
  if (!caseIds.length) return { data: [], error: null };
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("case_sessions")
    .select("id, case_id, session_date, status")
    .in("case_id", caseIds)
    .eq("status", "upcoming")
    .order("session_date", { ascending: true });

  if (error) return { data: null, error: error.message };

  const caseMap = new Map(cases.map((c) => [c.id, c]));

  const enriched: DashboardSession[] = (data ?? [])
    .map((row) => {
      const c = caseMap.get(row.case_id);
      if (!c) return null;
      return {
        sessionId: row.id,
        caseId: row.case_id,
        sessionDate: row.session_date,
        status: row.status,
        caseTitle: c.caseTitle,
        clientName: c.clientName,
        courtName: c.courtName || "غير محدد",
      };
    })
    .filter(Boolean) as DashboardSession[];

  return { data: enriched, error: null };
}
