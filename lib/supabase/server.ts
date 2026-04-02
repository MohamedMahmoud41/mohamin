import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase server client — for use in Server Components, Server Actions,
 * Route Handlers, and Layouts.
 *
 * Usage (Server Component):
 *   const supabase = await createClient();
 *   const { data } = await supabase.from("cases").select("*");
 */
export async function createClient() {
  const cookieStore = await cookies();

  const workspaceId = cookieStore.get("x-workspace-id")?.value ?? null;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: workspaceId ? { "x-workspace-id": workspaceId } : undefined,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(
                name,
                value,
                options as Parameters<typeof cookieStore.set>[2],
              ),
            );
          } catch {
            // setAll called from a Server Component — cookies can't be
            // mutated. Middleware handles session refresh instead.
          }
        },
      },
    },
  );
}
