"use client";

import { ChartCard } from "@/components/shared";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";
import { useDashboard } from "@/hooks/use-dashboard";

export function AttendanceWidget() {
  const { data, loading } = useDashboard();

  const total = data?.employees?.total ?? 0;
  const present = data?.employees?.present ?? 0;
  const absent = data?.employees?.absent ?? 0;
  const late = data?.employees?.late ?? 0;
  const rate = data?.attendance?.rate ?? 0;

  // Build attendance categories from byStatus
  const byStatus = data?.attendance?.byStatus ?? {};
  const categories = Object.entries(byStatus).map(([status, count]) => ({
    label: status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    attendance: String(count),
    absent: "0",
  }));

  // Fallback categories if no data
  const displayCategories =
    categories.length > 0
      ? categories
      : [{ label: "No records", attendance: "0", absent: "0" }];

  return (
    <ChartCard title="Attendance Management">
      <div className="space-y-2.5">
        {/* Overall Score */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Overall Score</span>
          <span
            className={`text-[15px] font-bold ${
              rate >= 80
                ? "text-green-600"
                : rate >= 50
                ? "text-yellow-600"
                : "text-red-500"
            }`}
          >
            {rate}%
          </span>
        </div>

        {/* Table */}
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">
                  Status
                </th>
                <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">
                  Count
                </th>
              </tr>
            </thead>
            <tbody>
              {displayCategories.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="py-1.5 px-2.5 text-[11px] text-slate-600">
                    {row.label}
                  </td>
                  <td className="py-1.5 px-2.5 text-center text-[12px] font-medium text-slate-800">
                    {row.attendance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-4 gap-2 pt-1.5">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-blue-600">
              <Users className="h-3 w-3" />
              <span className="text-[13px] font-bold">{total}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Total</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-green-600">
              <UserCheck className="h-3 w-3" />
              <span className="text-[13px] font-bold">{present}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Present</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-red-500">
              <UserX className="h-3 w-3" />
              <span className="text-[13px] font-bold">{absent}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Absent</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-yellow-500">
              <Clock className="h-3 w-3" />
              <span className="text-[13px] font-bold">{late}</span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Late</span>
          </div>
        </div>

        {/* Percentage bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${rate}%` }}
            />
          </div>
          <div className="flex items-center gap-0.5 text-green-600">
            <TrendingUp className="h-2.5 w-2.5" />
            <span className="text-[11px] font-semibold">{rate}%</span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
