"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Download, Search } from "lucide-react";
import { toast } from "sonner";
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE } from "./mock-data";
import { exportCSV, exportPDF, exportExcel } from "@/lib/export";

// Inline editable cell for hours
function HourCell({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 24) {
      onChange(parsed);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min="0"
        max="24"
        step="0.5"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        className="w-10 h-6 text-center text-[11px] rounded border border-blue-400 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300"
      />
    );
  }

  const colorClass =
    value >= 8
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : value >= 4
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : value > 0
          ? "bg-red-100 text-red-600 border-red-200"
          : "bg-slate-50 text-slate-300 border-slate-100 hover:bg-slate-100 hover:text-slate-400";

  return (
    <button
      type="button"
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className={`w-7 h-6 rounded border text-[10px] font-medium transition-colors cursor-pointer ${colorClass}`}
      title={`${value}h — click to edit`}
    >
      {value > 0 ? value : "—"}
    </button>
  );
}

export function TimesheetView() {
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastStaff, setShowPastStaff] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);

  // Local hour overrides for editable cells
  const [hourOverrides, setHourOverrides] = useState<Record<string, number>>({});

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

  const hoursLookup = useMemo(() => {
    const lookup: Record<string, Record<string, number>> = {};
    MOCK_ATTENDANCE.forEach((rec) => {
      if (!lookup[rec.employeeId]) lookup[rec.employeeId] = {};
      lookup[rec.employeeId][rec.date] = rec.hours || 0;
    });
    return lookup;
  }, []);

  const getHours = useCallback(
    (empId: string, day: string): number => {
      const key = `${empId}::${day}`;
      if (key in hourOverrides) return hourOverrides[key];
      return hoursLookup[empId]?.[day] || 0;
    },
    [hoursLookup, hourOverrides]
  );

  const handleCellChange = useCallback(
    (empId: string, day: string, value: number) => {
      const key = `${empId}::${day}`;
      setHourOverrides((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const getTotalHours = useCallback(
    (empId: string): number => {
      return days.reduce((sum, day) => sum + getHours(empId, day), 0);
    },
    [days, getHours]
  );

  const buildExportData = useCallback(() => {
    return filteredEmployees.map((emp) => {
      const row: Record<string, string | number> = {
        "Employee": `${emp.firstName} ${emp.lastName}`,
        "EMP ID": emp.empId,
        "Designation": emp.designation,
      };
      days.forEach((day) => {
        row[day] = getHours(emp.id, day);
      });
      row["Total Hours"] = getTotalHours(emp.id);
      return row;
    });
  }, [filteredEmployees, days, getHours, getTotalHours]);

  const handleDownload = useCallback((type: "pdf" | "csv") => {
    setDownloading(type);
    const rows = buildExportData();
    const filename = `Timesheet_${startDate}_to_${endDate}`;
    if (type === "csv") {
      exportCSV(rows, filename);
      toast.success("CSV downloaded");
    } else {
      exportPDF(rows, filename, "Timesheet Report");
      toast.success("PDF downloaded");
    }
    setTimeout(() => setDownloading(null), 500);
  }, [buildExportData, startDate, endDate]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search name, role, etc."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-[12px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Show past staff as well</span>
          <Switch
            checked={showPastStaff}
            onCheckedChange={setShowPastStaff}
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

      {/* Info bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 text-[11px]">
        <span className="text-slate-700">
          Total Employees: <span className="font-semibold">{filteredEmployees.length}</span>
        </span>
        <span className="text-slate-500 ml-3">
          Date Range:{" "}
          <span className="font-semibold">
            {days.length > 0
              ? `${new Date(startDate).toLocaleDateString("en-GB")} - ${new Date(endDate).toLocaleDateString("en-GB")}`
              : "Invalid range"}
          </span>
        </span>
      </div>

      {/* Header */}
      <div>
        <h3 className="text-[13px] font-semibold text-slate-800">
          Timesheet Overview
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Click a cell to cycle hours. Color: green (8+), yellow (4-7), red (&lt;4).
        </p>
      </div>

      {/* Timesheet Grid */}
      <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-0 bg-slate-50 min-w-[75px]">
                Role
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-[75px] bg-slate-50 min-w-[65px]">
                Staff
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-[140px] bg-slate-50 min-w-[60px]">
                Emp ID
              </th>
              {days.map((day) => {
                const d = new Date(day);
                const dayNum = d.getDate();
                const month = d.toLocaleDateString("en-US", { month: "short" });
                return (
                  <th
                    key={day}
                    className="px-0.5 py-1.5 text-center text-slate-500 min-w-[32px]"
                  >
                    <div className="text-[9px] text-slate-400">
                      {dayNum.toString().padStart(2, "0")}/{month.slice(0, 3)}
                    </div>
                  </th>
                );
              })}
              <th className="px-2 py-1.5 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[50px] bg-slate-100">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={4 + days.length}
                  className="px-4 py-6 text-center text-[12px] text-slate-400"
                >
                  No employees match your search.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => {
                const totalHours = getTotalHours(emp.id);
                return (
                  <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50/30">
                    <td className="px-2 py-1 text-[11px] text-slate-600 sticky left-0 bg-white whitespace-nowrap">
                      {emp.designation}
                    </td>
                    <td className="px-2 py-1 text-[11px] font-medium text-slate-800 sticky left-[75px] bg-white whitespace-nowrap">
                      {emp.firstName} {emp.lastName.charAt(0)}.
                    </td>
                    <td className="px-2 py-1 text-[10px] font-mono text-slate-400 sticky left-[140px] bg-white">
                      {emp.empId}
                    </td>
                    {days.map((day) => {
                      const hours = getHours(emp.id, day);
                      return (
                        <td key={day} className="px-0.5 py-0.5 text-center">
                          <HourCell
                            value={hours}
                            onChange={(val) => handleCellChange(emp.id, day, val)}
                          />
                        </td>
                      );
                    })}
                    <td className="px-2 py-1 text-center bg-slate-50">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {totalHours}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
