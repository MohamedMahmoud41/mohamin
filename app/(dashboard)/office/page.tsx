import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getOfficeById } from "@/services/office";
import { getLawyersByOffice } from "@/services/lawyers";
import { getCasesByUser } from "@/services/cases";
import { getMissions } from "@/services/missions";
import OfficeDashboard from "@/components/office/OfficeDashboard";
import Link from "next/link";

export const metadata: Metadata = { title: "المكتب" };

export default async function OfficePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  console.log("🚀 ~ OfficePage ~ currentUser:", currentUser);
  if (!currentUser) redirect("/login");

  // No office yet → redirect to setup
  if (!currentUser.officeId) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8"
      >
        <h1 className="text-2xl font-bold text-text-primary">
          لم يتم إعداد المكتب بعد
        </h1>
        <p className="text-text-muted">قم بإعداد مكتبك للبدء</p>
        <Link
          href="/office-setup"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
        >
          إعداد المكتب
        </Link>
      </div>
    );
  }

  const [
    { data: office },
    { data: lawyers = [] },
    { data: cases = [] },
    { data: missions = [] },
  ] = await Promise.all([
    getOfficeById(currentUser.officeId),
    getLawyersByOffice(currentUser.officeId),
    getCasesByUser(currentUser.id, currentUser.officeId),
    getMissions("office", currentUser.officeId),
  ]);
  console.log("🚀 ~ OfficePage ~ office:", office);

  if (!office) {
    return (
      <div dir="rtl" className="p-8 text-text-muted text-center">
        لم يتم العثور على المكتب
      </div>
    );
  }

  return (
    <OfficeDashboard
      office={office}
      cases={cases ?? []}
      lawyers={lawyers ?? []}
      missions={missions ?? []}
      currentUser={currentUser}
    />
  );
}
