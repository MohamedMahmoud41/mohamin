import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getLawyersByOffice } from "@/services/lawyers";
import { getCasesByUser } from "@/services/cases";
import LawyersPanel from "@/components/lawyers/LawyersPanel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "المحامون" };

export default async function AllLawyersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) redirect("/login");

  if (!currentUser.officeId) {
    return (
      <div dir="rtl" className="w-full bg-background p-8">
        <div className="text-center py-20 text-text-muted">
          <p className="text-lg mb-4">
            يجب أن تكون عضواً في مكتب لعرض المحامين
          </p>
          <a
            href="/office-setup"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-semibold"
          >
            إنشاء مكتب
          </a>
        </div>
      </div>
    );
  }

  const [lawyersRes, casesRes] = await Promise.all([
    getLawyersByOffice(currentUser.officeId),
    getCasesByUser(currentUser.id, currentUser.officeId),
  ]);

  const lawyers = lawyersRes.data ?? [];
  const cases = casesRes.data ?? [];

  return (
    <LawyersPanel lawyers={lawyers} cases={cases} currentUser={currentUser} />
  );
}
