import {
  KpiSkeleton,
  ChartSkeleton,
} from "@/components/shared/loading-skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-200 bg-white">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
        <div className="h-7 w-32 animate-pulse rounded bg-slate-200" />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-3">
          {/* KPI row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>

          {/* Chart rows */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <ChartSkeleton />
            <ChartSkeleton />
            <ChartSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
