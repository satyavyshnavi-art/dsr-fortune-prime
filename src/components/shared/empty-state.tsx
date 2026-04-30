"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon, Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-10 text-center", className)}>
      <div className="rounded-full bg-slate-100 p-3 mb-3">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="text-[13px] font-semibold text-slate-700">{title}</h3>
      {description && (
        <p className="text-[11px] text-slate-400 mt-0.5 max-w-[280px]">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
