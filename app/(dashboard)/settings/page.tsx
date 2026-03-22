import { redirect } from "next/navigation";

/**
 * /settings → redirect to /settings/profile (default tab)
 */
export default function SettingsIndexPage() {
  redirect("/settings/profile");
}
