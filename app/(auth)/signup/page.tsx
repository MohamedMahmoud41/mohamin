import type { Metadata } from "next";
import SignUpForm from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "إنشاء حساب",
};

// SERVER COMPONENT — just renders the Client form inside the auth layout
export default function SignupPage() {
  return <SignUpForm />;
}
