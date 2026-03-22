import AdminSidebar from "@/components/admin/AdminSidebar";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";

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

  return (
    <div dir="rtl" className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface border-b border-border px-8 py-4 flex items-center justify-between">
          <span className="text-text-muted text-sm">
            لوحة الإدارة – {currentUser.firstName} {currentUser.lastName}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
            مدير النظام
          </span>
        </header>
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
    </div>
  );
}
