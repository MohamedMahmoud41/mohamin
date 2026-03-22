"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types";

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
      ...data,
      author_id: user.id,
      post_time: new Date().toISOString(),
    })
    .select()
    .single();

  revalidatePath("/posts");
  return { data: result as Post | null, error: error?.message ?? null };
}

export async function deletePost(
  postId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", postId);
  revalidatePath("/posts");
  return { error: error?.message ?? null };
}
