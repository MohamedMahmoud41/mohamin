import { getAllLawyers } from "@/services/lawyers";
import AdminLawyersTable from "@/components/admin/AdminLawyersTable";

export const metadata = { title: "إدارة المحامين" };

export default async function AdminLawyersPage() {
  const { data: lawyers } = await getAllLawyers();
  return (
    <div className="p-6 md:p-8">
      <AdminLawyersTable initialLawyers={lawyers ?? []} />
    </div>
  );
}
