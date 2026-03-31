import { getCourts } from "@/services/courts";
import { getGovernorates } from "@/services/governorates";
import AdminCourtsTable from "@/components/admin/AdminCourtsTable";

export const metadata = { title: "إدارة المحاكم" };

export default async function AdminCourtsPage() {
  const [{ data: courts }, { data: governorates }] = await Promise.all([
    getCourts(),
    getGovernorates(),
  ]);
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminCourtsTable
        initialCourts={courts ?? []}
        governorates={governorates ?? []}
      />
    </div>
  );
}
