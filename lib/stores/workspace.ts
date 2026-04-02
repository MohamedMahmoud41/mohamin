"use client";

import { create } from "zustand";

interface WorkspaceState {
  workspaceId: string | null;
  setWorkspaceId: (id: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaceId:
    typeof window !== "undefined" ? localStorage.getItem("workspaceId") : null,
  setWorkspaceId: (id: string) => {
    localStorage.setItem("workspaceId", id);
    // Also set a cookie so server-side code can read it
    document.cookie = `x-workspace-id=${encodeURIComponent(id)};path=/;max-age=31536000;SameSite=Lax`;
    set({ workspaceId: id });
  },
}));
