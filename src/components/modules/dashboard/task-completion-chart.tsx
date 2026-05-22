"use client";

import { ChartCard } from "@/components/shared";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ClusterTask {
  cluster: string;
  completed: number;
  total: number;
}

const mockData: ClusterTask[] = [
  { cluster: "Block A", completed: 18, total: 24 },
  { cluster: "Block B", completed: 12, total: 20 },
  { cluster: "Block C", completed: 22, total: 25 },
  { cluster: "Block D", completed: 8, total: 15 },
  { cluster: "Block E", completed: 14, total: 18 },
];

interface TaskCompletionChartProps {
  data?: any;
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  const chartData: ClusterTask[] = data?.tasksByCluster ?? mockData;

  return (
    <ChartCard
      title="Task Completion by Cluster"
      subtitle="Completed vs total tasks across clusters"
    >
      <div className="h-[190px]" role="img" aria-label="Bar chart showing task completion by cluster">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis
              dataKey="cluster"
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              axisLine={{ stroke: "#e2e8f0" }}
              tickLine={false}
            />
            <YAxis
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
            <Bar
              dataKey="total"
              name="Total"
              fill="#e2e8f0"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#14b8a6"
              radius={[4, 4, 0, 0]}
              barSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
