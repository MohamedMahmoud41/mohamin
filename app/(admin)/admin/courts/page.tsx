import { getCourts } from "@/services/courts";
import AdminCourtsTable from "@/components/admin/AdminCourtsTable";

export const metadata = { title: "إدارة المحاكم" };

export default async function AdminCourtsPage() {
  const { data: courts } = await getCourts();
  return (
    <div className="p-6 md:p-8">
      <AdminCourtsTable initialCourts={courts ?? []} />
    </div>
  );
}
