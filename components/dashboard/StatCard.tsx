import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";

type TrendDirection = "up" | "down" | "neutral";
type ColorKey =
  | "primary"
  | "secondary"
  | "info"
  | "warning"
  | "success"
  | "error";

const colorMap: Record<ColorKey, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  info: "text-info",
  warning: "text-warning",
  success: "text-success",
  error: "text-error",
};

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: string;
  trendLabel: string;
  trendDirection?: TrendDirection;
  color?: ColorKey;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  trendDirection = "neutral",
  color = "primary",
}: StatCardProps) {
  let trendColor = "text-text-muted";
  let TrendIcon = Minus;

  if (trendDirection === "up") {
    trendColor = "text-success";
    TrendIcon = ArrowUpRight;
  } else if (trendDirection === "down") {
    trendColor = "text-error";
    TrendIcon = ArrowDownRight;
  }

  return (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-border hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-text-secondary text-sm font-semibold tracking-wide">
          {title}
        </h3>
        <Icon className={`w-5 h-5 ${colorMap[color] ?? "text-primary"}`} />
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold text-text-primary tracking-tight">
          {value}
        </span>
        <div className="flex items-center gap-2 text-xs font-medium mt-1">
          <span className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-3 h-3" />
            {trend}
          </span>
          <span className="text-text-muted">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}
