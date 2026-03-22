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

export async function getAllPosts(): Promise<ApiResponse<Post[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as Post[]) ?? [], error: error?.message ?? null };
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

  return { data: (data as Post) ?? null, error: error?.message ?? null };
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

  return { data: (data as Post) ?? null, error: error?.message ?? null };
}

export async function deletePost(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);

  return { data: null, error: error?.message ?? null };
}
