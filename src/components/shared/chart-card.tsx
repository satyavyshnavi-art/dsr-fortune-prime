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
    <Card className={cn("shadow-none border-slate-200", className)}>
      <CardHeader className="flex flex-row items-center justify-between px-4 py-2.5 pb-1">
        <div>
          <CardTitle className="text-[13px] font-semibold text-slate-700">{title}</CardTitle>
          {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions}
      </CardHeader>
      <CardContent className="px-4 pb-3 pt-1">{children}</CardContent>
    </Card>
  );
}
