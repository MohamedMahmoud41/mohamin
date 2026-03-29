"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  Gavel,
  FileText,
  LogOut,
  X,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";

const navItems = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/users", label: "المستخدمون", icon: Users },
  { href: "/admin/owners", label: "المكاتب", icon: Building2 },
  { href: "/admin/courts", label: "المحاكم", icon: Gavel },
  { href: "/admin/posts", label: "المنشورات", icon: FileText },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebar = (
    <aside className="w-64 bg-primary text-white flex-shrink-0 flex flex-col h-full">
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">لوحة الإدارة</h2>
          <p className="text-white/60 text-xs mt-1">نظام إدارة المحاماة</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-4">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden lg:flex flex-shrink-0">{sidebar}</div>

      {/* Mobile: overlay drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="relative flex">{sidebar}</div>
        </div>
      )}
    </>
  );
}
