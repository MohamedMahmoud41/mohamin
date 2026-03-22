"use client";

// CLIENT COMPONENT — uses useState (theme, notifications panel), localStorage, onClick
import { Settings, Bell, Scale, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import NotificationPanel from "./NotificationPanel";
import type { User } from "@/types";

interface HeaderProps {
  /** Full user profile fetched server-side in the layout. Null on error. */
  user: User | null;
}

export default function Header({ user }: HeaderProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme from localStorage on first mount
  useEffect(() => {
    const saved =
      (localStorage.getItem("theme") as "light" | "dark") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    // Notify other components that may listen for theme changes
    window.dispatchEvent(new Event("theme-change"));
  };

  const isOwner = user?.role?.includes("officeOwner");

  return (
    <nav className="bg-surface px-8 h-16 flex items-center justify-between border-b border-border shadow-sm flex-shrink-0 z-20">
      {/* Brand */}
      <div className="flex items-center gap-3 text-primary">
        <Scale className="w-8 h-8" />
        <div className="flex flex-col text-right leading-tight">
          <span className="font-bold text-lg">محامي</span>
          <span className="text-sm text-text-muted">
            {isOwner ? "إدارة المكتب" : "إدارة المحامي"}
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4 text-primary">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="تبديل المظهر"
            className="cursor-pointer hover:opacity-75 transition-opacity"
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(true)}
              aria-label="الإشعارات"
              className="cursor-pointer hover:opacity-75 transition-opacity"
            >
              <Bell className="w-5 h-5" />
            </button>
            {/* TODO: show red dot when there are unread notifications */}
            {notificationsOpen && (
              <NotificationPanel onClose={() => setNotificationsOpen(false)} />
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            aria-label="الإعدادات"
            className="hover:opacity-75 transition-opacity"
          >
            <Settings className="w-5 h-5 cursor-pointer" />
          </Link>
        </div>

        {/* Vertical divider */}
        <div className="border-r border-divider h-8 mx-2" />

        {/* User name + role */}
        <div className="flex flex-col leading-tight text-right">
          <span className="font-semibold text-text-primary">
            {user ? `${user.firstName} ${user.lastName}` : "زائر"}
          </span>
          <span className="text-sm text-text-muted">
            {isOwner ? "صاحب المكتب" : "محامي"}
          </span>
        </div>

        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg overflow-hidden border border-border flex-shrink-0">
          {user?.profileImageUrl ? (
            <Image
              src={user.profileImageUrl}
              alt={`صورة ${user.firstName}`}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{user?.firstName?.[0] ?? "م"}</span>
          )}
        </div>
      </div>
    </nav>
  );
}
