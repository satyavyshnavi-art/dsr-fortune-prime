"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Download, Search } from "lucide-react";
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE } from "./mock-data";
import type { AttendanceRecord } from "./mock-data";
import { exportCSV, exportPDF } from "@/lib/export";

const STATUS_CYCLE: Array<AttendanceRecord["status"]> = ["P", "A", "L", "WO", ""];
const STATUS_COLORS: Record<string, string> = {
  P: "bg-green-500 text-white",
  A: "bg-red-500 text-white",
  L: "bg-yellow-400 text-white",
  WO: "bg-slate-300 text-slate-600",
  HD: "bg-orange-400 text-white",
};

export function CalendarView() {
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [searchQuery, setSearchQuery] = useState("");
  const [includePastStaff, setIncludePastStaff] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);

  // Local overrides for attendance status (click-to-cycle)
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const days = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
    const result: string[] = [];
    const current = new Date(start);
    while (current <= end) {
      result.push(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }
    return result;
  }, [startDate, endDate]);

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      if (!searchQuery) return true;
      return (
        `${emp.firstName} ${emp.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  const attendanceLookup = useMemo(() => {
    const lookup: Record<string, Record<string, string>> = {};
    MOCK_ATTENDANCE.forEach((rec) => {
      if (!lookup[rec.employeeId]) lookup[rec.employeeId] = {};
      lookup[rec.employeeId][rec.date] = rec.status;
    });
    return lookup;
  }, []);

  const getStatus = useCallback(
    (empId: string, day: string): string => {
      const key = `${empId}::${day}`;
      if (key in overrides) return overrides[key];
      return attendanceLookup[empId]?.[day] || "";
    },
    [attendanceLookup, overrides]
  );

  const handleCellClick = useCallback((empId: string, day: string) => {
    setOverrides((prev) => {
      const key = `${empId}::${day}`;
      const current = prev[key] ?? (attendanceLookup[empId]?.[day] || "");
      const idx = STATUS_CYCLE.indexOf(current as AttendanceRecord["status"]);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      return { ...prev, [key]: next };
    });
  }, [attendanceLookup]);

  const handleDownload = useCallback((type: "pdf" | "csv") => {
    setDownloading(type);
    // Build export data
    const rows = filteredEmployees.map((emp) => {
      const row: Record<string, string | number> = {
        "Employee": `${emp.firstName} ${emp.lastName}`,
        "EMP ID": emp.empId,
        "Designation": emp.designation,
      };
      days.forEach((day) => {
        const status = getStatus(emp.id, day);
        row[day] = status || "-";
      });
      return row;
    });
    const filename = `Attendance_Calendar_${startDate}_to_${endDate}`;
    if (type === "csv") {
      exportCSV(rows, filename);
    } else {
      exportPDF(rows, filename, "Attendance Calendar Report");
    }
    setTimeout(() => setDownloading(null), 500);
  }, [filteredEmployees, days, getStatus, startDate, endDate]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search role, name, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-[12px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Include past staff</span>
          <Switch
            checked={includePastStaff}
            onCheckedChange={setIncludePastStaff}
          />
        </div>
      </div>

      {/* Date Range + Downloads */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[12px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Start:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-32 h-7 text-[11px]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">End:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-32 h-7 text-[11px]"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={downloading === "pdf"}
            onClick={() => handleDownload("pdf")}
          >
            <Download className="h-3 w-3" />
            {downloading === "pdf" ? "Downloading..." : "Download PDF"}
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-green-600 hover:bg-green-700 text-white"
            disabled={downloading === "csv"}
            onClick={() => handleDownload("csv")}
          >
            <Download className="h-3 w-3" />
            {downloading === "csv" ? "Downloading..." : "Download CSV"}
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        {[
          { status: "P", label: "Present", color: "bg-green-500" },
          { status: "A", label: "Absent", color: "bg-red-500" },
          { status: "L", label: "Leave", color: "bg-yellow-400" },
          { status: "WO", label: "Week Off", color: "bg-slate-300" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1">
            <span
              className={`w-4 h-4 rounded inline-flex items-center justify-center text-[9px] font-bold ${
                item.color
              } ${item.status === "WO" ? "text-slate-600" : "text-white"}`}
            >
              {item.status}
            </span>
            <span className="text-[10px] text-slate-400">{item.label}</span>
          </div>
        ))}
        <span className="text-[10px] text-slate-400 ml-2 italic">
          Click a cell to cycle status
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 min-w-[90px]">
                Role
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-[90px] bg-slate-50 min-w-[75px]">
                Staff
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-[165px] bg-slate-50 min-w-[65px]">
                Emp ID
              </th>
              {days.map((day) => {
                const d = new Date(day);
                const dayNum = d.getDate();
                const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
                const isSunday = d.getDay() === 0;
                return (
                  <th
                    key={day}
                    className={`px-0.5 py-1.5 text-center min-w-[28px] ${
                      isSunday ? "text-red-500" : "text-slate-500"
                    }`}
                  >
                    <div className="text-[9px] font-medium">{dayName.slice(0, 2)}</div>
                    <div className="text-[10px] font-semibold">{dayNum}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={3 + days.length}
                  className="px-4 py-6 text-center text-[12px] text-slate-400"
                >
                  No employees match your search.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50/30">
                  <td className="px-2 py-1 text-[11px] text-slate-600 sticky left-0 bg-white">
                    {emp.designation}
                  </td>
                  <td className="px-2 py-1 text-[11px] font-medium text-slate-800 sticky left-[90px] bg-white whitespace-nowrap">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="px-2 py-1 text-[10px] font-mono text-slate-400 sticky left-[165px] bg-white">
                    {emp.empId}
                  </td>
                  {days.map((day) => {
                    const status = getStatus(emp.id, day);
                    return (
                      <td key={day} className="px-0.5 py-0.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleCellClick(emp.id, day)}
                          className="cursor-pointer"
                          title={`Click to change status (${status || "none"})`}
                        >
                          {status ? (
                            <span
                              className={`inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold transition-colors ${
                                STATUS_COLORS[status] || "bg-slate-100 text-slate-400"
                              }`}
                            >
                              {status}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] text-slate-200 hover:bg-slate-100 transition-colors">
                              -
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
