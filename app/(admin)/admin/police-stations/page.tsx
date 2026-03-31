import { getPoliceStations } from "@/services/police_stations";
import { getGovernorates } from "@/services/governorates";
import AdminPoliceStationsTable from "@/components/admin/AdminPoliceStationsTable";

export const metadata = { title: "مراكز الشرطة" };

export default async function AdminPoliceStationsPage() {
  const [{ data: stations }, { data: governorates }] = await Promise.all([
    getPoliceStations(),
    getGovernorates(),
  ]);
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminPoliceStationsTable
        initialStations={stations ?? []}
        governorates={governorates ?? []}
      />
    </div>
  );
}
