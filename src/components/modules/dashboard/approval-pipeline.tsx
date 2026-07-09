"use client";

import { ChartCard } from "@/components/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ApprovalItem {
  type: string;
  pending: number;
}

const mockData: ApprovalItem[] = [
  { type: "Leave", pending: 8 },
  { type: "Purchase", pending: 5 },
  { type: "Gate Pass", pending: 3 },
  { type: "Maintenance", pending: 6 },
  { type: "Overtime", pending: 2 },
];

interface ApprovalPipelineProps {
  data?: any;
}

export function ApprovalPipeline({ data }: ApprovalPipelineProps) {
  const complaints = data?.complaints;
  const vendorTickets = data?.vendorTickets;
  const tasks = data?.tasks;

  const chartData: ApprovalItem[] =
    complaints && vendorTickets && tasks
      ? [
          { type: "Complaints", pending: complaints.open ?? 0 },
          { type: "Vendor Tickets", pending: vendorTickets.open ?? 0 },
          { type: "Tasks", pending: tasks.pending ?? 0 },
          { type: "In Progress", pending: (complaints.inProgress ?? 0) + (vendorTickets.inProgress ?? 0) + (tasks.inProgress ?? 0) },
          { type: "Overdue", pending: tasks.overdue ?? 0 },
        ]
      : mockData;

  const totalPending = chartData.reduce((sum, d) => sum + d.pending, 0);

  return (
    <ChartCard
      title="Pending Actions"
      subtitle={`${totalPending} items awaiting action`}
    >
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 0 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="type"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              width={80}
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
            <Bar
              dataKey="pending"
              name="Pending"
              fill="#34d399"
              radius={[0, 6, 6, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
