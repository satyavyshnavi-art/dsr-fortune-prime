"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "purple";

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-700 border-green-200",
  warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
  danger: "bg-red-100 text-red-700 border-red-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  neutral: "bg-slate-100 text-slate-600 border-slate-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
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
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] font-medium px-1.5 py-0 h-[18px] leading-[18px] rounded",
        variantStyles[resolvedVariant],
        className
      )}
    >
      {displayLabel}
    </Badge>
  );
}
