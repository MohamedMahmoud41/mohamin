import { getGovernorates } from "@/services/governorates";
import AdminGovernoratesTable from "@/components/admin/AdminGovernoratesTable";

export const metadata = { title: "إدارة المحافظات" };

export default async function AdminGovernoratesPage() {
  const { data: governorates } = await getGovernorates();
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminGovernoratesTable initialGovernorates={governorates ?? []} />
    </div>
  );
}
