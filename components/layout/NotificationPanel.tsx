"use client";

// CLIENT COMPONENT — controls open/close state; will own Supabase real-time subscription
import { X } from "lucide-react";
// TODO (Step 5 – Posts/Notifications): wire up Supabase real-time channel
// import { useSupabase } from "@/hooks/useSupabase";
// import { useEffect, useState } from "react";
// import type { Notification } from "@/types";

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  // TODO: Replace stub with Supabase subscription:
  //   const supabase = useSupabase();
  //   const [notifications, setNotifications] = useState<Notification[]>([]);
  //   useEffect(() => {
  //     const channel = supabase
  //       .channel("notifications")
  //       .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, (p) => {
  //         if (p.eventType === "INSERT") setNotifications((prev) => [p.new as Notification, ...prev]);
  //       })
  //       .subscribe();
  //     return () => { supabase.removeChannel(channel); };
  //   }, [supabase]);

  return (
    // Backdrop — click outside to close
    <div
      className="fixed inset-0 top-16 bg-black/50 flex items-start justify-center pt-5 z-50"
      onClick={onClose}
    >
      <div
        className="w-1/3 min-w-[350px] bg-surface rounded-2xl shadow-lg max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6">
          <p className="text-primary text-lg font-semibold">الإشعارات</p>
          <button
            onClick={onClose}
            aria-label="إغلاق الإشعارات"
            className="cursor-pointer"
          >
            <X className="w-6 h-6 text-text-muted hover:text-text-primary transition-colors" />
          </button>
        </div>

        <hr className="border-border" />

        {/* Empty state — will be replaced when notifications are implemented */}
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="text-center py-10 text-text-muted text-sm">
            لا توجد إشعارات حالياً
          </div>
        </div>
      </div>
    </div>
  );
}
