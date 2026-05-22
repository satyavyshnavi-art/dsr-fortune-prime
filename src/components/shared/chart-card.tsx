"use client";

import { cn } from "@/lib/utils";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, actions, className }: ChartCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-slate-100 p-5",
        className
      )}
      role="region"
      aria-label={title}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-slate-800 leading-tight">
            {title}
          </h3>
          {subtitle && (
            <p className="text-[11.5px] text-slate-400 mt-0.5 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}
