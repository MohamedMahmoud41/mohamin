import { getAllOffices } from "@/services/office";
import AdminOfficesTable from "@/components/admin/AdminOfficesTable";

export const metadata = { title: "إدارة المكاتب" };

export default async function AdminOwnersPage() {
  const { data: offices } = await getAllOffices();
  return (
    <div className="p-6 md:p-8">
      <AdminOfficesTable initialOffices={offices ?? []} />
    </div>
  );
}
