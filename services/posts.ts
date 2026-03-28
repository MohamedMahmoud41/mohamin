/**
 * Posts service
 *
 * Replaces: src/Store/Slices/postsSlice.js + src/firestore/fireStoreFuctions/postsApi.js
 * Now uses:  Supabase `posts` table
 *
 * Real-time note:
 *   For live updates (the old project used Firestore onSnapshot), subscribe in a
 *   Client Component:
 *     supabase.channel('posts').on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, cb).subscribe()
 */
import { createClient } from "@/lib/supabase/server";
import type { Post, ApiResponse } from "@/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(row: Record<string, any>): Post {
  return {
    id: row.id,
    postTitle: row.post_title,
    postContent: row.post_content ?? "",
    postOfficeName: row.post_office_name ?? "",
    officeId: row.office_id ?? "",
    authorId: row.author_id ?? "",
    postTime: row.post_time ?? "",
    createdAt: row.created_at,
  };
}

export async function getAllPosts(): Promise<ApiResponse<Post[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data ?? []).map(mapPost), error: error?.message ?? null };
}

export async function getPostById(
  id: string,
): Promise<ApiResponse<Post | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  return { data: data ? mapPost(data) : null, error: error?.message ?? null };
}

export async function createPost(
  payload: Omit<Post, "id" | "created_at" | "updated_at">,
): Promise<ApiResponse<Post | null>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .insert(payload)
    .select()
    .single();

  return { data: data ? mapPost(data) : null, error: error?.message ?? null };
}

export async function deletePost(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  return { data: null, error: error?.message ?? null };
}
