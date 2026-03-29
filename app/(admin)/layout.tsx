import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
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

  const hasOtherRole =
    currentUser.role.includes("lawyer") ||
    currentUser.role.includes("officeOwner");

  return (
    <AdminLayoutClient
      userName={`${currentUser.firstName} ${currentUser.lastName}`}
      hasOtherRole={hasOtherRole}
    >
      {children}
    </AdminLayoutClient>
  );
}
