/**
 * Settings layout — tabbed navigation
 *
 * Migration path:
 *   Old: src/pages/Settings/SettingsPage.jsx
 *   Old tabs: profile, notifications, appearance, security
 *   New sub-routes:
 *     /settings          → /settings/profile (redirect)
 *     /settings/profile
 *     /settings/notifications
 *     /settings/appearance
 *     /settings/security
 */
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "الإعدادات" };

const tabs = [
  { id: "profile", label: "الملف الشخصي" },
  { id: "notifications", label: "الإشعارات" },
  { id: "appearance", label: "المظهر" },
  { id: "security", label: "الأمان" },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="page-container space-y-8">
      <div>
        <h2 className="page-title">الإعدادات</h2>
        <p className="page-subtitle">إدارة حسابك وتفضيلات التطبيق</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-4 md:gap-8 border-b border-border pb-2 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={`/settings/${tab.id}`}
            className="pb-2 text-sm font-medium text-text-muted hover:text-text-secondary transition-colors"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Active tab content */}
      {children}
    </div>
  );
}
