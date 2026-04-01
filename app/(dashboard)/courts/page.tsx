import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getCourts } from "@/services/courts";
import { getGovernorates } from "@/services/governorates";
import CourtsPanel from "@/components/courts/CourtsPanel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "المحاكم ومواقعها" };

export default async function CourtsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: user } = await getCurrentUser();
  if (!user) redirect("/login");

  const [{ data: courts = [] }, { data: governorates = [] }] =
    await Promise.all([getCourts(), getGovernorates()]);

  return (
    <CourtsPanel courts={courts ?? []} governorates={governorates ?? []} />
  );
}
