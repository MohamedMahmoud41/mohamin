"use client";

import { useRouter } from "next/navigation";
import { Clock, MapPin } from "lucide-react";

interface SessionCardProps {
  id: string;
  title: string;
  reference: string;
  date: { day: number; month: string };
  time: string;
  location: string;
}

export default function SessionCard({
  id,
  title,
  reference,
  date,
  time,
  location,
}: SessionCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/cases/${id}`)}
      className="bg-surface p-4 rounded-xl shadow-sm border border-border mb-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex gap-3">
        <div className="bg-beige p-2 rounded-lg flex flex-col items-center justify-center min-w-[60px]">
          <span className="text-xs text-text-secondary font-medium">
            {date.month}
          </span>
          <span className="text-xl font-bold text-text-primary">
            {date.day}
          </span>
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-text-primary text-sm">{title}</h4>
          <p className="text-xs text-text-muted mb-2">{reference}</p>

          <div className="flex flex-col gap-1">
            <div className="flex items-center text-xs text-text-secondary">
              <Clock className="w-3 h-3 ml-1" />
              {time}
            </div>
            <div className="flex items-center text-xs text-text-secondary">
              <MapPin className="w-3 h-3 ml-1" />
              {location}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
