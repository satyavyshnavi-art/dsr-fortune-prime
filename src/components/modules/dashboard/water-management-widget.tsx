"use client";

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

const waterData = [
  { month: "Sep", level: 60, consumption: 45 },
  { month: "Oct", level: 55, consumption: 40 },
  { month: "Nov", level: 70, consumption: 50 },
  { month: "Dec", level: 65, consumption: 48 },
  { month: "Jan", level: 58, consumption: 42 },
  { month: "Feb", level: 62, consumption: 44 },
  { month: "Mar", level: 68, consumption: 52 },
  { month: "Apr", level: 50, consumption: 38 },
];

const tabs = ["Water Level", "Water Consumption"];

export function WaterManagementWidget() {
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

        <p className="text-[10px] text-slate-400">Tank-wise (Percentage)</p>

        {/* Bar Chart */}
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={waterData}
              barCategoryGap="20%"
              barGap={2}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
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
                domain={[0, 100]}
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
                name="Water Level"
                fill="#f97316"
                radius={[2, 2, 0, 0]}
                barSize={10}
              />
              <Bar
                dataKey="consumption"
                name="Consumption"
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
