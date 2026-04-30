"use client";

import { useState } from "react";
import { ChartCard } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  kpiData,
  timelineData,
  allTimelineData,
  kpiStatusDistribution,
  keyInsights,
  type InsightItem,
} from "./mock-data";

const PIE_COLORS = ["#0d9488", "#3b82f6", "#ef4444"];

function InsightRow({ insight }: { insight: InsightItem }) {
  const dotColor =
    insight.type === "positive" || insight.type === "improving"
      ? "bg-green-500"
      : insight.type === "stable"
        ? "bg-blue-500"
        : "bg-yellow-500";

  const label =
    insight.type === "positive"
      ? "Positive Trend"
      : insight.type === "improving"
        ? "Improving"
        : insight.type === "stable"
          ? "Stable"
          : "Warning";

  const labelColor =
    insight.type === "positive" || insight.type === "improving"
      ? "text-green-600"
      : insight.type === "stable"
        ? "text-blue-600"
        : "text-yellow-600";

  return (
    <div className="flex items-start gap-2 py-1.5">
      <span className={`mt-1 inline-block h-2 w-2 rounded-full ${dotColor} shrink-0`} />
      <div className="min-w-0">
        <span className={`text-[10px] font-semibold ${labelColor}`}>{label}</span>
        <p className="text-[11px] text-slate-500 leading-snug">{insight.text}</p>
      </div>
    </div>
  );
}

export function AnalyticsTab() {
  const [selectedKpiId, setSelectedKpiId] = useState("att-1");

  const selectedKpi = kpiData.find((k) => k.id === selectedKpiId);
  const chartData = allTimelineData[selectedKpiId] || timelineData;

  // Calculate change percentage
  const firstVal = chartData[0]?.value ?? 0;
  const lastVal = chartData[chartData.length - 1]?.value ?? 0;
  const change = firstVal === 0 ? 0 : ((lastVal - firstVal) / Math.max(firstVal, 1)) * 100;
  const changeStr = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;

  const pieData = [
    { name: "Excellent", value: kpiStatusDistribution.excellent },
    { name: "Good", value: kpiStatusDistribution.good },
    { name: "Poor", value: kpiStatusDistribution.poor },
  ];

  return (
    <div className="space-y-4">
      {/* Timeline Trends */}
      <ChartCard
        title="Timeline Trends - KPI Performance Over Time"
        subtitle="Track how a selected KPI is moving across the chosen period."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400">KPI:</span>
            <select
              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 h-7"
              value={selectedKpiId}
              onChange={(e) => setSelectedKpiId(e.target.value)}
            >
              {kpiData.map((kpi) => (
                <option key={kpi.id} value={kpi.id}>
                  {kpi.name}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 font-medium">{changeStr}</span>
          </div>
        }
      >
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "11px",
                  padding: "6px 10px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={24}
                iconSize={8}
                iconType="square"
                formatter={(value: string) => (
                  <span className="text-[10px] text-slate-500">{value}</span>
                )}
              />
              <Line
                type="monotone"
                dataKey="value"
                name="Value"
                stroke="#3b82f6"
                strokeWidth={1.5}
                dot={{ fill: "#3b82f6", r: 2.5 }}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Bottom Row: Pie Chart + Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* KPI Status Distribution */}
        <Card className="shadow-none border-slate-200">
          <CardHeader className="px-4 py-2.5 pb-1">
            <CardTitle className="text-[13px] font-semibold text-slate-700">
              KPI Status Distribution
            </CardTitle>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Status distribution for the selected period.
            </p>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] text-slate-400">Category:</span>
              <select className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 h-7">
                <option>All</option>
                <option>Attendance</option>
                <option>Operations</option>
                <option>Utilities</option>
                <option>Maintenance</option>
                <option>Quality</option>
                <option>Safety</option>
              </select>
            </div>
            <div className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "6px 10px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={24}
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-[10px] text-slate-500">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-300 text-center mt-1">
              KPI status distribution (Excellent / Good / Poor)
            </p>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="shadow-none border-slate-200">
          <CardHeader className="px-4 py-2.5 pb-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[12px]">&#9889;</span>
              <CardTitle className="text-[13px] font-semibold text-slate-700">
                Key Insights from KPI Trends
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-1">
            <div className="divide-y divide-slate-50">
              {keyInsights.map((insight, idx) => (
                <InsightRow key={idx} insight={insight} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
