import { getAllPosts } from "@/services/posts";
import AdminPostsTable from "@/components/admin/AdminPostsTable";

export const metadata = { title: "إدارة المنشورات" };

export default async function AdminPostsPage() {
  const { data: posts } = await getAllPosts();
  return (
    <div className="p-6 md:p-8">
      <AdminPostsTable initialPosts={posts ?? []} />
    </div>
  );
}
