import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SecurityForm from "@/components/settings/SecurityForm";

export default async function SecuritySettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <SecurityForm />;
}
