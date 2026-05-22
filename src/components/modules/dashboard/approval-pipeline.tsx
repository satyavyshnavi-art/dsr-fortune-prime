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
  const chartData: ApprovalItem[] = data?.approvals?.byType ?? mockData;

  const totalPending = chartData.reduce((sum, d) => sum + d.pending, 0);

  return (
    <ChartCard
      title="Pending Approvals"
      subtitle={`${totalPending} approvals awaiting action`}
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
              fill="#a78bfa"
              radius={[0, 6, 6, 0]}
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
