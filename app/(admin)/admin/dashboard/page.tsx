import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllLawyers } from "@/services/lawyers";
import { getAllOffices } from "@/services/office";
import { getCourts } from "@/services/courts";
import { getAllPosts } from "@/services/posts";
import { getAllCases } from "@/services/cases";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "لوحة الإدارة" };

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [lawyersRes, officesRes, courtsRes, postsRes, casesRes] = await Promise.all([
    getAllLawyers(),
    getAllOffices(),
    getCourts(),
    getAllPosts(),
    getAllCases(),
  ]);

  return (
    <AdminDashboard
      lawyers={lawyersRes.data ?? []}
      offices={officesRes.data ?? []}
      courts={courtsRes.data ?? []}
      posts={postsRes.data ?? []}
      cases={casesRes.data ?? []}
    />
  );
}
