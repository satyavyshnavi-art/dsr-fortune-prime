"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Clock, Users } from "lucide-react";
import {
  MOCK_EMPLOYEES,
  MOCK_ATTENDANCE,
  type AttendanceRecord,
  type Employee,
} from "./mock-data";

// Map DB enum values to UI short codes
const DB_TO_STATUS: Record<string, AttendanceRecord["status"]> = {
  present: "P",
  absent: "A",
  half_day: "HD",
  leave: "L",
  week_off: "WO",
};

const SHIFTS = [
  { id: "morning", name: "Morning (8 hrs)", startHour: 6, endHour: 14 },
  { id: "evening", name: "Evening (8 hrs)", startHour: 14, endHour: 22 },
  { id: "night", name: "Night (8 hrs)", startHour: 22, endHour: 6 },
  { id: "flexible", name: "Flexible", startHour: 9, endHour: 18 },
] as const;

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}

export function ShiftView() {
  const today = formatDate(new Date());
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [includePastStaff, setIncludePastStaff] = useState(false);
  const [selectedShift, setSelectedShift] = useState("morning");
  const [showLogDialog, setShowLogDialog] = useState(false);

  // Employees + Attendance: API with mock fallback
  const [employeeList, setEmployeeList] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>(MOCK_ATTENDANCE);

  useEffect(() => {
    fetch("/api/v1/employees")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployeeList(
            data.map((e: Record<string, string>) => ({
              id: e.id,
              empId: e.empId || e.emp_id || "",
              firstName: e.firstName || e.first_name || "",
              lastName: e.lastName || e.last_name || "",
              designation: e.designation || "",
              department: e.department || "",
              phone: e.phone || "",
              email: e.email || "",
              dateOfBirth: e.dateOfBirth || e.date_of_birth || "",
              qrConfigured: false,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;
    fetch(`/api/v1/attendance?dateFrom=${startDate}&dateTo=${endDate}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAttendanceData(
            data.map((rec: { employeeId: string; date: string; status: string; checkIn?: string; checkOut?: string; hours?: number }) => ({
              employeeId: rec.employeeId,
              date: rec.date,
              status: (DB_TO_STATUS[rec.status] || rec.status) as AttendanceRecord["status"],
              checkIn: rec.checkIn,
              checkOut: rec.checkOut,
              hours: rec.hours ?? 0,
            }))
          );
        }
      })
      .catch(() => {});
  }, [startDate, endDate]);

  // Compute stats from attendance data for selected date range
  const stats = useMemo(() => {
    const totalEmployees = employeeList.length;

    // Get records in date range
    const recordsInRange = attendanceData.filter((r) => {
      return r.date >= startDate && r.date <= endDate;
    });

    if (recordsInRange.length === 0) {
      return {
        presentPercent: 0,
        presentCount: 0,
        totalCount: totalEmployees,
        leaveAb: 0,
        weekoff: 0,
        reliever: 0,
        pending: totalEmployees,
      };
    }

    // Count unique statuses across the date range (use last date for daily snapshot)
    const lastDate = endDate <= today ? endDate : today;
    const dayRecords = attendanceData.filter((r) => r.date === lastDate);

    let present = 0;
    let leave = 0;
    let weekoff = 0;
    const checkedEmployeeIds = new Set<string>();

    dayRecords.forEach((r) => {
      checkedEmployeeIds.add(r.employeeId);
      if (r.status === "P") present++;
      else if (r.status === "L" || r.status === "A") leave++;
      else if (r.status === "WO") weekoff++;
    });

    const pending = totalEmployees - checkedEmployeeIds.size;
    // Mock reliever count: employees from other shifts covering
    const reliever = Math.min(2, Math.floor(leave / 2));
    const presentPercent =
      totalEmployees > 0 ? Math.round((present / totalEmployees) * 100) : 0;

    return {
      presentPercent,
      presentCount: present,
      totalCount: totalEmployees,
      leaveAb: leave,
      weekoff,
      reliever,
      pending,
    };
  }, [startDate, endDate, today, employeeList, attendanceData]);

  // Get today's attendance log for dialog
  const todayLog = useMemo(() => {
    return attendanceData.filter((r) => r.date === today).map((r) => {
      const emp = employeeList.find((e) => e.id === r.employeeId);
      return {
        ...r,
        employeeName: emp
          ? `${emp.firstName} ${emp.lastName}`
          : "Unknown",
        empId: emp?.empId ?? "-",
        designation: emp?.designation ?? "-",
      };
    });
  }, [today, attendanceData, employeeList]);

  const currentShift = SHIFTS.find((s) => s.id === selectedShift) ?? SHIFTS[0];

  return (
    <div className="space-y-3">
      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Shift Selector */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <Select
            value={selectedShift}
            onValueChange={(v) => setSelectedShift(v ?? "morning")}
          >
            <SelectTrigger className="h-8 w-[180px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SHIFTS.map((shift) => (
                <SelectItem
                  key={shift.id}
                  value={shift.id}
                  className="text-[12px]"
                >
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Past Staff Toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500">Include past staff</span>
          <Switch
            checked={includePastStaff}
            onCheckedChange={setIncludePastStaff}
          />
        </div>
      </div>

      {/* Date Range + View Log */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">Start:</span>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 w-[150px] text-[12px]"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">End:</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 w-[150px] text-[12px]"
            />
          </div>
        </div>
        <Button
          className="h-7 text-[11px] px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white uppercase tracking-wide"
          onClick={() => setShowLogDialog(true)}
        >
          <Eye className="h-3 w-3" />
          View Today&apos;s Log
        </Button>
      </div>

      {/* Shift Card */}
      <div className="max-w-[280px] rounded-md border border-slate-200 bg-white p-4 text-center space-y-3">
        <div className="flex items-center justify-center gap-1.5">
          <Users className="h-4 w-4 text-slate-500" />
          <h4 className="text-[13px] font-semibold text-slate-800">
            {currentShift.name}
          </h4>
        </div>

        <div>
          <p className="text-[36px] font-bold text-slate-900 leading-none">
            {stats.presentPercent}%
          </p>
          <p className="text-[11px] text-green-600 mt-1">
            Present {stats.presentCount}/{stats.totalCount}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Leave/Ab", value: stats.leaveAb, color: "text-red-600" },
            { label: "Weekoff", value: stats.weekoff, color: "text-amber-600" },
            { label: "Reliever", value: stats.reliever, color: "text-blue-600" },
            { label: "Pending", value: stats.pending, color: "text-slate-600" },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-slate-200 rounded-md p-2 text-center"
            >
              <p className="text-[10px] text-slate-400">{item.label}</p>
              <p className={`text-[16px] font-bold ${item.color}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Log Dialog */}
      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">
              Today&apos;s Attendance Log - {currentShift.name}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2 py-2">
            {todayLog.length === 0 ? (
              <p className="text-[12px] text-slate-400 text-center py-6">
                No attendance records for today
              </p>
            ) : (
              todayLog.map((entry, idx) => (
                <div
                  key={`${entry.employeeId}-${idx}`}
                  className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-[12px] font-medium text-slate-800">
                      {entry.employeeName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {entry.empId} - {entry.designation}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.checkIn && (
                      <span className="text-[10px] text-slate-500">
                        {entry.checkIn}
                        {entry.checkOut ? ` - ${entry.checkOut}` : ""}
                      </span>
                    )}
                    <Badge
                      className={`text-[10px] px-1.5 py-0 h-[18px] ${
                        entry.status === "P"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : entry.status === "L"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : entry.status === "WO"
                              ? "bg-blue-100 text-blue-700 border-blue-200"
                              : entry.status === "A"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      {entry.status === "P"
                        ? "Present"
                        : entry.status === "A"
                          ? "Absent"
                          : entry.status === "L"
                            ? "Leave"
                            : entry.status === "WO"
                              ? "Week Off"
                              : entry.status || "-"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          <DialogFooter showCloseButton>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span>
                Total: {todayLog.length} |
                Present: {todayLog.filter((r) => r.status === "P").length} |
                Absent: {todayLog.filter((r) => r.status === "A").length}
              </span>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
