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
  up: "▲",
  down: "▼",
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
        "spec-card bg-[var(--vellum)] border border-[var(--ink)] p-5 pt-7",
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {title}
        </p>
        {Icon && (
          <Icon
            className="h-4 w-4 text-[var(--ink)] shrink-0"
            aria-hidden="true"
            strokeWidth={1.25}
          />
        )}
      </div>

      <p
        className="text-[38px] font-semibold leading-none text-[var(--ink)] tabular-nums"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {value}
      </p>

      <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between gap-2 min-h-[20px]">
        {subtitle ? (
          <span
            className="text-[11px] uppercase tracking-[0.08em] text-[var(--ink-faint)] truncate"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {subtitle}
          </span>
        ) : <span />}
        {trend && trendValue && (
          <span
            className={cn(
              "text-[12px] font-semibold tabular-nums shrink-0",
              trendStyles[trend]
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {trendGlyph[trend]} {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}
