import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getLawyersByOffice } from "@/services/lawyers";
import { getCasesByUser } from "@/services/cases";
import ReportsDashboard from "@/components/reports/ReportsDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "التقارير والإحصائيات" };

export default async function ReportsPage() {
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
          <p className="text-lg">يجب أن تكون عضواً في مكتب لعرض التقارير</p>
        </div>
      </div>
    );
  }

  const [lawyersRes, casesRes] = await Promise.all([
    getLawyersByOffice(currentUser.officeId),
    getCasesByUser(currentUser.id, currentUser.officeId),
  ]);

  return (
    <ReportsDashboard
      cases={casesRes.data ?? []}
      lawyers={lawyersRes.data ?? []}
    />
  );
}
