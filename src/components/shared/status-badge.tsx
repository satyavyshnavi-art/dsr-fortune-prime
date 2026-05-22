"use client";

import { cn } from "@/lib/utils";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

// Soft pill — bg-50 with bg-700 text. No border, no special font.
const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  info: "bg-sky-100 text-sky-700",
  neutral: "bg-slate-100 text-slate-600",
  purple: "bg-violet-100 text-violet-700",
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
  const displayLabel = status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <span
      className={cn(
        "inline-flex items-center text-[11.5px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
        variantStyles[resolvedVariant],
        className
      )}
      aria-label={`Status: ${displayLabel}`}
    >
      {displayLabel}
    </span>
  );
}
