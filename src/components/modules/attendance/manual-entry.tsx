"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MOCK_EMPLOYEES, DESIGNATIONS } from "./mock-data";

type AttendanceStatus = "P" | "A" | "HD" | "L" | "WO" | "";

const STATUS_CYCLE: AttendanceStatus[] = ["", "P", "A", "HD", "L", "WO"];

const STATUS_LABELS: Record<string, string> = {
  P: "Present",
  A: "Absent",
  HD: "Half Day",
  L: "Leave",
  WO: "Week Off",
};

const STATUS_COLORS: Record<string, string> = {
  P: "bg-emerald-500 text-white",
  A: "bg-rose-500 text-white",
  HD: "bg-amber-500 text-white",
  L: "bg-indigo-400 text-white",
  WO: "bg-slate-400 text-white",
};

const STATUS_RING: Record<string, string> = {
  P: "ring-emerald-200",
  A: "ring-rose-200",
  HD: "ring-amber-200",
  L: "ring-indigo-200",
  WO: "ring-slate-200",
};

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDate();
  const weekday = d.toLocaleDateString("en-US", { weekday: "short" });
  return `${weekday} ${day}`;
}

function getDatesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  const current = new Date(start + "T00:00:00");
  const last = new Date(end + "T00:00:00");
  while (current <= last) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, "0");
    const d = String(current.getDate()).padStart(2, "0");
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function cellKey(empId: string, date: string): string {
  return `${empId}::${date}`;
}

export function ManualEntry() {
  const [startDate, setStartDate] = useState("2026-04-27");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(
    new Set()
  );
  const [notes, setNotes] = useState<Record<string, string>>({});

  // attendance grid keyed by "empId::date" -> status
  const [grid, setGrid] = useState<Record<string, AttendanceStatus>>({});

  const dateColumns = useMemo(
    () => getDatesInRange(startDate, endDate),
    [startDate, endDate]
  );

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      const matchesDesignation =
        designationFilter === "all" || emp.designation === designationFilter;
      const matchesSearch =
        !searchQuery ||
        `${emp.firstName} ${emp.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        emp.empId.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesDesignation && matchesSearch;
    });
  }, [designationFilter, searchQuery]);

  const editedCount = useMemo(
    () => Object.values(grid).filter((v) => v !== "" && v !== undefined).length,
    [grid]
  );

  const selectedCount = selectedEmployees.size;

  // Cycle a single cell through statuses
  const cycleCell = useCallback((empId: string, date: string) => {
    setGrid((prev) => {
      const key = cellKey(empId, date);
      const current = prev[key] || "";
      const idx = STATUS_CYCLE.indexOf(current);
      const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
      return { ...prev, [key]: next };
    });
  }, []);

  // Bulk mark: apply status to selected employees across all date columns
  const bulkMark = useCallback(
    (status: AttendanceStatus) => {
      const targets =
        selectedCount > 0
          ? Array.from(selectedEmployees)
          : filteredEmployees.map((e) => e.id);

      setGrid((prev) => {
        const next = { ...prev };
        targets.forEach((empId) => {
          dateColumns.forEach((date) => {
            next[cellKey(empId, date)] = status;
          });
        });
        return next;
      });
    },
    [selectedCount, selectedEmployees, filteredEmployees, dateColumns]
  );

  // Save handler
  const handleSave = useCallback(() => {
    toast.success("Attendance saved successfully");
  }, []);

  // Select all toggle
  const allSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((e) => selectedEmployees.has(e.id));

  const toggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
      } else {
        setSelectedEmployees(new Set());
      }
    },
    [filteredEmployees]
  );

  const toggleEmployee = useCallback((empId: string, checked: boolean) => {
    setSelectedEmployees((prev) => {
      const next = new Set(prev);
      if (checked) next.add(empId);
      else next.delete(empId);
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-[13px] font-semibold text-slate-800">
          Manual Attendance Entry
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Click a cell to cycle status (P / A / HD / L / WO). Use bulk actions
          to mark multiple employees at once.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">From:</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (e.target.value > endDate) setEndDate(e.target.value);
            }}
            className="w-[130px] h-8 text-[12px]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">To:</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              if (e.target.value < startDate) setStartDate(e.target.value);
            }}
            className="w-[130px] h-8 text-[12px]"
          />
        </div>
        <Select
          value={designationFilter}
          onValueChange={(v) => setDesignationFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[140px] h-8 text-[12px]">
            <SelectValue placeholder="Designation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">
              All Designations
            </SelectItem>
            {DESIGNATIONS.map((d) => (
              <SelectItem key={d} value={d} className="text-[12px]">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[160px] h-8 text-[12px] ml-auto"
        />
      </div>

      {/* Bulk action bar */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-500">
          {selectedCount > 0
            ? `${selectedCount} selected`
            : `All ${filteredEmployees.length} visible`}{" "}
          — Bulk mark:
        </span>
        {(["P", "A", "HD", "L", "WO"] as AttendanceStatus[]).map((s) => (
          <Button
            key={s}
            variant="outline"
            className={`h-6 text-[10px] px-2 font-medium border transition-colors ${
              s === "P"
                ? "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                : s === "A"
                  ? "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  : s === "HD"
                    ? "hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300"
                    : s === "L"
                      ? "hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                      : "hover:bg-slate-100 hover:text-slate-700 hover:border-slate-300"
            }`}
            onClick={() => bulkMark(s)}
          >
            {s} {STATUS_LABELS[s]}
          </Button>
        ))}
        <Button
          variant="outline"
          className="h-6 text-[10px] px-2 font-medium hover:bg-slate-100"
          onClick={() => bulkMark("")}
        >
          Clear
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3">
        {(["P", "A", "HD", "L", "WO"] as AttendanceStatus[]).map((s) => (
          <div key={s} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${STATUS_COLORS[s].split(" ")[0]}`} />
            <span className="text-[10px] text-slate-500">{STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      {/* Entry Grid Table */}
      <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-2 py-1.5 text-left w-8 sticky left-0 bg-slate-50/80 z-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                />
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider sticky left-8 bg-slate-50/80 z-10 min-w-[140px]">
                Employee
              </th>
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[100px]">
                Designation
              </th>
              {dateColumns.map((date) => {
                const dayOfWeek = new Date(date + "T00:00:00").getDay();
                const isSunday = dayOfWeek === 0;
                return (
                  <th
                    key={date}
                    className={`px-1 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider min-w-[44px] ${
                      isSunday
                        ? "text-red-400 bg-red-50/50"
                        : "text-slate-500"
                    }`}
                  >
                    {formatDateShort(date)}
                  </th>
                );
              })}
              <th className="px-2 py-1.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider min-w-[100px]">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp.id}
                className={`border-t border-slate-100 transition-colors ${
                  selectedEmployees.has(emp.id)
                    ? "bg-blue-50/40"
                    : "hover:bg-slate-50/50"
                }`}
              >
                <td className="px-2 py-1.5 sticky left-0 bg-inherit z-10">
                  <Checkbox
                    checked={selectedEmployees.has(emp.id)}
                    onCheckedChange={(checked) =>
                      toggleEmployee(emp.id, !!checked)
                    }
                  />
                </td>
                <td className="px-2 py-1.5 sticky left-8 bg-inherit z-10">
                  <p className="text-[12px] font-medium text-slate-900">
                    {emp.firstName} {emp.lastName}
                  </p>
                  <p className="text-[10px] text-slate-400">{emp.empId}</p>
                </td>
                <td className="px-2 py-1.5 text-[12px] text-slate-600">
                  {emp.designation}
                </td>
                {dateColumns.map((date) => {
                  const key = cellKey(emp.id, date);
                  const status = grid[key] || "";
                  const isSunday =
                    new Date(date + "T00:00:00").getDay() === 0;
                  return (
                    <td
                      key={date}
                      className={`px-1 py-1 text-center ${
                        isSunday ? "bg-red-50/30" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => cycleCell(emp.id, date)}
                        className={`w-8 h-7 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          status
                            ? `${STATUS_COLORS[status]} ring-1 ${STATUS_RING[status]} shadow-sm`
                            : "bg-slate-50 text-slate-300 hover:bg-slate-100 border border-dashed border-slate-200"
                        }`}
                        title={
                          status
                            ? `${STATUS_LABELS[status]} — click to change`
                            : "Click to set status"
                        }
                      >
                        {status || "-"}
                      </button>
                    </td>
                  );
                })}
                <td className="px-2 py-1.5">
                  <Input
                    className="h-6 text-[11px] w-24 border-slate-200"
                    placeholder="Add note..."
                    value={notes[emp.id] || ""}
                    onChange={(e) =>
                      setNotes((prev) => ({
                        ...prev,
                        [emp.id]: e.target.value,
                      }))
                    }
                  />
                </td>
              </tr>
            ))}
            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan={dateColumns.length + 4}
                  className="px-4 py-8 text-center text-[12px] text-slate-400"
                >
                  No employees match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          Showing {filteredEmployees.length} of {MOCK_EMPLOYEES.length} staff
          &middot; {editedCount} cell{editedCount !== 1 ? "s" : ""} marked
          &middot; {dateColumns.length} day{dateColumns.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          <Button
            className="h-7 text-[11px] px-3 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleSave}
            disabled={editedCount === 0}
          >
            Save Attendance ({editedCount})
          </Button>
        </div>
      </div>
    </div>
  );
}
