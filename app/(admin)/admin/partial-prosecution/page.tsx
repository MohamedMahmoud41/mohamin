import { getPartialProsecutions } from "@/services/partial_prosecution";
import { getCourts } from "@/services/courts";
import AdminPartialProsecutionTable from "@/components/admin/AdminPartialProsecutionTable";

export const metadata = { title: "النيابات الجزئية" };

export default async function AdminPartialProsecutionPage() {
  const [{ data: items }, { data: courts }] = await Promise.all([
    getPartialProsecutions(),
    getCourts(),
  ]);
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminPartialProsecutionTable
        initialItems={items ?? []}
        courts={courts ?? []}
      />
    </div>
  );
}
