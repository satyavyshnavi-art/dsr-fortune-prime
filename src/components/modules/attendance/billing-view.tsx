"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE } from "./mock-data";
import { exportCSV, exportPDF } from "@/lib/export";

interface BillingRow {
  role: string;
  headcount: number;
  presentA: number;
  weekoffB: number;
  holidayC: number;
  standbyOtD: number;
  leaveE: number;
  absent: number;
  agreement: number;
  billable: number;
}

export function BillingView() {
  const [startDate, setStartDate] = useState("2026-04-01");
  const [endDate, setEndDate] = useState("2026-04-30");
  const [appliedStart, setAppliedStart] = useState("2026-04-01");
  const [appliedEnd, setAppliedEnd] = useState("2026-04-30");
  const [designationFilter, setDesignationFilter] = useState("all");
  const [showPastStaff, setShowPastStaff] = useState(false);
  const [showAgreed, setShowAgreed] = useState(true);
  const [downloading, setDownloading] = useState<"pdf" | "csv" | null>(null);

  const handleGo = useCallback(() => {
    setAppliedStart(startDate);
    setAppliedEnd(endDate);
  }, [startDate, endDate]);

  const dayCount = useMemo(() => {
    const start = new Date(appliedStart);
    const end = new Date(appliedEnd);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [appliedStart, appliedEnd]);

  const filteredEmployees = useMemo(() => {
    return MOCK_EMPLOYEES.filter((emp) => {
      if (designationFilter !== "all" && emp.designation !== designationFilter) {
        return false;
      }
      return true;
    });
  }, [designationFilter]);

  const billingData: BillingRow[] = useMemo(() => {
    const groups: Record<string, typeof MOCK_EMPLOYEES> = {};
    filteredEmployees.forEach((emp) => {
      if (!groups[emp.designation]) groups[emp.designation] = [];
      groups[emp.designation].push(emp);
    });

    return Object.entries(groups).map(([role, emps]) => {
      let totalPresent = 0;
      let totalAbsent = 0;
      let totalLeave = 0;
      let totalWeekoff = 0;

      emps.forEach((emp) => {
        const records = MOCK_ATTENDANCE.filter(
          (r) =>
            r.employeeId === emp.id &&
            r.date >= appliedStart &&
            r.date <= appliedEnd
        );
        records.forEach((r) => {
          if (r.status === "P") totalPresent++;
          else if (r.status === "A") totalAbsent++;
          else if (r.status === "L") totalLeave++;
          else if (r.status === "WO") totalWeekoff++;
        });
      });

      const agreement = emps.length * dayCount;
      const billable = totalPresent + totalWeekoff + totalLeave;

      return {
        role,
        headcount: emps.length,
        presentA: totalPresent,
        weekoffB: totalWeekoff,
        holidayC: 0,
        standbyOtD: 0,
        leaveE: totalLeave,
        absent: totalAbsent,
        agreement,
        billable,
      };
    });
  }, [filteredEmployees, appliedStart, appliedEnd, dayCount]);

  const totals = useMemo(() => {
    return billingData.reduce(
      (acc, row) => ({
        headcount: acc.headcount + row.headcount,
        presentA: acc.presentA + row.presentA,
        weekoffB: acc.weekoffB + row.weekoffB,
        holidayC: acc.holidayC + row.holidayC,
        standbyOtD: acc.standbyOtD + row.standbyOtD,
        leaveE: acc.leaveE + row.leaveE,
        absent: acc.absent + row.absent,
        agreement: acc.agreement + row.agreement,
        billable: acc.billable + row.billable,
      }),
      {
        headcount: 0,
        presentA: 0,
        weekoffB: 0,
        holidayC: 0,
        standbyOtD: 0,
        leaveE: 0,
        absent: 0,
        agreement: 0,
        billable: 0,
      }
    );
  }, [billingData]);

  const handleDownload = useCallback((type: "pdf" | "csv") => {
    setDownloading(type);
    const rows = billingData.map((row) => ({
      "Designation": row.role,
      "Headcount": row.headcount,
      "Present": row.presentA,
      "Week Off": row.weekoffB,
      "Holiday": row.holidayC,
      "Standby": row.standbyOtD,
      "Leave": row.leaveE,
      "Absent": row.absent,
      ...(showAgreed ? { "Agreement": row.agreement } : {}),
      "Billable": row.billable,
    }));
    const filename = `Billing_Summary_${appliedStart}_to_${appliedEnd}`;
    if (type === "csv") {
      exportCSV(rows, filename);
    } else {
      exportPDF(rows, filename, "Attendance Billing Summary");
    }
    setTimeout(() => setDownloading(null), 500);
  }, [billingData, showAgreed, appliedStart, appliedEnd]);

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Select
          value={designationFilter}
          onValueChange={(v) => setDesignationFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[120px] h-8 text-[12px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All</SelectItem>
            {Array.from(
              new Set(MOCK_EMPLOYEES.map((e) => e.designation))
            ).map((d) => (
              <SelectItem key={d} value={d} className="text-[12px]">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Include Past Staff</span>
            <Switch checked={showPastStaff} onCheckedChange={setShowPastStaff} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Include Agreed Values</span>
            <Switch checked={showAgreed} onCheckedChange={setShowAgreed} />
          </div>
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

      {/* Date Range & GO */}
      <div className="flex items-center gap-3">
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
        <Button
          className="h-7 text-[11px] px-3 bg-green-600 hover:bg-green-700 text-white font-semibold"
          onClick={handleGo}
        >
          GO
        </Button>
      </div>

      {/* Summary Header */}
      <div className="text-center space-y-0.5">
        <h3 className="text-[15px] font-bold text-slate-800">
          Attendance Summary
        </h3>
        <p className="text-[11px] text-slate-400">
          For period of {dayCount} days
          {designationFilter !== "all" && (
            <span className="ml-1">
              | Filtered: <span className="font-medium text-slate-600">{designationFilter}</span>
            </span>
          )}
        </p>
      </div>

      {/* Info bar */}
      <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 flex items-center gap-4 text-[11px]">
        <span className="text-slate-700">
          Total Employees: <span className="font-semibold">{filteredEmployees.length}</span>
        </span>
        <span className="text-slate-700">
          Date Range:{" "}
          <span className="font-semibold">
            {new Date(appliedStart).toLocaleDateString("en-GB")} -{" "}
            {new Date(appliedEnd).toLocaleDateString("en-GB")}
          </span>
        </span>
      </div>

      {/* Billing Table */}
      <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="px-3 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Role (Headcount)
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Present [A]
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Weekoff [B]
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Holiday [C]
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Standby/OT [D]
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Leave [E]
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Absent
              </th>
              {showAgreed && (
                <th className="px-3 py-2 text-center text-[10px] font-semibold text-blue-600 uppercase tracking-wider">
                  Agreement
                </th>
              )}
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Billable [A+B+C+D+E]
              </th>
            </tr>
          </thead>
          <tbody>
            {billingData.length === 0 ? (
              <tr>
                <td
                  colSpan={showAgreed ? 9 : 8}
                  className="px-4 py-6 text-center text-[12px] text-slate-400"
                >
                  No data for selected filters.
                </td>
              </tr>
            ) : (
              <>
                {billingData.map((row) => (
                  <tr key={row.role} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-3 py-2 text-[12px] font-medium text-slate-800">
                      {row.role} [{row.headcount}]
                    </td>
                    <td className="px-3 py-2 text-[12px] text-center text-slate-600">{row.presentA}</td>
                    <td className="px-3 py-2 text-[12px] text-center text-slate-600">{row.weekoffB}</td>
                    <td className="px-3 py-2 text-[12px] text-center text-slate-600">{row.holidayC}</td>
                    <td className="px-3 py-2 text-[12px] text-center text-slate-600">{row.standbyOtD}</td>
                    <td className="px-3 py-2 text-[12px] text-center text-slate-600">{row.leaveE}</td>
                    <td className="px-3 py-2 text-[12px] text-center text-slate-600">{row.absent}</td>
                    {showAgreed && (
                      <td className="px-3 py-2 text-[12px] text-center text-blue-600 font-medium">
                        {row.agreement}
                      </td>
                    )}
                    <td className="px-3 py-2 text-[12px] text-center text-red-600 font-medium">
                      {row.billable}
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="border-t-2 border-slate-300 bg-slate-50 font-semibold">
                  <td className="px-3 py-2 text-[12px] text-slate-800">
                    Total [{totals.headcount}]
                  </td>
                  <td className="px-3 py-2 text-[12px] text-center text-slate-700">{totals.presentA}</td>
                  <td className="px-3 py-2 text-[12px] text-center text-slate-700">{totals.weekoffB}</td>
                  <td className="px-3 py-2 text-[12px] text-center text-slate-700">{totals.holidayC}</td>
                  <td className="px-3 py-2 text-[12px] text-center text-slate-700">{totals.standbyOtD}</td>
                  <td className="px-3 py-2 text-[12px] text-center text-slate-700">{totals.leaveE}</td>
                  <td className="px-3 py-2 text-[12px] text-center text-slate-700">{totals.absent}</td>
                  {showAgreed && (
                    <td className="px-3 py-2 text-[12px] text-center text-blue-700 font-bold">
                      {totals.agreement}
                    </td>
                  )}
                  <td className="px-3 py-2 text-[12px] text-center text-red-700 font-bold">
                    {totals.billable}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
