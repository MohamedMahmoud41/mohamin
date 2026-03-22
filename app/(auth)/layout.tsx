// SERVER COMPONENT — static layout shell; no interactivity
import AuthSidePanel from "@/components/auth/AuthSidePanel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-surface-hover">
      {/* Form area — left in RTL */}
      <div className="flex-1 flex items-center justify-center bg-surface p-8">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Branded side panel — right in RTL, hidden on mobile */}
      <AuthSidePanel />
    </div>
  );
}
