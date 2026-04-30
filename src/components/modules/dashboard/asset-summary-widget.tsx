"use client";

import { ChartCard, StatusBadge } from "@/components/shared";

const assetBreakdown = [
  { name: "Active", color: "#22c55e" },
  { name: "Maintenance", color: "#f59e0b" },
  { name: "Inactive", color: "#ef4444" },
];

const otherStatus = [
  { label: "Completed", count: 0, variant: "success" as const },
  { label: "In Progress", count: 0, variant: "info" as const },
  { label: "Scheduled", count: 0, variant: "neutral" as const },
  { label: "Overdue", count: 0, variant: "danger" as const },
];

export function AssetSummaryWidget() {
  return (
    <ChartCard title="Asset Management Summary">
      <div className="space-y-3">
        {/* Total and Gate Pass */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">241</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              241 Active / 1 Inactive
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">0</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              0 In / 0 Overdue
            </p>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium text-slate-500">
              Asset Breakdown
            </p>
            <StatusBadge status="Good" variant="success" />
          </div>

          {/* Stacked bar */}
          <div className="h-2 rounded-full overflow-hidden flex bg-slate-100">
            <div className="bg-green-500" style={{ width: "97.5%" }} />
            <div className="bg-yellow-500" style={{ width: "1.7%" }} />
            <div className="bg-red-500" style={{ width: "0.8%" }} />
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            {assetBreakdown.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1 text-[9px] text-slate-500"
              >
                <div
                  className="h-2 w-2 rounded-sm"
                  style={{ backgroundColor: item.color }}
                />
                {item.name}
              </div>
            ))}
          </div>
        </div>

        {/* Other Status */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium text-slate-500">Other Status</p>
            <StatusBadge status="0/0 Tasks" variant="info" />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {otherStatus.map((item) => (
              <div
                key={item.label}
                className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1 text-center"
              >
                <p className="text-[12px] font-bold text-slate-700">{item.count}</p>
                <p className="text-[9px] text-slate-400 leading-tight">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
