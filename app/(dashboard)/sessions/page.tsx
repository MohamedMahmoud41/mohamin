import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getCasesByUser, getAllSessionsForCases } from "@/services/cases";
import { redirect } from "next/navigation";
import SessionsPageClient from "@/components/sessions/SessionsPageClient";
import type { Case, DashboardSession } from "@/types";

export const metadata: Metadata = { title: "الجلسات" };

export default async function SessionsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: user } = await getCurrentUser();
  const { data: casesData } = await getCasesByUser(
    authUser.id,
    user?.officeId ?? null,
  );
  const cases: Case[] = casesData ?? [];
  const caseIds = cases.map((c) => c.id);

  const { data: sessions = [] } = await getAllSessionsForCases(caseIds, cases);

  return (
    <div className="p-4 md:p-8 bg-background min-h-full">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
          الجلسات
        </h1>
        <p className="text-text-muted mt-1">
          جميع جلسات القضايا — عرض تقويمي أو قائمة
        </p>
      </div>

      <SessionsPageClient sessions={sessions as DashboardSession[]} />
    </div>
  );
}
