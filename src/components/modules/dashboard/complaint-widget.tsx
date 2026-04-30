"use client";

import { useState, useEffect } from "react";
import { ChartCard } from "@/components/shared";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { MessageSquare, Clock, CheckCircle } from "lucide-react";

export function ComplaintWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {});
  }, []);

  const open = data?.complaints?.open ?? 0;
  const inProgress = data?.complaints?.inProgress ?? 0;
  const resolved = data?.complaints?.resolved ?? 0;
  const closed = data?.complaints?.closed ?? 0;
  const total = data?.complaints?.total ?? 0;
  const avgDays = data?.complaints?.avgResolutionDays ?? 0;

  const resolutionRate =
    total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

  const complaintData = [
    { name: "Open", value: open, color: "#ef4444" },
    { name: "In Progress", value: inProgress, color: "#f59e0b" },
    { name: "Resolved", value: resolved + closed, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  // If no data, show a placeholder slice
  const chartData =
    complaintData.length > 0
      ? complaintData
      : [{ name: "No data", value: 1, color: "#e2e8f0" }];

  return (
    <ChartCard title="Complaint Management">
      <div className="space-y-2.5">
        {/* Donut Chart */}
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
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

        {/* Legend */}
        <div className="flex justify-center gap-3">
          {[
            { name: "Open", color: "#ef4444" },
            { name: "In Progress", color: "#f59e0b" },
            { name: "Resolved", color: "#22c55e" },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-1 text-[10px] text-slate-500"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              {item.name}
            </div>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-slate-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600">
              <MessageSquare className="h-3 w-3" />
              <span className="text-[13px] font-bold">{total}</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">
              Total Complaints
            </p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span className="text-[13px] font-bold">{resolutionRate}%</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Resolution Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-500">
              <Clock className="h-3 w-3" />
              <span className="text-[13px] font-bold">
                {avgDays} {avgDays === 1 ? "day" : "days"}
              </span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Avg Resolution</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
