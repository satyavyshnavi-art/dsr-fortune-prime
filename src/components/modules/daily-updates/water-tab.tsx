"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { KPICard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Droplets, Loader2 } from "lucide-react";

type WaterSubTab = "Daily Consumption" | "STP" | "Pool" | "RO" | "WTP";

type WaterRecord = {
  id: string;
  sourceName: string;
  sourceType: string;
  previousLiters: string;
  currentLiters: string;
  consumed: string;
  levelPercent: string | null;
  date: string;
  createdAt: string;
};

export function WaterTab() {
  const [activeSubTab, setActiveSubTab] = useState<WaterSubTab>("Daily Consumption");
  const [sourceType, setSourceType] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-03-28");
  const [dateTo, setDateTo] = useState("2026-04-27");
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const subTabs: WaterSubTab[] = ["Daily Consumption", "STP", "Pool", "RO", "WTP"];

  // Fetch water readings from API
  const fetchWaterReadings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/water-readings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecords(data as WaterRecord[]);
      }
    } catch {
      // Keep empty on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaterReadings();
  }, [fetchWaterReadings]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (sourceType !== "all" && !r.sourceType.toLowerCase().includes(sourceType)) return false;
      if (sourceFilter !== "all" && r.sourceName !== sourceFilter) return false;
      return true;
    });
  }, [records, sourceType, sourceFilter]);

  // KPI computations
  const totalConsumed = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (parseFloat(r.consumed) || 0), 0);
  }, [filteredRecords]);

  // Unique sources for filter
  const uniqueSources = useMemo(() => {
    return [...new Set(records.map((r) => r.sourceName))];
  }, [records]);

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
        <KPICard title="Total Records" value={filteredRecords.length} color="red" />
        <KPICard title="Total Consumed" value={`${totalConsumed.toFixed(0)} L`} color="green" />
        <KPICard title="Avg Daily" value={`${filteredRecords.length > 0 ? (totalConsumed / filteredRecords.length).toFixed(0) : "0"} L`} color="blue" />
        <KPICard title="Active Sources" value={uniqueSources.length || 9} color="green" />
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
              <option value="cauvery">Cauvery</option>
              <option value="tanker">Tanker</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-[13px] text-slate-500">Loading water readings...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={Droplets}
            title="No water consumption records found"
            description="Try adjusting your filters or date range"
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Source</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Type</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Previous (L)</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Current (L)</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Consumed (L)</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Level %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map((r) => {
                  const consumed = parseFloat(r.consumed) || 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/40">
                      <td className="py-3.5 px-3 text-[13px] text-slate-800">
                        {r.date ? new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : ""}
                      </td>
                      <td className="py-3.5 px-3 text-[13px] text-slate-800 font-medium truncate">{r.sourceName}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded bg-blue-50 text-blue-500 text-[11px] font-medium px-2 py-0.5">
                          {r.sourceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">
                        {parseFloat(r.previousLiters || "0").toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">
                        {parseFloat(r.currentLiters || "0").toLocaleString()}
                      </td>
                      <td className={`py-3.5 px-3 text-right text-[13px] font-medium ${consumed < 0 ? "text-red-500" : "text-green-600"}`}>
                        {consumed.toLocaleString()} L
                      </td>
                      <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">
                        {r.levelPercent ? `${parseFloat(r.levelPercent).toFixed(1)}%` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
