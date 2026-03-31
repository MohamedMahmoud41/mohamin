import { getCaseTypes } from "@/services/case_types";
import { getCourts } from "@/services/courts";
import AdminCaseTypesTable from "@/components/admin/AdminCaseTypesTable";

export const metadata = { title: "أنواع القضايا" };

export default async function AdminCaseTypesPage() {
  const [{ data: caseTypes }, { data: courts }] = await Promise.all([
    getCaseTypes(),
    getCourts(),
  ]);
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminCaseTypesTable
        initialCaseTypes={caseTypes ?? []}
        courts={courts ?? []}
      />
    </div>
  );
}
