import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getCasesByUser } from "@/services/cases";
import CasesFilters from "@/components/cases/CasesFilters";

export const metadata: Metadata = { title: "القضايا" };

export default async function CasesPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: user } = await getCurrentUser();
  const isOwner = user?.role.includes("officeOwner") ?? false;
  const { data: cases = [] } = await getCasesByUser(
    authUser.id,
    isOwner ? (user?.officeId ?? null) : null,
  );

  return (
    <div className="p-4 md:p-8 bg-background min-h-full">
      <CasesFilters cases={cases} />
    </div>
  );
}
