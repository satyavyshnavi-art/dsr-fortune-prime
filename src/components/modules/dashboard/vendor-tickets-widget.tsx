"use client";

import { ChartCard } from "@/components/shared";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Ticket, CheckCircle2, TrendingUp } from "lucide-react";

const vendorData = [
  { name: "Pending", value: 8, color: "#f59e0b" },
  { name: "In Progress", value: 4, color: "#3b82f6" },
  { name: "Resolved", value: 3, color: "#22c55e" },
];

export function VendorTicketsWidget() {
  return (
    <ChartCard
      title="Vendor Tickets"
      actions={
        <span className="text-[10px] text-slate-400">Avg: 0 Days</span>
      }
    >
      <div className="space-y-2.5">
        {/* Donut Chart */}
        <div className="h-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={vendorData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {vendorData.map((entry, idx) => (
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
          {vendorData.map((item) => (
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
              <span className="text-[13px] font-bold">15</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Total Tickets</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600">
              <CheckCircle2 className="h-3 w-3" />
              <span className="text-[13px] font-bold">13%</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Resolution Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600">
              <TrendingUp className="h-3 w-3" />
              <span className="text-[13px] font-bold">0</span>
            </div>
            <p className="text-[9px] text-slate-400 mt-0.5">Avg Resolution</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
