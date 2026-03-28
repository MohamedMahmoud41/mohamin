import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { reason?: string };
}) {
  return <SignInForm reason={searchParams.reason} />;
}
