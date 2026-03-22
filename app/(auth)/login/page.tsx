import type { Metadata } from "next";
import SignInForm from "@/components/auth/SignInForm";

export const metadata: Metadata = {
  title: "تسجيل الدخول",
};

// SERVER COMPONENT — just renders the Client form inside the auth layout
export default function LoginPage() {
  return <SignInForm />;
}
