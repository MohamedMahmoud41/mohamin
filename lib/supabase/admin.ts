import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client — uses the service role key.
 * Bypasses RLS and has full access to auth.admin.* API.
 *
 * ONLY call this from server actions and server components.
 * Never import this file from a client component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
