"use client";

import { ChartCard } from "@/components/shared";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const powerDistribution = [
  { name: "DG Routine", value: 17, color: "#a855f7" },
  { name: "Block B", value: 17, color: "#3b82f6" },
  { name: "Rest Rooms", value: 17, color: "#22c55e" },
];

const tabs = ["EB Power", "DG Power", "Solar"];

const powerStats = {
  meterVsUnits: {
    meters: 0.5,
    units: 0.5,
  },
  summary: {
    dgRuntime: "0 hrs",
    dgFuel: "0 L",
    solarGen: "0",
  },
};

export function PowerWidget() {
  return (
    <ChartCard
      title="Power Management"
      actions={
        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
          0.5 kW
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
                <span className="font-medium text-slate-700">{powerStats.meterVsUnits.meters}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">Units</span>
                <span className="font-medium text-slate-700">{powerStats.meterVsUnits.units}</span>
              </div>
            </div>
          </div>

          {/* Power Distribution Donut */}
          <div>
            <p className="text-[10px] text-slate-400 mb-0.5">Power Distribution</p>
            <div className="h-[75px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={powerDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={32}
                    dataKey="value"
                    strokeWidth={2}
                  >
                    {powerDistribution.map((entry, idx) => (
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
          {powerDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-1 text-[9px] text-slate-500">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100">
          <div className="text-center">
            <p className="text-[12px] font-bold text-slate-800">
              {powerStats.summary.dgRuntime}
            </p>
            <p className="text-[9px] text-slate-400">DG Runtime</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-slate-800">
              {powerStats.summary.dgFuel}
            </p>
            <p className="text-[9px] text-slate-400">Avg Diesel</p>
          </div>
          <div className="text-center">
            <p className="text-[12px] font-bold text-slate-800">
              {powerStats.summary.solarGen}
            </p>
            <p className="text-[9px] text-slate-400">Solar Gen</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
