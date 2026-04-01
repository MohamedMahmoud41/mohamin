import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getClientsByOffice, getClientsByLawyer } from "@/services/clients";
import ClientsPanel from "@/components/clients/ClientsPanel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "العملاء" };

export default async function ClientsPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: user } = await getCurrentUser();
  if (!user) redirect("/login");

  const isOwner = user.role?.includes("officeOwner");

  // Office owners see all office clients; lawyers see only their cases' clients
  const { data: clients = [] } =
    isOwner && user.officeId
      ? await getClientsByOffice(user.officeId)
      : await getClientsByLawyer(user.id);

  return <ClientsPanel clients={clients ?? []} />;
}
