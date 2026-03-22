"use client";

/**
 * useUser
 *
 * Replaces: Redux `selectUser` selector + `fetchUserData` thunk
 * Returns the current authenticated user and a loading flag.
 *
 * Usage:
 *   const { user, loading } = useUser();
 */
import { useEffect, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useSupabase } from "@/hooks/useSupabase";

interface UseUserReturn {
  user: SupabaseUser | null;
  loading: boolean;
}

export function useUser(): UseUserReturn {
  const supabase = useSupabase();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get the initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes (sign in / sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return { user, loading };
}
