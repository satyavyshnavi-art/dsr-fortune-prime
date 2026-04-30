"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color?: "blue" | "green" | "red" | "yellow" | "slate";
  className?: string;
}

const colorMap = {
  blue: "bg-[#ecfdf5]/70 text-[#065f46] border-[#a7f3d0]",
  green: "bg-[#ecfdf5]/70 text-[#065f46] border-[#a7f3d0]",
  red: "bg-red-50/70 text-red-700 border-red-100",
  yellow: "bg-amber-50/70 text-amber-700 border-amber-100",
  slate: "bg-slate-50/70 text-slate-600 border-slate-100",
};

const iconColorMap = {
  blue: "bg-[#d1fae5] text-[#10b981]",
  green: "bg-[#d1fae5] text-[#10b981]",
  red: "bg-red-100/80 text-red-500",
  yellow: "bg-amber-100/80 text-amber-500",
  slate: "bg-slate-100/80 text-slate-500",
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color = "blue",
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 transition-shadow hover:shadow-sm",
        colorMap[color],
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider opacity-60 truncate">
            {title}
          </p>
          <p className="text-lg font-bold leading-tight mt-0.5">{value}</p>
          {subtitle && <p className="text-[10px] opacity-50 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={cn("rounded-md p-1.5 shrink-0", iconColorMap[color])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px]">
          <span
            className={
              trend === "up"
                ? "text-green-600"
                : trend === "down"
                ? "text-red-600"
                : "text-slate-400"
            }
          >
            {trend === "up" ? "+" : trend === "down" ? "-" : ""}
            {trendValue}
          </span>
          <span className="opacity-40">vs last period</span>
        </div>
      )}
    </div>
  );
}
