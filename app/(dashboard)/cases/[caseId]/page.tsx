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
import CaseDetailsPanel from "@/components/cases/CaseDetailsPanel";

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
    { data: sessions = [] },
    { data: notes = [] },
    { data: attachments = [] },
  ] = await Promise.all([
    getCaseById(caseId),
    getCurrentUser(),
    getCaseSessions(caseId),
    getCaseNotes(caseId),
    getCaseAttachments(caseId),
  ]);

  if (!caseItem) notFound();
  if (!user) redirect("/login");

  return (
    <CaseDetailsPanel
      caseItem={caseItem}
      sessions={sessions}
      notes={notes}
      attachments={attachments}
      currentUser={user}
    />
  );
}
