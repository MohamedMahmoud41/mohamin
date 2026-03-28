import AdminSidebar from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: currentUser } = await getCurrentUser();
  if (!currentUser || !currentUser.role.includes("admin"))
    redirect("/dashboard");

  const hasOtherRole =
    currentUser.role.includes("lawyer") ||
    currentUser.role.includes("officeOwner");

  return (
    <div dir="rtl" className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface border-b border-border px-8 py-4 flex items-center justify-between">
          <span className="text-text-muted text-sm">
            لوحة الإدارة – {currentUser.firstName} {currentUser.lastName}
          </span>
          <div className="flex items-center gap-3">
            {hasOtherRole && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary border border-border hover:border-primary px-3 py-1.5 rounded-lg transition-colors"
              >
                <LayoutDashboard size={15} />
                لوحة المحامي
              </Link>
            )}
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
              مدير النظام
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
