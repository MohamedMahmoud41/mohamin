import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import {
  getCaseById,
  getCaseNotes,
  getCaseSessions,
  getCaseAttachments,
} from "@/services/cases";
import { getCourts } from "@/services/courts";
import { getCaseTypes } from "@/services/case_types";
import { getCourtDivisions } from "@/services/court_divisions";
import { getGovernorates } from "@/services/governorates";
import { getPoliceStations } from "@/services/police_stations";
import { getPartialProsecutions } from "@/services/partial_prosecution";
import { getLawyersByOffice } from "@/services/lawyers";
import { getClientsByOffice } from "@/services/clients";
import EditCaseForm from "@/components/cases/EditCaseForm";

export const metadata: Metadata = { title: "تعديل القضية" };

export default async function EditCasePage({
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
    { data: sessions = [] },
    { data: notes = [] },
    { data: attachments = [] },
    { data: allCourts = [] },
    { data: allCaseTypes = [] },
    { data: allCourtDivisions = [] },
    { data: allGovernorates = [] },
    { data: allPoliceStations = [] },
    { data: allPartialProsecutions = [] },
  ] = await Promise.all([
    getCaseById(caseId),
    getCurrentUser(),
    getCaseSessions(caseId),
    getCaseNotes(caseId),
    getCaseAttachments(caseId),
    getCourts(),
    getCaseTypes(),
    getCourtDivisions(),
    getGovernorates(),
    getPoliceStations(),
    getPartialProsecutions(),
  ]);

  if (!caseItem) notFound();
  if (!user) redirect("/login");

  const { data: lawyers = [] } = user.officeId
    ? await getLawyersByOffice(user.officeId)
    : { data: [] };

  const { data: clients = [] } = user.officeId
    ? await getClientsByOffice(user.officeId)
    : { data: [] };

  return (
    <EditCaseForm
      caseItem={caseItem}
      sessions={sessions ?? []}
      notes={notes ?? []}
      attachments={attachments ?? []}
      allCourts={allCourts ?? []}
      allCaseTypes={allCaseTypes ?? []}
      allCourtDivisions={allCourtDivisions ?? []}
      allGovernorates={allGovernorates ?? []}
      allPoliceStations={allPoliceStations ?? []}
      allPartialProsecutions={allPartialProsecutions ?? []}
      lawyers={lawyers ?? []}
      currentUser={user}
      clients={clients ?? []}
    />
  );
}
