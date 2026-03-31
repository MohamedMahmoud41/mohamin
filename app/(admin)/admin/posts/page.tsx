import { getAllPosts } from "@/services/posts";
import AdminPostsTable from "@/components/admin/AdminPostsTable";

export const metadata = { title: "إدارة المنشورات" };

export default async function AdminPostsPage() {
  const { data: posts } = await getAllPosts();
  return (
    <div className="px-6 md:px-8 py-2">
      <AdminPostsTable initialPosts={posts ?? []} />
    </div>
  );
}
