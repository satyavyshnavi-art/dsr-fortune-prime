"use client";

import { useState } from "react";
import { KPICard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Droplets } from "lucide-react";

type WaterSubTab = "Daily Consumption" | "STP" | "Pool" | "RO" | "WTP";

export function WaterTab() {
  const [activeSubTab, setActiveSubTab] = useState<WaterSubTab>("Daily Consumption");
  const [sourceType, setSourceType] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-03-28");
  const [dateTo, setDateTo] = useState("2026-04-27");

  const subTabs: WaterSubTab[] = ["Daily Consumption", "STP", "Pool", "RO", "WTP"];

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-0.5 border-b border-slate-200">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
              activeSubTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Records" value={0} color="red" />
        <KPICard title="Total Consumed" value="0 L" color="green" />
        <KPICard title="Avg Daily" value="0 L" color="blue" />
        <KPICard title="Active Sources" value={9} color="green" />
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-slate-600" />
            <h4 className="text-[13px] font-semibold text-slate-800">Daily Water Consumption Tracking</h4>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Source Types</option>
              <option value="tank">Tank</option>
              <option value="borewell">Borewell</option>
              <option value="cavern">Cavern</option>
              <option value="tanker">Tanker</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Sources</option>
            </select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-7 text-[12px] w-32"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-7 text-[12px] w-32"
            />
          </div>
        </div>

        <EmptyState
          icon={Droplets}
          title="No water consumption records found"
          description="Try adjusting your filters or date range"
        />
      </div>
    </div>
  );
}
