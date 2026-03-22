import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase browser client — for use in Client Components ("use client")
 *
 * Usage:
 *   const supabase = createClient();
 *   const { data, error } = await supabase.from("cases").select("*");
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
