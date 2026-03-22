import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import ProfileForm from "@/components/settings/ProfileForm";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) redirect("/login");

  return <ProfileForm user={currentUser} />;
}
