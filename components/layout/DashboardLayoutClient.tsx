"use client";

import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import type { User } from "@/types";

interface DashboardLayoutClientProps {
  user: User | null;
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  user,
  children,
}: DashboardLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header user={user} onMenuOpen={() => setSidebarOpen(true)} />

      <div className="flex flex-1 min-h-0">
        <Sidebar
          user={user}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
