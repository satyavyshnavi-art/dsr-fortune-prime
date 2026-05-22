"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Specification Sheet status tag.
 *
 * Format: GLYPH SP LABEL
 *   ✓ COMPLETED
 *   ▲ OVERDUE
 *   ◆ IN PROGRESS
 *   ◯ PENDING
 *
 * No pill. No background. The glyph carries the meaning; the label is
 * monospace uppercase with track. Reads like a legend in a technical drawing.
 */

const variantStyle: Record<BadgeVariant, { color: string; glyph: string }> = {
  success:  { color: "text-[var(--seal)]",      glyph: "✓" },
  warning:  { color: "text-[var(--sodium)]",    glyph: "◐" },
  danger:   { color: "text-[var(--redline)]",   glyph: "▲" },
  info:     { color: "text-[var(--mark)]",      glyph: "◆" },
  neutral:  { color: "text-[var(--ink-muted)]", glyph: "◯" },
  purple:   { color: "text-[#6b4f8c]",          glyph: "◇" },
};

const autoVariant: Record<string, BadgeVariant> = {
  active: "success",
  present: "success",
  approved: "success",
  completed: "success",
  resolved: "success",
  green: "success",
  good: "success",
  maintenance: "warning",
  pending: "warning",
  in_progress: "info",
  open: "info",
  planning: "info",
  on_hold: "warning",
  inactive: "danger",
  absent: "danger",
  critical: "danger",
  high: "danger",
  rejected: "danger",
  red: "danger",
  low: "neutral",
  medium: "purple",
  leave: "purple",
  week_off: "neutral",
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const resolvedVariant = variant || autoVariant[status.toLowerCase()] || "neutral";
  const { color, glyph } = variantStyle[resolvedVariant];
  const displayLabel = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.1em]",
        color,
        className
      )}
      style={{ fontFamily: "var(--font-mono)" }}
      aria-label={`Status: ${displayLabel}`}
    >
      <span aria-hidden="true">{glyph}</span>
      <span>{displayLabel}</span>
    </span>
  );
}
