// SERVER COMPONENT — pure display, no interactivity
import type { ReactNode } from "react";

interface NotificationItemProps {
  children: ReactNode;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export default function NotificationItem({
  children,
  title,
  message,
  time,
  isRead,
}: NotificationItemProps) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
        isRead
          ? "bg-surface border-transparent"
          : "bg-surface-hover border-primary/20 shadow-sm"
      } hover:bg-beige-light hover:border-primary/30`}
    >
      <div className="pt-1">{children}</div>

      <div className="flex flex-col flex-1 gap-1">
        <div className="flex justify-between items-start">
          <p
            className={`text-sm font-semibold ${
              isRead ? "text-text-primary" : "text-primary"
            }`}
          >
            {title}
          </p>
          {!isRead && (
            <span className="w-2 h-2 bg-error rounded-full animate-pulse" />
          )}
        </div>

        <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
          {message}
        </p>

        <p className="text-[10px] text-text-muted mt-1 font-medium">{time}</p>
      </div>
    </div>
  );
}
