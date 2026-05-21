"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import { accent, type AccentToken } from "@/styles/tokens";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  /**
   * Visual accent. Legacy values ("blue", "green", "red", "yellow", "slate")
   * are remapped to the new pastel accents for backward compatibility.
   */
  color?: AccentToken | "blue" | "green" | "red" | "yellow" | "slate";
  className?: string;
}

// Map legacy color names to the new accent palette so existing usages keep
// working without per-file edits. Green collapses to mint per the 2026-05-21
// direction (no more green saves / no more green KPIs).
const legacyMap: Record<string, AccentToken> = {
  blue: "sky",
  green: "mint",
  red: "coral",
  yellow: "peach",
  slate: "lavender",
};

function resolveAccent(color: KPICardProps["color"]): AccentToken {
  if (!color) return "mint";
  if (color in accent) return color as AccentToken;
  return legacyMap[color] ?? "mint";
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color,
  className,
}: KPICardProps) {
  const a = accent[resolveAccent(color)];

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5 transition-shadow hover:shadow-sm",
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        {Icon && (
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", a.tile)}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        {trend && trendValue && (
          <span
            className={cn(
              "text-[11px] font-medium px-2 py-0.5 rounded-full",
              a.pill
            )}
          >
            {trend === "up" ? "↗ " : trend === "down" ? "↘ " : ""}
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-[12px] font-medium text-slate-500 mb-1">{title}</p>
      <p className="text-[26px] font-bold text-slate-900 leading-none mb-2">
        {value}
      </p>
      {subtitle && (
        <p className="text-[11px] text-slate-400">{subtitle}</p>
      )}
    </div>
  );
}
