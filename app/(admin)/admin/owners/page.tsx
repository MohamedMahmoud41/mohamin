import { getAllOffices } from "@/services/office";
import { adminGetOfficeEligibleUsers } from "@/app/actions/admin/offices";
import AdminOfficesTable from "@/components/admin/AdminOfficesTable";

export const metadata = { title: "إدارة المكاتب" };

export default async function AdminOwnersPage() {
  const [{ data: offices }, { owners, lawyers }] = await Promise.all([
    getAllOffices(),
    adminGetOfficeEligibleUsers(),
  ]);
  return (
    <div className="p-6 md:p-8">
      <AdminOfficesTable
        initialOffices={offices ?? []}
        eligibleOwners={owners}
        eligibleLawyers={lawyers}
      />
    </div>
  );
}
