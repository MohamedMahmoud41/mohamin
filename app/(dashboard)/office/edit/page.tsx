import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getOfficeById } from "@/services/office";
import EditOfficeForm from "@/components/office/EditOfficeForm";

export const metadata: Metadata = { title: "تعديل المكتب" };

export default async function EditOfficePage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) redirect("/login");

  if (!currentUser.officeId) redirect("/office-setup");
  if (!currentUser.role.includes("officeOwner")) redirect("/office");

  const { data: office } = await getOfficeById(currentUser.officeId);
  if (!office) redirect("/office");

  return <EditOfficeForm office={office} />;
}
