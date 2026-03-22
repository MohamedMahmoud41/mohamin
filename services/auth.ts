/**
 * Authentication service
 *
 * Replaces: src/Store/auth.js (Firebase Auth calls)
 * Now uses:  Supabase Auth
 *
 * Old → New mapping:
 *   signInWithEmailAndPassword()  →  supabase.auth.signInWithPassword()
 *   createUserWithEmailAndPassword() → supabase.auth.signUp()
 *   sendPasswordResetEmail()      →  supabase.auth.resetPasswordForEmail()
 *   signOut()                     →  supabase.auth.signOut()
 *   updatePassword()              →  supabase.auth.updateUser({ password })
 */
"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { ApiResponse } from "@/types";

export async function signIn(
  email: string,
  password: string,
): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

export async function signUp(
  email: string,
  password: string,
  metadata: {
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  },
): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata, // stored in auth.users.raw_user_meta_data
    },
  });

  if (error) {
    return { data: null, error: error.message };
  }

  // TODO: Create the user profile row in the `users` table via a
  // Supabase database trigger (recommended) or by calling usersService.createProfile()
  // Trigger approach: CREATE OR REPLACE FUNCTION on_auth_user_created()...

  return { data: null, error: null };
}

export async function resetPassword(email: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/settings/security?reset=true`,
  });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(
  newPassword: string,
): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: null, error: null };
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
