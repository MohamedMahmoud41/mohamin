"use server";

/**
 * Auth Server Actions
 *
 * These are the ONLY functions that touch Supabase Auth.
 * They run exclusively on the server — cookies are set automatically
 * by @supabase/ssr through the server client.
 *
 * Architecture:
 *   Client Component (form) → calls these server actions → Supabase Auth
 *   → cookies set on response → middleware refreshes on next request
 *
 * Why "use server" here and not in /services?
 *   "use server" marks a file as a Server Action Module — all exports
 *   become callable over an encrypted RPC channel from Client Components.
 *   /services is for read-only data access (no "use server" at file level).
 */

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

// ─── Sign In ─────────────────────────────────────────────────────────────────

export async function signIn(
  email: string,
  password: string,
): Promise<{ error: string | null; redirectTo?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  if (data.user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_banned, is_test, created_at, role")
      .eq("id", data.user.id)
      .single();

    if (profile?.is_banned) {
      await supabase.auth.signOut();
      return { error: "تم حظر هذا الحساب. تواصل مع المدير." };
    }

    if (profile?.is_test) {
      const age = Date.now() - new Date(profile.created_at).getTime();
      if (age > 72 * 60 * 60 * 1000) {
        await supabase.auth.signOut();
        return {
          error: "انتهت صلاحية حساب الاختبار (72 ساعة). تواصل مع المدير.",
        };
      }
    }

    const redirectTo = profile?.role?.includes("admin")
      ? "/admin/dashboard"
      : "/dashboard";

    return { error: null, redirectTo };
  }

  return { error: null, redirectTo: "/dashboard" };
}

// ─── Sign Up ─────────────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  metadata: {
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  },
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // IMPORTANT: Keys must be snake_case to match the DB trigger:
      //   handle_new_user() reads raw_user_meta_data->>'first_name'
      // Using camelCase here would silently break profile row creation.
      data: {
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        phone: metadata.phone,
        role: metadata.role,
      },
    },
  });

  if (error) return { error: error.message };
  return { error: null };
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // redirect() inside a server action sends a 303 redirect to the client.
  // This is intentional — do NOT return a value after this.
  redirect("/login");
}

// ─── Reset Password (send email) ─────────────────────────────────────────────

export async function resetPassword(
  email: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // After clicking the link in the email, Supabase redirects here.
    // The user lands on /settings/security with a ?reset=true query param.
    // NEXT_PUBLIC_APP_URL must be set in .env.local (e.g. http://localhost:3001)
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/settings/security?reset=true`,
  });

  if (error) return { error: error.message };
  return { error: null };
}
