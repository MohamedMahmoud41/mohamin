"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

export default function AppearanceForm() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    const resolved = saved ?? "light";
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  function handleToggle(t: Theme) {
    setTheme(t);
    localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return (
    <div dir="rtl" className="max-w-2xl">
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <div>
          <div className="text-text-primary font-bold text-base mb-1">
            مظهر التطبيق
          </div>
          <div className="text-text-muted text-sm">
            اختر الوضع المناسب لتصفحك
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Light */}
          <button
            onClick={() => handleToggle("light")}
            className={`p-4 border-2 rounded-xl text-center transition ${
              theme === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <Sun
              className={`w-8 h-8 mx-auto mb-2 ${theme === "light" ? "text-primary" : "text-text-muted"}`}
            />
            <div
              className={`font-medium text-sm ${theme === "light" ? "text-primary" : "text-text-secondary"}`}
            >
              الوضع الفاتح
            </div>
            {theme === "light" && (
              <div className="mt-1 text-xs text-primary font-semibold">
                مفعّل
              </div>
            )}
          </button>

          {/* Dark */}
          <button
            onClick={() => handleToggle("dark")}
            className={`p-4 border-2 rounded-xl text-center transition ${
              theme === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40"
            }`}
          >
            <Moon
              className={`w-8 h-8 mx-auto mb-2 ${theme === "dark" ? "text-primary" : "text-text-muted"}`}
            />
            <div
              className={`font-medium text-sm ${theme === "dark" ? "text-primary" : "text-text-secondary"}`}
            >
              الوضع الداكن
            </div>
            {theme === "dark" && (
              <div className="mt-1 text-xs text-primary font-semibold">
                مفعّل
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
