import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import {
  getCaseById,
  getCaseNotes,
  getCaseSessions,
  getCaseAttachments,
  getSessionAttachmentsByCaseId,
} from "@/services/cases";
import { getCaseReports } from "@/services/case_reports";
import { getLawyersByOffice } from "@/services/lawyers";
import { getCourts } from "@/services/courts";
import { getCaseTypes } from "@/services/case_types";
import { getCourtDivisions } from "@/services/court_divisions";
import { getGovernorates } from "@/services/governorates";
import { getPoliceStations } from "@/services/police_stations";
import { getPartialProsecutions } from "@/services/partial_prosecution";
import CaseDetailsPanel from "@/components/cases/case-details/CaseDetailsPanel";

export const metadata: Metadata = { title: "تفاصيل القضية" };

export default async function CaseDetailsPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const [
    { data: caseItem },
    { data: user },
    { data: sessions },
    { data: notes },
    { data: attachments },
    { data: sessionAttachments },
    { data: reports },
    { data: courts },
    { data: caseTypes },
    { data: courtDivisions },
    { data: governorates },
    { data: policeStations },
    { data: partialProsecutions },
  ] = await Promise.all([
    getCaseById(caseId),
    getCurrentUser(),
    getCaseSessions(caseId),
    getCaseNotes(caseId),
    getCaseAttachments(caseId),
    getSessionAttachmentsByCaseId(caseId),
    getCaseReports(caseId),
    getCourts(),
    getCaseTypes(),
    getCourtDivisions(),
    getGovernorates(),
    getPoliceStations(),
    getPartialProsecutions(),
  ]);
  if (!caseItem) notFound();
  if (!user) redirect("/login");

  const { data: lawyers } = await getLawyersByOffice(caseItem.officeId);

  // Build a simple id→name lookup map for displaying referenced entities
  const lookups: Record<string, string> = {};
  for (const c of courts ?? []) lookups[c.id] = c.name;
  for (const ct of caseTypes ?? []) lookups[ct.id] = ct.name;
  for (const cd of courtDivisions ?? []) lookups[cd.id] = cd.name;
  for (const g of governorates ?? []) lookups[g.id] = g.name;
  for (const ps of policeStations ?? []) lookups[ps.id] = ps.name;
  for (const pp of partialProsecutions ?? []) lookups[pp.id] = pp.name;

  // Build court options for reports form
  const courtOptions = (courts ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <CaseDetailsPanel
      caseItem={caseItem}
      sessions={sessions ?? []}
      notes={notes ?? []}
      attachments={attachments ?? []}
      sessionAttachments={sessionAttachments ?? []}
      reports={reports ?? []}
      currentUser={user}
      lawyers={lawyers ?? []}
      lookups={lookups}
      courtOptions={courtOptions}
    />
  );
}
