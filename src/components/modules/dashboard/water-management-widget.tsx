"use client";

import { useState, useEffect } from "react";
import { ChartCard } from "@/components/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const tabs = ["Water Level", "Water Consumption"];

export function WaterManagementWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {});
  }, []);

  const recentReadings = data?.waterReadings?.recentReadings ?? [];

  // Build chart data from recent readings, grouped by date
  const dateMap = new Map<string, { level: number; consumption: number }>();
  for (const r of recentReadings) {
    const dateLabel = r.date;
    const existing = dateMap.get(dateLabel) ?? { level: 0, consumption: 0 };
    existing.level = Math.max(existing.level, parseFloat(r.levelPercent ?? "0"));
    existing.consumption += parseFloat(r.consumed ?? "0");
    dateMap.set(dateLabel, existing);
  }

  const chartData = Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => {
      const d = new Date(date + "T00:00:00");
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return {
        month: `${d.getDate()} ${months[d.getMonth()]}`,
        level: Math.round(vals.level * 10) / 10,
        consumption: Math.round(vals.consumption * 10) / 10,
      };
    });

  // Fallback mock data if no real readings
  const displayData =
    chartData.length > 0
      ? chartData
      : [
          { month: "No data", level: 0, consumption: 0 },
        ];

  return (
    <ChartCard title="Water Management">
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

        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400">Tank-wise (Percentage)</p>
          <p className="text-[10px] text-slate-500 font-medium">
            {data?.waterReadings?.activeSources ?? 0} sources |{" "}
            {Math.round((data?.waterReadings?.totalLiters ?? 0) / 1000)} KL total
          </p>
        </div>

        {/* Bar Chart */}
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData} barCategoryGap="20%" barGap={2}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  fontSize: "10px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  padding: "4px 8px",
                }}
              />
              <Bar
                dataKey="level"
                name="Water Level %"
                fill="#f97316"
                radius={[2, 2, 0, 0]}
                barSize={10}
              />
              <Bar
                dataKey="consumption"
                name="Consumption (L)"
                fill="#22d3ee"
                radius={[2, 2, 0, 0]}
                barSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[9px] text-slate-500">
            <div className="h-2 w-2 rounded-sm bg-orange-500" />
            Water Level
          </div>
          <div className="flex items-center gap-1 text-[9px] text-slate-500">
            <div className="h-2 w-2 rounded-sm bg-cyan-400" />
            Consumption
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
