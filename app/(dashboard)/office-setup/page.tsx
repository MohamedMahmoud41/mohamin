import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import OfficeSetupForm from "@/components/office/OfficeSetupForm";

export const metadata: Metadata = { title: "إعداد المكتب" };

export default async function OfficeSetupPage() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) redirect("/login");

  // If office already exists, redirect to office page
  if (currentUser.officeId) redirect("/office");

  return <OfficeSetupForm />;
}
