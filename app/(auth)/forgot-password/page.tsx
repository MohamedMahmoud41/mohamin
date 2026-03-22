import type { Metadata } from "next";
import ForgotForm from "@/components/auth/ForgotForm";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
};

// SERVER COMPONENT — just renders the Client form inside the auth layout
export default function ForgotPasswordPage() {
  return <ForgotForm />;
}
