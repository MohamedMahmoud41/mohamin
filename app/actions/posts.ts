"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types";

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

export async function createPost(data: {
  postTitle: string;
  postContent: string;
  postOfficeName?: string;
  officeId?: string;
}): Promise<{ data: Post | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "غير مصرح" };

  const { data: result, error } = await supabase
    .from("posts")
    .insert({
      post_title: data.postTitle,
      post_content: data.postContent,
      post_office_name: data.postOfficeName,
      office_id: data.officeId,
      author_id: user.id,
      post_time: new Date().toISOString(),
    })
    .select()
    .single();

  revalidatePath("/posts");
  return {
    data: result ? mapPost(result) : null,
    error: error?.message ?? null,
  };
}

export async function deletePost(
  postId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/posts");
  return { error: error?.message ?? null };
}
