import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/services/users";
import { getAllPosts } from "@/services/posts";
import PostsList from "@/components/posts/PostsList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "الإعلانات" };

export default async function PostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: currentUser }, postsRes] = await Promise.all([
    getCurrentUser(),
    getAllPosts(),
  ]);

  if (!currentUser) redirect("/login");

  const posts = postsRes.data ?? [];

  return <PostsList initialPosts={posts} currentUser={currentUser} />;
}
