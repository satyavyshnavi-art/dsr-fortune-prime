"use client";

import {} from "react";
import { ChartCard } from "@/components/shared";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Ticket, CheckCircle2, TrendingUp } from "lucide-react";

export function VendorTicketsWidget({ data }: { data?: any }) {

  const total = data?.vendorTickets?.total ?? 0;
  const open = data?.vendorTickets?.open ?? 0;
  const inProgress = data?.vendorTickets?.inProgress ?? 0;
  const resolved = data?.vendorTickets?.resolved ?? 0;
  const closed = data?.vendorTickets?.closed ?? 0;
  const avgDays = data?.vendorTickets?.avgResolutionDays ?? 0;

  const resolutionRate =
    total > 0 ? Math.round(((resolved + closed) / total) * 100) : 0;

  const vendorData = [
    { name: "Open", value: open + (data ? 0 : 0), color: "#f59e0b" },
    { name: "In Progress", value: inProgress, color: "#3b82f6" },
    { name: "Resolved", value: resolved + closed, color: "#22c55e" },
  ].filter((d) => d.value > 0);

  const chartData =
    vendorData.length > 0
      ? vendorData
      : [{ name: "No data", value: 1, color: "#e2e8f0" }];

  return (
    <ChartCard
      title="Vendor Tickets"
      actions={
        <span className="text-[10px] text-slate-400">
          Avg: {avgDays} {avgDays === 1 ? "Day" : "Days"}
        </span>
      }
    >
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
            { name: "Open", color: "#f59e0b" },
            { name: "In Progress", color: "#3b82f6" },
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
              <Ticket className="h-3 w-3" />
              <span className="text-[13px] font-bold">{total}</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Total Tickets</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[13px] font-bold">{resolutionRate}%</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Resolution Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[13px] font-bold">{avgDays}</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Avg Resolution</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
