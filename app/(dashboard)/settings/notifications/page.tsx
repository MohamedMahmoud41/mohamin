import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getNotificationSettings } from "@/services/users";
import NotificationsForm from "@/components/settings/NotificationsForm";
import type { NotificationSettings } from "@/types";

const DEFAULT_SETTINGS: NotificationSettings = {
  newCases: true,
  sessionReminder: true,
  caseUpdates: true,
  emailNotifications: false,
};

export default async function NotificationsSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { data: notifSettings } = await getNotificationSettings(currentUser.id);

  return <NotificationsForm initial={notifSettings ?? DEFAULT_SETTINGS} />;
}
