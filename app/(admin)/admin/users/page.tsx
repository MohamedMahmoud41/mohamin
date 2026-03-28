import { getAllUsers } from "@/services/users";
import AdminUsersTable from "@/components/admin/AdminUsersTable";

export const metadata = { title: "إدارة المستخدمين" };

export default async function AdminUsersPage() {
  const { data: users } = await getAllUsers();
  return (
    <div className="p-6 md:p-8">
      <AdminUsersTable initialUsers={users ?? []} />
    </div>
  );
}
