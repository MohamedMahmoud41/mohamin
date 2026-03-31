import AdminCourtDivisionsTable from "@/components/admin/AdminCourtDivisionsTable";
import { getCourtDivisions } from "@/services/court_divisions";

export const metadata = { title: "أقسام المحاكم" };

export default async function AdminCourtDivisionsPage() {
  const { data: divisions } = await getCourtDivisions();
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminCourtDivisionsTable initialDivisions={divisions ?? []} />
    </div>
  );
}
