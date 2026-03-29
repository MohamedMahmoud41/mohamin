"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";

interface AdminLayoutClientProps {
  userName: string;
  hasOtherRole: boolean;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  userName,
  hasOtherRole,
  children,
}: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div dir="rtl" className="flex min-h-screen bg-background">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-surface border-b border-border px-4 md:px-8 py-4 flex items-center justify-between gap-4">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-beige transition text-text-secondary"
            aria-label="فتح القائمة"
          >
            <Menu className="w-5 h-5" />
          </button>

          <span className="text-text-muted text-sm truncate">
            لوحة الإدارة – {userName}
          </span>

          <div className="flex items-center gap-3 shrink-0">
            {hasOtherRole && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary border border-border hover:border-primary px-3 py-1.5 rounded-lg transition-colors"
              >
                <LayoutDashboard size={15} />
                <span className="hidden sm:inline">لوحة المحامي</span>
              </Link>
            )}
            <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium whitespace-nowrap">
              مدير النظام
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
