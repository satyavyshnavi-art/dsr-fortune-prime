"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Editorial status tag: a single colored dot + uppercase Manrope label.
 * No pill bg, no border — the dot carries the meaning, the label reads as type.
 *
 * Reads like a legend entry in a blueprint or an inspection log:
 *   ●  IN PROGRESS
 *   ●  COMPLETED
 *   ●  OVERDUE
 */
const variantDot: Record<BadgeVariant, string> = {
  success: "bg-[var(--seal)]",
  warning: "bg-[var(--sodium)]",
  danger: "bg-[var(--redline)]",
  info: "bg-[var(--mark)]",
  neutral: "bg-[var(--ink-faint)]",
  purple: "bg-[#6b4f8c]", // editorial plum — used sparingly
};

const variantText: Record<BadgeVariant, string> = {
  success: "text-[var(--seal)]",
  warning: "text-[var(--sodium)]",
  danger: "text-[var(--redline)]",
  info: "text-[var(--mark)]",
  neutral: "text-[var(--ink-muted)]",
  purple: "text-[#6b4f8c]",
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
  const displayLabel = status.replace(/_/g, " ");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap",
        className
      )}
      aria-label={`Status: ${displayLabel}`}
    >
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full shrink-0", variantDot[resolvedVariant])}
        aria-hidden="true"
      />
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.08em]",
          variantText[resolvedVariant]
        )}
      >
        {displayLabel}
      </span>
    </span>
  );
}
