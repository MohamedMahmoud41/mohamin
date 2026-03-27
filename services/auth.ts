/**
 * Auth read service
 *
 * Server-side helpers for reading auth state.
 * These are plain async functions — NOT server actions.
 * Use them in Server Components and other server-side code.
 *
 * For auth mutations (signIn, signUp, signOut, resetPassword)
 * see: app/actions/auth.ts
 */
import { createClient } from "@/lib/supabase/server";
import type { User as SupabaseUser } from "@supabase/supabase-js";

/**
 * Returns the currently authenticated auth.users row, or null.
 * Safe to call in any Server Component or Server Action.
 * Uses getUser() (server-verified) not getSession() (client-unverified).
 */
export async function getAuthUser(): Promise<SupabaseUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

/**
 * Returns true if there is an active authenticated session.
 * Useful for conditional rendering in server components.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthUser();
  return user !== null;
}
