"use client";

import { useState, useEffect } from "react";
import { ChartCard, StatusBadge } from "@/components/shared";

const assetBreakdown = [
  { name: "Active", color: "#22c55e" },
  { name: "Maintenance", color: "#f59e0b" },
  { name: "Inactive", color: "#ef4444" },
];

export function AssetSummaryWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {});
  }, []);

  const total = data?.assets?.total ?? 0;
  const active = data?.assets?.active ?? 0;
  const maintenance = data?.assets?.maintenance ?? 0;
  const inactive = data?.assets?.inactive ?? 0;
  const gatePassOut = data?.assets?.gatePasses?.out ?? 0;
  const gatePassPending = data?.assets?.gatePasses?.pending ?? 0;

  const activePercent = total > 0 ? (active / total) * 100 : 0;
  const maintenancePercent = total > 0 ? (maintenance / total) * 100 : 0;
  const inactivePercent = total > 0 ? (inactive / total) * 100 : 0;

  const overallStatus =
    total === 0
      ? "No data"
      : activePercent >= 90
      ? "Good"
      : activePercent >= 70
      ? "Fair"
      : "Needs Attention";

  const statusVariant =
    overallStatus === "Good"
      ? "success"
      : overallStatus === "Fair"
      ? "warning"
      : overallStatus === "No data"
      ? "neutral"
      : ("danger" as const);

  return (
    <ChartCard title="Asset Management Summary">
      <div className="space-y-3">
        {/* Total and Gate Pass */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {total}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {active} Active / {inactive} Inactive
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-tight">
              {gatePassOut + gatePassPending}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {gatePassOut} Out / {gatePassPending} Pending
            </p>
          </div>
        </div>

        {/* Asset Breakdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium text-slate-500">
              Asset Breakdown
            </p>
            <StatusBadge
              status={overallStatus}
              variant={statusVariant as any}
            />
          </div>

          {/* Stacked bar */}
          <div className="h-2 rounded-full overflow-hidden flex bg-slate-100">
            {total > 0 ? (
              <>
                <div
                  className="bg-green-500"
                  style={{ width: `${activePercent}%` }}
                />
                <div
                  className="bg-yellow-500"
                  style={{ width: `${maintenancePercent}%` }}
                />
                <div
                  className="bg-red-500"
                  style={{ width: `${inactivePercent}%` }}
                />
              </>
            ) : (
              <div className="bg-slate-200 w-full" />
            )}
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
                {item.name}{" "}
                <span className="font-medium">
                  (
                  {item.name === "Active"
                    ? active
                    : item.name === "Maintenance"
                    ? maintenance
                    : inactive}
                  )
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category breakdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium text-slate-500">
              By Category
            </p>
            <StatusBadge
              status={`${data?.assets?.byCategory?.length ?? 0} categories`}
              variant="info"
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(data?.assets?.byCategory ?? []).slice(0, 4).map((cat: any) => (
              <div
                key={cat.categoryName}
                className="rounded-md bg-slate-50 border border-slate-100 px-1.5 py-1 text-center"
              >
                <p className="text-[12px] font-bold text-slate-700">
                  {cat.count}
                </p>
                <p className="text-[9px] text-slate-400 leading-tight truncate">
                  {cat.categoryName}
                </p>
              </div>
            ))}
            {(!data?.assets?.byCategory ||
              data.assets.byCategory.length === 0) && (
              <div className="col-span-4 text-center text-[10px] text-slate-400 py-2">
                No categories configured
              </div>
            )}
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
