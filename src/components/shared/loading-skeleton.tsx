"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200", className)} style={style} />;
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" role="status" aria-label="Loading table data">
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        {/* Header */}
        <div className="flex gap-4 bg-slate-50/80 px-3 py-2">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-3 flex-1" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 px-3 py-2.5 border-t border-slate-100">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-3 flex-1" />
            ))}
          </div>
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg border border-slate-200 bg-white p-4 space-y-3", className)}
      role="status"
      aria-label="Loading card"
    >
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-2.5 w-2/3" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg border border-slate-200 bg-white p-4 space-y-3", className)}
      role="status"
      aria-label="Loading chart"
    >
      <Skeleton className="h-3 w-1/4" />
      <Skeleton className="h-2 w-1/3" />
      <div className="flex items-end gap-2 h-[160px] pt-4">
        {[40, 65, 50, 80, 55, 70].map((h, i) => (
          <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
        ))}
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5" role="status" aria-label="Loading metric">
      <Skeleton className="h-2 w-2/3 mb-2" />
      <Skeleton className="h-5 w-1/2 mb-1.5" />
      <Skeleton className="h-2 w-1/2" />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
