import { getAllUsers } from "@/services/users";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export const metadata = { title: "إدارة المستخدمين" };

export default async function AdminUsersPage() {
  const { data: users } = await getAllUsers();
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminUsersTable initialUsers={users ?? []} />
    </div>
  );
}
