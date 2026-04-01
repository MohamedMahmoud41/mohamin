"use client";

// CLIENT COMPONENT — uses usePathname() for active-link highlighting; calls signOut server action
import {
  LayoutGrid,
  Scale,
  PlusCircle,
  Users,
  Building2,
  BarChart3,
  MessageCircle,
  Settings,
  LogOut,
  X,
  Building,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import type { User } from "@/types";

interface SidebarProps {
  /** Full user profile passed down from the Server layout. */
  user: User | null;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ user, open, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isOwner = user?.role?.includes("officeOwner");
  const hasOffice = isOwner || !!user?.officeId;

  const menu = [
    { label: "لوحة التحكم", icon: LayoutGrid, path: "/dashboard" },
    { label: "القضايا", icon: Scale, path: "/cases" },
    { label: "إضافة قضية", icon: PlusCircle, path: "/cases/new" },
    { label: "العملاء", icon: UserCheck, path: "/clients" },
    { label: "المحاكم", icon: Building, path: "/courts" },
    ...(isOwner ? [{ label: "المحامون", icon: Users, path: "/lawyers" }] : []),
    ...(hasOffice
      ? [{ label: "المكتب", icon: Building2, path: "/office" }]
      : []),
    ...(isOwner
      ? [{ label: "الإحصائيات", icon: BarChart3, path: "/reports" }]
      : []),
    { label: "الإعلانات", icon: MessageCircle, path: "/posts" },
    { label: "الإعدادات", icon: Settings, path: "/settings" },
  ];

  const sidebar = (
    <aside className="w-64 bg-surface border-l border-border flex flex-col justify-between overflow-hidden shadow-sm flex-shrink-0 h-full">
      <div className="flex items-center justify-between p-4 pt-3 lg:hidden border-b border-border">
        <span className="font-bold text-text-primary">القائمة</span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-beige transition"
          >
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        )}
      </div>
      <nav className="flex flex-col gap-2 p-4 pt-3 flex-1">
        {menu.map((item) => {
          const Icon = item.icon;
          // Exact match for /cases/new so it doesn't highlight under /cases
          const isActive =
            item.path === "/cases/new"
              ? pathname === "/cases/new"
              : pathname.startsWith(item.path) && pathname !== "/cases/new";

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-sm text-sm font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md"
                  : "text-text-secondary hover:bg-beige hover:text-text-secondary"
              }`}
            >
              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isActive ? "text-white" : "text-text-secondary"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-error hover:bg-error/10 rounded-sm transition-colors cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-error" />
            <span className="whitespace-nowrap">تسجيل الخروج</span>
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
