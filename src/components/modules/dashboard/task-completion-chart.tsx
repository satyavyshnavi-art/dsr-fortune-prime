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

interface TaskBar {
  label: string;
  count: number;
}

const mockData: TaskBar[] = [
  { label: "Pending", count: 3 },
  { label: "In Progress", count: 2 },
  { label: "Completed", count: 2 },
  { label: "Overdue", count: 2 },
  { label: "Unassigned", count: 2 },
];

interface TaskCompletionChartProps {
  data?: any;
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const t = data?.tasks;
  const chartData: TaskBar[] = t?.byStatus
    ? [
        { label: "Pending", count: t.byStatus.pending ?? t.pending ?? 0 },
        { label: "In Progress", count: t.byStatus.in_progress ?? t.inProgress ?? 0 },
        { label: "Completed", count: t.byStatus.completed ?? t.completed ?? 0 },
        { label: "Overdue", count: t.overdue ?? 0 },
        { label: "Unassigned", count: t.byStatus.unassigned ?? t.unassigned ?? 0 },
      ]
    : mockData;

  const totalTasks = chartData.reduce((sum, d) => sum + d.count, 0);

  return (
    <ChartCard
      title="Task Status Breakdown"
      subtitle={`${totalTasks} total tasks across all statuses`}
    >
      <div className="h-[190px]" role="img" aria-label="Bar chart showing task status breakdown">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
              width={30}
              allowDecimals={false}
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
              dataKey="count"
              name="Tasks"
              fill="#059669"
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
