"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

/**
 * Specification Sheet KPI card.
 *
 * Signature elements:
 *   - Corner tick (top-left blueprint mark, via .spec-card)
 *   - Hero number in Newsreader Italic — modulated serif italic numerals
 *   - All chrome (label, subtitle, trend) in JetBrains Mono uppercase
 *
 * No colored tiles. No rounded corners. No shadows. The card looks like
 * a row torn from a building's spec book.
 */

type Trend = "up" | "down" | "neutral";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: Trend;
  trendValue?: string;
  /** Kept for backward-compat; ignored. */
  color?: string;
  className?: string;
}

const trendStyles: Record<Trend, string> = {
  up: "text-[var(--seal)]",
  down: "text-[var(--redline)]",
  neutral: "text-[var(--ink-faint)]",
};

const trendGlyph: Record<Trend, string> = {
  up: "↑",
  down: "↓",
  neutral: "—",
};

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        "bg-[var(--vellum)] border border-[var(--rule)] rounded-lg p-5 transition-colors hover:border-[var(--ink-faint)]/40",
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <p className="text-[12px] font-medium text-[var(--ink-muted)]">{title}</p>
        {Icon && (
          <div className="h-9 w-9 rounded-lg flex items-center justify-center bg-[var(--mark-soft)] text-[var(--mark)] shrink-0">
            <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={2} />
          </div>
        )}
      </div>

      <p className="text-[28px] font-bold leading-none text-[var(--ink)] tabular-nums">
        {value}
      </p>

      <div className="mt-3 flex items-center gap-2 min-h-[18px]">
        {trend && trendValue && (
          <span
            className={cn(
              "text-[12px] font-semibold tabular-nums",
              trendStyles[trend]
            )}
          >
            {trendGlyph[trend]} {trendValue}
          </span>
        )}
        {subtitle && (
          <span className="text-[12px] text-[var(--ink-faint)] truncate">{subtitle}</span>
        )}
      </div>
    </div>
  );
}
