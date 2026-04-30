"use client";

import { ChartCard } from "@/components/shared";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useDashboard } from "@/hooks/use-dashboard";

const COLORS = ["#a855f7", "#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];

const tabs = ["EB Power", "DG Power", "Solar"];

export function PowerWidget() {
  const { data } = useDashboard();

  const totalKwh = data?.powerReadings?.totalKwh ?? 0;
  const activeMeters = data?.powerReadings?.activeMeters ?? 0;
  const byType = data?.powerReadings?.byType ?? {};
  const recentReadings = data?.powerReadings?.recentReadings ?? [];

  // Build distribution from recent readings by location
  const locationMap = new Map<string, number>();
  for (const r of recentReadings) {
    const loc = r.location ?? r.meterId;
    const units = parseFloat(r.unitsConsumed ?? "0");
    locationMap.set(loc, (locationMap.get(loc) ?? 0) + units);
  }
  const powerDistribution = Array.from(locationMap.entries())
    .slice(0, 5)
    .map(([name, value], idx) => ({
      name,
      value: Math.round(value * 100) / 100,
      color: COLORS[idx % COLORS.length],
    }));

  const chartData =
    powerDistribution.length > 0
      ? powerDistribution
      : [{ name: "No data", value: 1, color: "#e2e8f0" }];

  const ebData = byType["eb"];
  const dgData = byType["dg"];

  return (
    <ChartCard
      title="Power Management"
      actions={
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          {totalKwh.toFixed(1)} kWh
        </span>
      }
    >
      <div className="space-y-2">
        {/* Tabs */}
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`text-[10px] px-2 py-0.5 rounded transition-colors ${
                i === 0
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Meter vs Units */}
          <div>
            <p className="text-[10px] text-slate-400 mb-1.5">Meter vs Units</p>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Meters</span>
                <span className="font-medium text-slate-700">
                  {activeMeters}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Units</span>
                <span className="font-medium text-slate-700">
                  {totalKwh.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Power Distribution Donut */}
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5">
              Power Distribution
            </p>
            <div className="h-[75px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={32}
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: "10px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                      padding: "4px 8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {powerDistribution.length > 0
            ? powerDistribution.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-1 text-[9px] text-slate-500"
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </div>
              ))
            : (
                <div className="text-[9px] text-slate-400">
                  No power readings yet
                </div>
              )}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100">
          <div className="text-center">
            <p className="text-[12px] font-bold text-slate-800">
              {ebData ? `${ebData.totalUnits.toFixed(0)} kWh` : "0 kWh"}
            </p>
            <p className="text-[9px] text-slate-400">EB Power</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-slate-800">
              {dgData ? `${dgData.totalUnits.toFixed(0)} kWh` : "0 kWh"}
            </p>
            <p className="text-[9px] text-slate-400">DG Power</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-slate-800">
              {activeMeters}
            </p>
            <p className="text-[9px] text-slate-400">Active Meters</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
