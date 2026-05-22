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

/**
 * Specification Sheet chart card.
 * Italic Newsreader title + mono uppercase subtitle.
 * Sharp corners, 1px ink hairline border, vellum surface.
 */
export function ChartCard({ title, subtitle, children, actions, className }: ChartCardProps) {
  return (
    <Card
      className={cn(
        "shadow-none rounded-none bg-[var(--vellum)] border-[var(--ink)]",
        className
      )}
      role="region"
      aria-label={title}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-[var(--rule)]">
        <div className="min-w-0">
          <CardTitle
            className="text-[20px] font-semibold tracking-tight text-[var(--ink)] leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </CardTitle>
          {subtitle && (
            <p
              className="text-[11px] uppercase tracking-[0.1em] text-[var(--ink-muted)] mt-2 font-medium"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {subtitle}
            </p>
          )}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">{children}</CardContent>
    </Card>
  );
}
