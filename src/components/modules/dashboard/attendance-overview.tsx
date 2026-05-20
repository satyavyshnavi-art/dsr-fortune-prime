"use client";

import { ChartCard } from "@/components/shared";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const PIE_COLORS = ["#10b981", "#ef4444", "#3b82f6", "#f59e0b"];

interface AttendanceSlice {
  name: string;
  value: number;
}

const mockData: AttendanceSlice[] = [
  { name: "Present", value: 142 },
  { name: "Absent", value: 18 },
  { name: "On Leave", value: 12 },
  { name: "Week Off", value: 28 },
];

interface AttendanceOverviewProps {
  data?: any;
}

export function AttendanceOverview({ data }: AttendanceOverviewProps) {
  const employees = data?.employees;
  const attendance = data?.attendance;

  const chartData: AttendanceSlice[] =
    employees && attendance
      ? [
          { name: "Present", value: employees.present ?? 0 },
          { name: "Absent", value: employees.absent ?? 0 },
          { name: "On Leave", value: attendance.byStatus?.on_leave ?? attendance.byStatus?.leave ?? 0 },
          { name: "Week Off", value: attendance.byStatus?.week_off ?? attendance.byStatus?.weekoff ?? 0 },
        ]
      : mockData;

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard
      title="Attendance Overview"
      subtitle="Today's attendance distribution"
    >
      <div className="h-[200px]" role="img" aria-label="Pie chart showing today's attendance distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, index) => (
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
              formatter={(value, name) => [
                `${value} (${total > 0 ? Math.round((Number(value) / total) * 100) : 0}%)`,
                String(name),
              ]}
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
        Total workforce: {total}
      </p>
    </ChartCard>
  );
}
