import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getCourts } from "@/services/courts";
import { getCaseTypes } from "@/services/case_types";
import { getCourtDivisions } from "@/services/court_divisions";
import { getGovernorates } from "@/services/governorates";
import { getPoliceStations } from "@/services/police_stations";
import { getPartialProsecutions } from "@/services/partial_prosecution";
import { getLawyersByOffice } from "@/services/lawyers";
import { getClientsByOffice } from "@/services/clients";
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

  const [
    { data: allCourts = [] },
    { data: allCaseTypes = [] },
    { data: allCourtDivisions = [] },
    { data: allGovernorates = [] },
    { data: allPoliceStations = [] },
    { data: allPartialProsecutions = [] },
    { data: lawyers = [] },
    { data: clients = [] },
  ] = await Promise.all([
    getCourts(),
    getCaseTypes(),
    getCourtDivisions(),
    getGovernorates(),
    getPoliceStations(),
    getPartialProsecutions(),
    user.officeId
      ? getLawyersByOffice(user.officeId)
      : Promise.resolve({ data: [], error: null }),
    user.officeId
      ? getClientsByOffice(user.officeId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  return (
    <AddCaseForm
      lawyers={lawyers ?? []}
      currentUser={user}
      clients={clients ?? []}
      allCourts={allCourts ?? []}
      allCaseTypes={allCaseTypes ?? []}
      allCourtDivisions={allCourtDivisions ?? []}
      allGovernorates={allGovernorates ?? []}
      allPoliceStations={allPoliceStations ?? []}
      allPartialProsecutions={allPartialProsecutions ?? []}
    />
  );
}
