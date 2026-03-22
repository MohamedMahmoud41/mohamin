import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getCourts } from "@/services/courts";
import { getLawyersByOffice } from "@/services/lawyers";
import AddCaseForm from "@/components/cases/AddCaseForm";

export const metadata: Metadata = { title: "إضافة قضية" };

export default async function AddCasePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ data: courts = [] }, { data: lawyers = [] }] = await Promise.all([
    getCourts(),
    user.officeId
      ? getLawyersByOffice(user.officeId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  return <AddCaseForm courts={courts} lawyers={lawyers} currentUser={user} />;
}
