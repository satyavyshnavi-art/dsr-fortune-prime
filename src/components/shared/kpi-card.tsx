"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

/**
 * Editorial Architectural KPI card.
 *
 * No colored icon tile. No pastel accents. Each card is a vellum surface with
 * a single warm rule above the data — like a column in a balance sheet.
 *
 * Structure (top → bottom):
 *   1. Eyebrow label (uppercase Manrope, tracking, ink-muted)
 *   2. Hero number (large JetBrains Mono, ink, tabular)
 *   3. Sub-text (Manrope, ink-faint)
 *   4. Optional trend chip (text-only, monospace)
 *
 * The icon, if provided, sits TOP-RIGHT as a quiet stroked glyph in ink-faint —
 * never as a colored tile. Color carries meaning only on the trend chip.
 */

type Trend = "up" | "down" | "neutral";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: Trend;
  trendValue?: string;
  /** Kept for backward-compat with old call sites; ignored in editorial layout. */
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
  neutral: "–",
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
        "bg-[var(--vellum)] border border-[var(--rule)] rounded-md p-6 transition-colors hover:border-[var(--ink-faint)]/40",
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[var(--ink-muted)] leading-tight">
          {title}
        </p>
        {Icon && (
          <Icon className="h-5 w-5 text-[var(--ink-faint)] shrink-0" aria-hidden="true" strokeWidth={1.5} />
        )}
      </div>

      <p
        className="font-mono text-[40px] font-medium leading-none text-[var(--ink)] tabular-nums"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </p>

      <div className="mt-4 flex items-center gap-3 min-h-[18px]">
        {trend && trendValue && (
          <span
            className={cn(
              "font-mono text-[13px] font-medium tabular-nums",
              trendStyles[trend]
            )}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {trendGlyph[trend]} {trendValue}
          </span>
        )}
        {subtitle && (
          <span className="text-[12px] text-[var(--ink-faint)] truncate">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
