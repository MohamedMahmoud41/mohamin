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
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

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
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Full-width top header */}
      <Header user={user} />

      {/* Sidebar + page content */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar — appears on the RIGHT in RTL (dir="rtl" on <html>) */}
        <Sidebar user={user} />

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
