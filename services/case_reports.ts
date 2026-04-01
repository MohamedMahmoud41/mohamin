/**
 * Case Reports service (محاضر المحكمة)
 *
 * Table: case_reports
 */
import { createClient } from "@/lib/supabase/server";
import type { CaseReport, ApiResponse } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCaseReport(row: Record<string, any>): CaseReport {
  return {
    id: row.id,
    caseId: row.case_id,
    documentType: row.document_type,
    documentNumber: row.document_number ?? "",
    deliveryDate: row.delivery_date,
    receiverName: row.receiver_name ?? "",
    courtId: row.court_id,
    bailiffOffice: row.bailiff_office ?? "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getCaseReports(
  caseId: string,
): Promise<ApiResponse<CaseReport[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("case_reports")
    .select("*")
    .eq("case_id", caseId)
    .order("delivery_date", { ascending: false });

  return {
    data: data ? data.map(mapCaseReport) : [],
    error: error?.message ?? null,
  };
}
