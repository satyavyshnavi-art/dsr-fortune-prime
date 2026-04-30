"use client";

import { ChartCard } from "@/components/shared";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";

const attendanceData = {
  overallScore: 100,
  categories: [
    { label: "Service", attendance: "11", absent: "0" },
    { label: "Soft Services", attendance: "1", absent: "0" },
  ],
  summary: {
    total: 1,
    present: 1,
    absent: 0,
    late: 0,
    percentage: 100,
  },
};

export function AttendanceWidget() {
  return (
    <ChartCard title="Attendance Management">
      <div className="space-y-2.5">
        {/* Overall Score */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Overall Score</span>
          <span className="text-[15px] font-bold text-green-600">
            {attendanceData.overallScore}%
          </span>
        </div>

        {/* Table */}
        <div className="rounded-md border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">Service</th>
                <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">Attendance</th>
                <th className="text-center text-[10px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2.5">Absent</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.categories.map((row) => (
                <tr key={row.label} className="border-t border-slate-100">
                  <td className="py-1.5 px-2.5 text-[11px] text-slate-600">{row.label}</td>
                  <td className="py-1.5 px-2.5 text-center text-[12px] font-medium text-slate-800">
                    {row.attendance}
                  </td>
                  <td className="py-1.5 px-2.5 text-center text-[12px] text-slate-400">
                    {row.absent}
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
              <span className="text-[13px] font-bold">
                {attendanceData.summary.total}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Total</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-green-600">
              <UserCheck className="h-3 w-3" />
              <span className="text-[13px] font-bold">
                {attendanceData.summary.present}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Present</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-red-500">
              <UserX className="h-3 w-3" />
              <span className="text-[13px] font-bold">
                {attendanceData.summary.absent}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Absent</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-yellow-500">
              <Clock className="h-3 w-3" />
              <span className="text-[13px] font-bold">
                {attendanceData.summary.late}
              </span>
            </div>
            <span className="text-[9px] text-slate-400 mt-0.5">Late</span>
          </div>
        </div>

        {/* Percentage bar */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{ width: `${attendanceData.summary.percentage}%` }}
            />
          </div>
          <div className="flex items-center gap-0.5 text-green-600">
            <TrendingUp className="h-2.5 w-2.5" />
            <span className="text-[11px] font-semibold">
              {attendanceData.summary.percentage}%
            </span>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
