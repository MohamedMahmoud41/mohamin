"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Settings,
  Sun,
  Moon,
  Monitor,
  Globe,
  Building2,
  ChevronDown,
  Check,
  LogOut,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { useWorkspaceStore } from "@/lib/stores/workspace";
import type { User, Office } from "@/types";

type Theme = "light" | "dark" | "system";

interface NavbarDropdownProps {
  user: User | null;
  offices: Office[];
}

/**
 * Build the list of switchable workspaces.
 * - Personal workspace (for lawyers)
 * - One entry per office the user belongs to
 */
function buildWorkspaces(
  user: User | null,
  offices: Office[],
): { id: string; label: string }[] {
  if (!user) return [];
  const list: { id: string; label: string }[] = [];

  if (user.role.includes("lawyer")) {
    list.push({ id: `personal-${user.id}`, label: "المحامي الشخصي" });
  }

  for (const office of offices) {
    list.push({ id: office.id, label: office.name || "مساحة المكتب" });
  }

  return list;
}

/**
 * Show workspace switcher when more than one workspace is available.
 */
function shouldShowWorkspaces(user: User | null, offices: Office[]): boolean {
  if (!user) return false;
  const workspaceCount = buildWorkspaces(user, offices).length;
  return workspaceCount > 1;
}

function resolveSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? resolveSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", resolved);
  if (resolved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  window.dispatchEvent(new Event("theme-change"));
}

export default function NavbarDropdown({ user, offices }: NavbarDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Theme
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const saved = (localStorage.getItem("theme") as Theme) || "light";
    setThemeState(saved);
    applyTheme(saved);

    // Listen for system preference changes when theme is "system"
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (localStorage.getItem("theme") === "system") {
        applyTheme("system");
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    localStorage.setItem("theme", t);
    applyTheme(t);
  };

  // Workspace
  const { workspaceId, setWorkspaceId } = useWorkspaceStore();
  const workspaces = buildWorkspaces(user, offices);
  const showWorkspaces = shouldShowWorkspaces(user, offices);

  // Initialize workspace if not set
  useEffect(() => {
    if (showWorkspaces && !workspaceId && workspaces.length > 0) {
      setWorkspaceId(workspaces[0].id);
    }
  }, [showWorkspaces, workspaceId, workspaces, setWorkspaceId]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const themeOptions: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "فاتح", icon: Sun },
    { value: "dark", label: "داكن", icon: Moon },
    { value: "system", label: "النظام", icon: Monitor },
  ];

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger — Avatar + name */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 cursor-pointer rounded-lg hover:bg-surface-hover px-2 py-1.5 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* User name + role (desktop) */}
        <div className="hidden sm:flex flex-col leading-tight text-right">
          <span className="font-semibold text-text-primary text-sm">
            {user ? `${user.firstName} ${user.lastName}` : "زائر"}
          </span>
          <span className="text-xs text-text-muted">
            {user?.role?.includes("officeOwner") ? "صاحب المكتب" : "محامي"}
          </span>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-primary text-white flex items-center justify-center text-lg overflow-hidden border border-border flex-shrink-0">
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

        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown menu */}
      {open && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-surface border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* ── Workspace Section ── */}
          {showWorkspaces && workspaces.length > 0 && (
            <>
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  مساحة العمل
                </p>
              </div>
              <div className="py-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setWorkspaceId(ws.id);
                      setOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <span>{ws.label}</span>
                    {workspaceId === ws.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
              <div className="border-b border-border" />
            </>
          )}

          {/* ── Settings ── */}
          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Settings className="w-4 h-4 text-text-secondary" />
              الإعدادات
            </Link>
          </div>
          <div className="border-b border-border" />

          {/* ── Theme ── */}
          <div className="px-3 py-2">
            <p className="text-xs font-semibold text-text-muted mb-1.5">
              المظهر
            </p>
            <div className="flex gap-1">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isActive = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-text-secondary hover:bg-surface-hover"
                    }`}
                    title={opt.label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-b border-border" />

          {/* ── Language (disabled) ── */}
          <div className="py-1">
            <button
              disabled
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-text-muted cursor-not-allowed opacity-60"
              title="قريباً"
            >
              <Globe className="w-4 h-4" />
              اللغة
              <span className="mr-auto text-[10px] bg-border text-text-muted px-1.5 py-0.5 rounded">
                قريباً
              </span>
            </button>
          </div>
          <div className="border-b border-border" />

          {/* ── Logout ── */}
          <div className="py-1">
            <form action={signOut}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-error hover:bg-error/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
