"use client";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function ChartCard({ title, subtitle, children, actions, className }: ChartCardProps) {
  return (
    <Card
      className={cn(
        "shadow-none rounded-lg bg-[var(--vellum)] border-[var(--rule)]",
        className
      )}
      role="region"
      aria-label={title}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-2">
        <div className="min-w-0">
          <CardTitle className="text-[16px] font-semibold tracking-tight text-[var(--ink)] leading-tight">
            {title}
          </CardTitle>
          {subtitle && (
            <p className="text-[12px] text-[var(--ink-muted)] mt-1 leading-snug">
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-3">{children}</CardContent>
    </Card>
  );
}
