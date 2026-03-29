/**
 * SERVER COMPONENT — Auth guard + user data fetching for the entire dashboard.
 *
 * Mirrors: src/layout/MainLayout.jsx + src/layout/ProtectedRoute.jsx
 *
 * Auth:   Supabase server client (cookies) — redirect to /login if no session.
 * Data:   Fetches full User profile once here and passes it to Header + Sidebar
 *         as props so neither client component needs to re-fetch.
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  // ── Fetch full user profile ───────────────────────────────────────────────
  const { data: user } = await getCurrentUser();

  // ── Layout ────────────────────────────────────────────────────────────────
  return <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>;
}
