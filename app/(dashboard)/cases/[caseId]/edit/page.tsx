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
import { getLawyersByOffice } from "@/services/lawyers";
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
    { data: courts = [] },
  ] = await Promise.all([
    getCaseById(caseId),
    getCurrentUser(),
    getCaseSessions(caseId),
    getCaseNotes(caseId),
    getCaseAttachments(caseId),
    getCourts(),
  ]);

  if (!caseItem) notFound();
  if (!user) redirect("/login");

  const { data: lawyers = [] } = user.officeId
    ? await getLawyersByOffice(user.officeId)
    : { data: [] };

  return (
    <EditCaseForm
      caseItem={caseItem}
      sessions={sessions ?? []}
      notes={notes ?? []}
      attachments={attachments ?? []}
      courts={courts ?? []}
      lawyers={lawyers ?? []}
      currentUser={user}
    />
  );
}
