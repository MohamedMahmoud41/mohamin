"use client";

// CLIENT COMPONENT — uses useState (notifications panel), onClick
import { Bell, Scale, ShieldCheck, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import NotificationPanel from "./NotificationPanel";
import NavbarDropdown from "./NavbarDropdown";
import type { User, Office } from "@/types";

interface HeaderProps {
  /** Full user profile fetched server-side in the layout. Null on error. */
  user: User | null;
  /** All offices the user belongs to (owned or member). */
  offices: Office[];
  /** Callback to open the sidebar drawer on mobile */
  onMenuOpen?: () => void;
}

export default function Header({ user, offices, onMenuOpen }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isOwner = user?.role?.includes("officeOwner");
  const isAdmin = user?.role?.includes("admin");

  return (
    <nav className="bg-surface px-4 md:px-8 h-16 flex items-center justify-between border-b border-border shadow-sm flex-shrink-0 z-20 gap-2">
      {/* Right side: hamburger + brand */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuOpen}
          className="lg:hidden p-2 rounded-lg hover:bg-beige transition text-text-secondary"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-3 text-primary">
          <Scale className="w-7 h-7 md:w-8 md:h-8" />
          <div className="hidden sm:flex flex-col text-right leading-tight">
            <span className="font-bold text-lg">محامي</span>
            <span className="text-sm text-text-muted">
              {isOwner ? "إدارة المكتب" : "إدارة المحامي"}
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Admin switcher */}
        {isAdmin && (
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 px-2 md:px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShieldCheck size={14} />
            <span className="hidden sm:inline">لوحة الإدارة</span>
          </Link>
        )}

        {/* Notifications bell */}
        <div className="relative flex items-center justify-center text-primary">
          <button
            onClick={() => setNotificationsOpen(true)}
            aria-label="الإشعارات"
            className="cursor-pointer hover:opacity-75 transition-opacity"
          >
            <Bell className="w-5 h-5" />
          </button>
          {notificationsOpen && (
            <NotificationPanel onClose={() => setNotificationsOpen(false)} />
          )}
        </div>

        {/* Vertical divider */}
        <div className="hidden sm:block border-r border-divider h-8 mx-1 md:mx-2" />

        {/* User dropdown (avatar + settings + theme + workspace + language) */}
        <NavbarDropdown user={user} offices={offices} />
      </div>
    </nav>
  );
}
