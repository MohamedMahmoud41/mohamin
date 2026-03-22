import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getMissions } from "@/services/missions";
import MissionsView from "@/components/missions/MissionsView";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "مهامي" };

export default async function MissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { data: missions } = await getMissions("user", currentUser.id);

  return (
    <MissionsView initialMissions={missions ?? []} currentUser={currentUser} />
  );
}
