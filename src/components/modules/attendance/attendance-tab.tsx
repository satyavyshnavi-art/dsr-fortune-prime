"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import {
  Pencil,
  Trash2,
  Plus,
  Calendar,
  Check,
  X,
  Clock,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  MOCK_EMPLOYEES,
  MOCK_LEAVE_REQUESTS,
  MOCK_WEEK_OFFS,
  type LeaveRequest,
  type WeekOff,
} from "./mock-data";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
}

interface ShiftAssignment {
  employeeId: string;
  employeeName: string;
  shiftId: string;
  shiftName: string;
}

interface WeekOffEntry {
  employeeName: string;
  employeeId: string;
  days: string;
  daySet: Set<string>;
}

const DEFAULT_SHIFTS: ShiftTemplate[] = [
  { id: "1", name: "Morning", startTime: "09:00", endTime: "17:00" },
  { id: "2", name: "Evening", startTime: "14:00", endTime: "22:00" },
  { id: "3", name: "Night", startTime: "22:00", endTime: "06:00" },
];

const DEFAULT_ASSIGNMENTS: ShiftAssignment[] = [
  { employeeId: "1", employeeName: "Neha Agarwal", shiftId: "1", shiftName: "Morning" },
  { employeeId: "2", employeeName: "Shalini Mehta", shiftId: "1", shiftName: "Morning" },
  { employeeId: "3", employeeName: "Pradeep Desai", shiftId: "2", shiftName: "Evening" },
];

function buildWeekOffEntries(weekOffs: WeekOff[]): WeekOffEntry[] {
  return weekOffs.map((wo, i) => {
    const daySet = new Set(
      wo.days.split(",").map((d) => d.trim().slice(0, 3))
    );
    const emp = MOCK_EMPLOYEES.find(
      (e) => `${e.firstName} ${e.lastName}` === wo.employeeName
    );
    return {
      employeeName: wo.employeeName,
      employeeId: emp?.id ?? `wo-${i}`,
      days: wo.days,
      daySet,
    };
  });
}

export function AttendanceTab() {
  // Employees: API with mock fallback (for dropdowns)
  const [employeeList, setEmployeeList] = useState(MOCK_EMPLOYEES);

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

  // --- Shift state ---
  const [shifts, setShifts] = useState<ShiftTemplate[]>(DEFAULT_SHIFTS);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>(DEFAULT_ASSIGNMENTS);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftTemplate | null>(null);
  const [shiftForm, setShiftForm] = useState({ name: "", startTime: "09:00", endTime: "17:00" });
  const [shiftErrors, setShiftErrors] = useState<Record<string, string>>({});
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [assignShiftEmp, setAssignShiftEmp] = useState("");
  const [assignShiftId, setAssignShiftId] = useState("");
  const [rosterDialogOpen, setRosterDialogOpen] = useState(false);

  // --- Week Off state ---
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [weekOffDays, setWeekOffDays] = useState<Set<string>>(new Set());
  const [weekOffEntries, setWeekOffEntries] = useState<WeekOffEntry[]>(
    buildWeekOffEntries(MOCK_WEEK_OFFS)
  );
  const [weekOffSaved, setWeekOffSaved] = useState(false);
  const [editWeekOffOpen, setEditWeekOffOpen] = useState(false);
  const [editWeekOffTarget, setEditWeekOffTarget] = useState<WeekOffEntry | null>(null);
  const [editWeekOffDays, setEditWeekOffDays] = useState<Set<string>>(new Set());
  const [deleteWeekOffOpen, setDeleteWeekOffOpen] = useState(false);
  const [deleteWeekOffTarget, setDeleteWeekOffTarget] = useState<WeekOffEntry | null>(null);

  // --- Leave state ---
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(MOCK_LEAVE_REQUESTS);
  const [leaveSearch, setLeaveSearch] = useState("");
  const [leaveStatusFilter, setLeaveStatusFilter] = useState("all");
  const [addLeaveErrors, setAddLeaveErrors] = useState<Record<string, string>>({});
  const [addLeaveOpen, setAddLeaveOpen] = useState(false);
  const [addLeaveForm, setAddLeaveForm] = useState({
    employeeName: "",
    type: "Sick Leave",
    dateFrom: "",
    dateTo: "",
    reason: "",
  });
  const [editLeaveOpen, setEditLeaveOpen] = useState(false);
  const [editLeaveTarget, setEditLeaveTarget] = useState<LeaveRequest | null>(null);
  const [editLeaveForm, setEditLeaveForm] = useState({
    type: "",
    dateFrom: "",
    dateTo: "",
    reason: "",
    status: "" as LeaveRequest["status"],
  });
  const [deleteLeaveOpen, setDeleteLeaveOpen] = useState(false);
  const [deleteLeaveTarget, setDeleteLeaveTarget] = useState<LeaveRequest | null>(null);

  // --- Shift handlers ---
  const openCreateShift = () => {
    setEditingShift(null);
    setShiftForm({ name: "", startTime: "09:00", endTime: "17:00" });
    setShiftErrors({});
    setShiftDialogOpen(true);
  };

  const openEditShift = (shift: ShiftTemplate) => {
    setEditingShift(shift);
    setShiftForm({ name: shift.name, startTime: shift.startTime, endTime: shift.endTime });
    setShiftDialogOpen(true);
  };

  const handleSaveShift = () => {
    const newErrors: Record<string, string> = {};
    if (!shiftForm.name.trim()) newErrors.name = "Shift name is required";
    if (Object.keys(newErrors).length > 0) {
      setShiftErrors(newErrors);
      return;
    }
    setShiftErrors({});
    if (editingShift) {
      setShifts((prev) =>
        prev.map((s) =>
          s.id === editingShift.id
            ? { ...s, name: shiftForm.name, startTime: shiftForm.startTime, endTime: shiftForm.endTime }
            : s
        )
      );
      setAssignments((prev) =>
        prev.map((a) =>
          a.shiftId === editingShift.id ? { ...a, shiftName: shiftForm.name } : a
        )
      );
      toast.success("Shift updated successfully");
    } else {
      const newId = String(Date.now());
      setShifts((prev) => [
        ...prev,
        { id: newId, name: shiftForm.name, startTime: shiftForm.startTime, endTime: shiftForm.endTime },
      ]);
      toast.success("Shift created successfully");
    }
    setShiftDialogOpen(false);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== shiftId));
    setAssignments((prev) => prev.filter((a) => a.shiftId !== shiftId));
    toast.success("Shift deleted successfully");
  };

  const handleAssignShift = () => {
    if (!assignShiftEmp || !assignShiftId) return;
    const emp = employeeList.find((e) => e.id === assignShiftEmp);
    const shift = shifts.find((s) => s.id === assignShiftId);
    if (!emp || !shift) return;
    setAssignments((prev) => {
      const filtered = prev.filter((a) => a.employeeId !== assignShiftEmp);
      return [
        ...filtered,
        {
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          shiftId: shift.id,
          shiftName: shift.name,
        },
      ];
    });
    setAssignShiftEmp("");
    setAssignShiftId("");
    toast.success("Shift assigned successfully");
  };

  const handleRemoveAssignment = (employeeId: string) => {
    setAssignments((prev) => prev.filter((a) => a.employeeId !== employeeId));
    toast.success("Assignment removed");
  };

  // --- Week Off handlers ---
  const handleAssignWeekOff = () => {
    if (!selectedEmployee || weekOffDays.size === 0) return;
    const emp = employeeList.find((e) => e.id === selectedEmployee);
    if (!emp) return;
    const empName = `${emp.firstName} ${emp.lastName}`;
    const daysStr = DAYS_OF_WEEK.filter((d) => weekOffDays.has(d))
      .map((d) => {
        const map: Record<string, string> = {
          Mon: "Monday",
          Tue: "Tuesday",
          Wed: "Wednesday",
          Thu: "Thursday",
          Fri: "Friday",
          Sat: "Saturday",
          Sun: "Sunday",
        };
        return map[d];
      })
      .join(", ");
    setWeekOffEntries((prev) => {
      const filtered = prev.filter((w) => w.employeeId !== selectedEmployee);
      return [
        ...filtered,
        { employeeName: empName, employeeId: selectedEmployee, days: daysStr, daySet: new Set(weekOffDays) },
      ];
    });
    setSelectedEmployee("");
    setWeekOffDays(new Set());
    setWeekOffSaved(true);
    setTimeout(() => setWeekOffSaved(false), 2000);
    toast.success("Week off saved successfully");
  };

  const openEditWeekOff = (entry: WeekOffEntry) => {
    setEditWeekOffTarget(entry);
    setEditWeekOffDays(new Set(entry.daySet));
    setEditWeekOffOpen(true);
  };

  const handleEditWeekOff = () => {
    if (!editWeekOffTarget) return;
    const daysStr = DAYS_OF_WEEK.filter((d) => editWeekOffDays.has(d))
      .map((d) => {
        const map: Record<string, string> = {
          Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday",
          Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
        };
        return map[d];
      })
      .join(", ");
    setWeekOffEntries((prev) =>
      prev.map((w) =>
        w.employeeId === editWeekOffTarget.employeeId
          ? { ...w, days: daysStr, daySet: new Set(editWeekOffDays) }
          : w
      )
    );
    setEditWeekOffOpen(false);
    toast.success("Week off updated successfully");
  };

  const openDeleteWeekOff = (entry: WeekOffEntry) => {
    setDeleteWeekOffTarget(entry);
    setDeleteWeekOffOpen(true);
  };

  const handleDeleteWeekOff = () => {
    if (!deleteWeekOffTarget) return;
    setWeekOffEntries((prev) =>
      prev.filter((w) => w.employeeId !== deleteWeekOffTarget.employeeId)
    );
    setDeleteWeekOffOpen(false);
    toast.success("Deleted successfully");
  };

  // --- Leave handlers ---
  const filteredLeaves = useMemo(() => {
    return leaveRequests.filter((lr) => {
      const matchesSearch =
        !leaveSearch ||
        lr.employeeName.toLowerCase().includes(leaveSearch.toLowerCase()) ||
        lr.type.toLowerCase().includes(leaveSearch.toLowerCase());
      const matchesStatus =
        leaveStatusFilter === "all" ||
        lr.status.toLowerCase() === leaveStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [leaveRequests, leaveSearch, leaveStatusFilter]);

  const handleApproveLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status: "Approved" as const } : lr))
    );
    toast.success("Leave approved");
  };

  const handleRejectLeave = (id: string) => {
    setLeaveRequests((prev) =>
      prev.map((lr) => (lr.id === id ? { ...lr, status: "Rejected" as const } : lr))
    );
    toast.success("Leave rejected");
  };

  const handleAddLeave = () => {
    const newErrors: Record<string, string> = {};
    if (!addLeaveForm.employeeName) newErrors.employeeName = "Employee is required";
    if (!addLeaveForm.dateFrom) newErrors.dateFrom = "Start date is required";
    if (!addLeaveForm.dateTo) newErrors.dateTo = "End date is required";
    if (Object.keys(newErrors).length > 0) {
      setAddLeaveErrors(newErrors);
      return;
    }
    setAddLeaveErrors({});
    const from = new Date(addLeaveForm.dateFrom);
    const to = new Date(addLeaveForm.dateTo);
    const diffDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const newId = String(Date.now());
    setLeaveRequests((prev) => [
      {
        id: newId,
        employeeName: addLeaveForm.employeeName,
        type: addLeaveForm.type,
        dateFrom: addLeaveForm.dateFrom,
        dateTo: addLeaveForm.dateTo,
        days: diffDays,
        reason: addLeaveForm.reason,
        status: "Pending",
      },
      ...prev,
    ]);
    setAddLeaveForm({ employeeName: "", type: "Sick Leave", dateFrom: "", dateTo: "", reason: "" });
    setAddLeaveOpen(false);
    toast.success("Leave request added successfully");
  };

  const openEditLeave = (lr: LeaveRequest) => {
    setEditLeaveTarget(lr);
    setEditLeaveForm({
      type: lr.type,
      dateFrom: lr.dateFrom,
      dateTo: lr.dateTo,
      reason: lr.reason,
      status: lr.status,
    });
    setEditLeaveOpen(true);
  };

  const handleEditLeave = () => {
    if (!editLeaveTarget) return;
    const from = new Date(editLeaveForm.dateFrom);
    const to = new Date(editLeaveForm.dateTo);
    const diffDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    setLeaveRequests((prev) =>
      prev.map((lr) =>
        lr.id === editLeaveTarget.id
          ? {
              ...lr,
              type: editLeaveForm.type,
              dateFrom: editLeaveForm.dateFrom,
              dateTo: editLeaveForm.dateTo,
              reason: editLeaveForm.reason,
              status: editLeaveForm.status,
              days: diffDays,
            }
          : lr
      )
    );
    setEditLeaveOpen(false);
    toast.success("Leave updated successfully");
  };

  const openDeleteLeave = (lr: LeaveRequest) => {
    setDeleteLeaveTarget(lr);
    setDeleteLeaveOpen(true);
  };

  const handleDeleteLeave = () => {
    if (!deleteLeaveTarget) return;
    setLeaveRequests((prev) => prev.filter((lr) => lr.id !== deleteLeaveTarget.id));
    setDeleteLeaveOpen(false);
    toast.success("Deleted successfully");
  };

  // When an employee is selected in week off planner, load their existing days
  const handleSelectWeekOffEmployee = (empId: string) => {
    setSelectedEmployee(empId);
    const existing = weekOffEntries.find((w) => w.employeeId === empId);
    if (existing) {
      setWeekOffDays(new Set(existing.daySet));
    } else {
      setWeekOffDays(new Set());
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-semibold text-slate-800">
        Attendance & Staffing
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ========== SHIFT SCHEDULE & ROSTER ========== */}
        <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <h4 className="text-[13px] font-semibold text-slate-800">
              Shift Schedule & Roster
            </h4>
          </div>

          {/* Shift summary */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium text-slate-500">Active Shifts</p>
            {shifts.map((s) => {
              const count = assignments.filter((a) => a.shiftId === s.id).length;
              return (
                <div key={s.id} className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-[10px] px-1.5 py-0 h-[18px]">
                    {s.name}
                  </Badge>
                  <span className="text-[11px] text-slate-500">
                    {s.startTime} - {s.endTime}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-auto">
                    {count} assigned
                  </span>
                </div>
              );
            })}
          </div>

          <Button
            onClick={openCreateShift}
            className="w-full h-8 text-[11px] bg-purple-600 hover:bg-purple-700 text-white gap-1"
          >
            <Plus className="h-3 w-3" />
            Configure Shift Templates
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-7 text-[11px] w-full gap-1"
              onClick={() => setManageDialogOpen(true)}
            >
              <Calendar className="h-3 w-3" />
              Manage
            </Button>
            <Button
              variant="outline"
              className="h-7 text-[11px] w-full gap-1"
              onClick={() => setRosterDialogOpen(true)}
            >
              <RotateCcw className="h-3 w-3" />
              Roster
            </Button>
          </div>
        </div>

        {/* ========== WEEK OFF PLANNER ========== */}
        <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
          <h4 className="text-[13px] font-semibold text-slate-800">
            Weekoff Planner
          </h4>

          <Select
            value={selectedEmployee}
            onValueChange={(v) => handleSelectWeekOffEmployee(v ?? "")}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-lg">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employeeList.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="text-[13px]">
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-0.5">
            {DAYS_OF_WEEK.map((day) => (
              <button
                key={day}
                className={`flex-1 py-1 text-[10px] font-medium rounded transition-colors ${
                  weekOffDays.has(day)
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
                onClick={() =>
                  setWeekOffDays((prev) => {
                    const next = new Set(prev);
                    if (next.has(day)) next.delete(day);
                    else next.add(day);
                    return next;
                  })
                }
              >
                {day}
              </button>
            ))}
          </div>

          <Button
            onClick={handleAssignWeekOff}
            disabled={!selectedEmployee || weekOffDays.size === 0}
            className="w-full h-8 text-[11px] bg-green-600 hover:bg-green-700 text-white gap-1 disabled:opacity-50"
          >
            <Plus className="h-3 w-3" />
            Assign Weekoff
          </Button>

          {weekOffSaved && (
            <div className="flex items-center gap-1 text-[11px] text-green-600 font-medium">
              <Check className="h-3 w-3" />
              Week off saved successfully
            </div>
          )}

          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1.5">
              Configured Weekoffs
            </p>
            {weekOffEntries.length === 0 && (
              <p className="text-[10px] text-slate-400">No week offs configured</p>
            )}
            {weekOffEntries.map((wo) => (
              <div
                key={wo.employeeId}
                className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0"
              >
                <div>
                  <p className="text-[12px] font-medium text-slate-800">
                    {wo.employeeName}
                  </p>
                  <p className="text-[10px] text-slate-400">{wo.days}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => openEditWeekOff(wo)}
                  >
                    <Pencil className="h-2.5 w-2.5 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => openDeleteWeekOff(wo)}
                  >
                    <Trash2 className="h-2.5 w-2.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========== LEAVE PLANNER ========== */}
        <div className="rounded-md border border-red-200 bg-red-50/20 p-4 space-y-3">
          <div>
            <h4 className="text-[13px] font-semibold text-slate-800">
              Leave Planner
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <button
                onClick={() => setLeaveStatusFilter("all")}
                className="text-[11px] text-blue-600 hover:underline font-medium"
              >
                View All
              </button>
              <button
                onClick={() => setAddLeaveOpen(true)}
                className="text-[11px] text-blue-600 hover:underline font-medium flex items-center gap-0.5"
              >
                <Plus className="h-2.5 w-2.5" />
                Add Leave
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
            <Input
              placeholder="Search by name or type..."
              value={leaveSearch}
              onChange={(e) => setLeaveSearch(e.target.value)}
              className="h-9 text-[13px] rounded-lg pl-8"
            />
          </div>
          <Select
            value={leaveStatusFilter}
            onValueChange={(v) => setLeaveStatusFilter(v ?? "all")}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-lg">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[13px]">All Status</SelectItem>
              <SelectItem value="pending" className="text-[13px]">Pending</SelectItem>
              <SelectItem value="approved" className="text-[13px]">Approved</SelectItem>
              <SelectItem value="rejected" className="text-[13px]">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredLeaves.length === 0 && (
              <p className="text-[11px] text-slate-400 text-center py-4">No leave requests found</p>
            )}
            {filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white rounded-md border border-slate-200 p-2.5 space-y-1"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[12px] font-medium text-slate-800">
                      {leave.employeeName}
                    </p>
                    <p className="text-[10px] text-slate-400">{leave.type}</p>
                  </div>
                  <Badge
                    className={`text-[10px] px-1.5 py-0 h-[18px] ${
                      leave.status === "Approved"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : leave.status === "Rejected"
                          ? "bg-red-100 text-red-700 border-red-200"
                          : "bg-yellow-100 text-yellow-700 border-yellow-200"
                    }`}
                  >
                    {leave.status}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500">
                  {leave.dateFrom} - {leave.dateTo}
                </p>
                <p className="text-[10px] text-blue-600">{leave.days} days</p>
                {leave.reason && (
                  <p className="text-[10px] text-slate-400">{leave.reason}</p>
                )}
                <div className="flex items-center gap-1 pt-0.5">
                  {leave.status === "Pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-green-50"
                        onClick={() => handleApproveLeave(leave.id)}
                        title="Approve"
                      >
                        <Check className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:bg-red-50"
                        onClick={() => handleRejectLeave(leave.id)}
                        title="Reject"
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => openEditLeave(leave)}
                    title="Edit"
                  >
                    <Pencil className="h-2.5 w-2.5 text-slate-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => openDeleteLeave(leave)}
                    title="Delete"
                  >
                    <Trash2 className="h-2.5 w-2.5 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SHIFT TEMPLATE DIALOG (Create / Edit) ===== */}
      <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              {editingShift ? "Edit Shift Template" : "Create Shift Template"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Shift Name *</Label>
              <Input
                value={shiftForm.name}
                onChange={(e) => {
                  setShiftForm({ ...shiftForm, name: e.target.value });
                  if (shiftErrors.name) setShiftErrors((prev) => { const n = { ...prev }; delete n.name; return n; });
                }}
                placeholder="e.g. Morning, Evening, Night"
                className={`h-9 text-[13px] rounded-lg ${shiftErrors.name ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {shiftErrors.name && <p className="text-[10px] text-red-500 mt-0.5">{shiftErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Start Time *</Label>
                <Input
                  type="time"
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">End Time *</Label>
                <Input
                  type="time"
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>

            {/* Existing shifts list when creating */}
            {!editingShift && shifts.length > 0 && (
              <div>
                <p className="text-[11px] font-medium text-slate-500 mb-1.5">Existing Shifts</p>
                <div className="space-y-1">
                  {shifts.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-slate-50 rounded px-2.5 py-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-slate-400" />
                        <span className="text-[12px] font-medium text-slate-700">{s.name}</span>
                        <span className="text-[10px] text-slate-400">
                          {s.startTime} - {s.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => openEditShift(s)}
                          className="h-6 w-6 rounded flex items-center justify-center text-amber-600 hover:bg-amber-50"
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteShift(s.id)}
                          className="h-6 w-6 rounded flex items-center justify-center text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setShiftDialogOpen(false)}
                className="h-9 text-[13px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveShift}
                className="h-9 text-[13px] rounded-lg bg-purple-600 hover:bg-purple-700 text-white"
              >
                {editingShift ? "Update Shift" : "Create Shift"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== MANAGE SHIFT ASSIGNMENTS DIALOG ===== */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Manage Shift Assignments</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {/* Assign new */}
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Employee</Label>
                <Select value={assignShiftEmp} onValueChange={(v) => setAssignShiftEmp(v ?? "")}>
                  <SelectTrigger className="h-9 text-[13px] rounded-lg">
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeList.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="text-[13px]">
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Shift</Label>
                <Select value={assignShiftId} onValueChange={(v) => setAssignShiftId(v ?? "")}>
                  <SelectTrigger className="h-9 text-[13px] rounded-lg">
                    <SelectValue placeholder="Select Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-[13px]">
                        {s.name} ({s.startTime}-{s.endTime})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleAssignShift}
                disabled={!assignShiftEmp || !assignShiftId}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Assign
              </Button>
            </div>

            {/* Current assignments */}
            <div>
              <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                Current Assignments ({assignments.length})
              </p>
              <div className="space-y-1 max-h-[250px] overflow-y-auto">
                {assignments.length === 0 && (
                  <p className="text-[11px] text-slate-400 text-center py-3">No assignments yet</p>
                )}
                {assignments.map((a) => (
                  <div
                    key={a.employeeId}
                    className="flex items-center justify-between bg-slate-50 rounded px-2.5 py-2"
                  >
                    <div>
                      <p className="text-[12px] font-medium text-slate-700">{a.employeeName}</p>
                      <p className="text-[10px] text-slate-400">{a.shiftName}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveAssignment(a.employeeId)}
                      className="h-6 w-6 rounded flex items-center justify-center text-red-500 hover:bg-red-50"
                      title="Remove"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* ===== ROSTER / ROTATION DIALOG ===== */}
      <Dialog open={rosterDialogOpen} onOpenChange={setRosterDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Shift Roster</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[12px] text-slate-500">
              Weekly rotation schedule for all assigned employees.
            </p>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-2 px-2.5 font-medium text-slate-500">Employee</th>
                    {DAYS_OF_WEEK.map((d) => (
                      <th key={d} className="text-center py-2 px-1.5 font-medium text-slate-500">
                        {d}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-4 text-slate-400 text-[11px]">
                        No shift assignments configured
                      </td>
                    </tr>
                  )}
                  {assignments.map((a) => {
                    const empWeekOff = weekOffEntries.find(
                      (w) => w.employeeId === a.employeeId
                    );
                    return (
                      <tr key={a.employeeId} className="hover:bg-slate-50/50">
                        <td className="py-2 px-2.5 font-medium text-slate-700">
                          {a.employeeName}
                        </td>
                        {DAYS_OF_WEEK.map((d) => {
                          const isOff = empWeekOff?.daySet.has(d);
                          return (
                            <td key={d} className="text-center py-2 px-1.5">
                              {isOff ? (
                                <span className="text-[9px] bg-red-100 text-red-600 px-1 py-0.5 rounded font-medium">
                                  OFF
                                </span>
                              ) : (
                                <span className="text-[9px] bg-green-100 text-green-700 px-1 py-0.5 rounded font-medium">
                                  {a.shiftName}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* ===== EDIT WEEK OFF DIALOG ===== */}
      <Dialog open={editWeekOffOpen} onOpenChange={setEditWeekOffOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              Edit Week Off - {editWeekOffTarget?.employeeName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="flex gap-0.5">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  className={`flex-1 py-1.5 text-[11px] font-medium rounded transition-colors ${
                    editWeekOffDays.has(day)
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                  onClick={() =>
                    setEditWeekOffDays((prev) => {
                      const next = new Set(prev);
                      if (next.has(day)) next.delete(day);
                      else next.add(day);
                      return next;
                    })
                  }
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setEditWeekOffOpen(false)}
                className="h-9 text-[13px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditWeekOff}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE WEEK OFF DIALOG ===== */}
      <Dialog open={deleteWeekOffOpen} onOpenChange={setDeleteWeekOffOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Week Off</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Remove week off configuration for{" "}
              <span className="font-semibold">{deleteWeekOffTarget?.employeeName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteWeekOffOpen(false)}
                className="h-9 text-[13px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteWeekOff}
                className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== ADD LEAVE DIALOG ===== */}
      <Dialog open={addLeaveOpen} onOpenChange={setAddLeaveOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Employee *</Label>
              <Select
                value={addLeaveForm.employeeName}
                onValueChange={(v) => {
                  setAddLeaveForm({ ...addLeaveForm, employeeName: v ?? "" });
                  if (addLeaveErrors.employeeName) setAddLeaveErrors((prev) => { const n = { ...prev }; delete n.employeeName; return n; });
                }}
              >
                <SelectTrigger className={`h-9 text-[13px] rounded-lg ${addLeaveErrors.employeeName ? "border-red-400 ring-1 ring-red-200" : ""}`}>
                  <SelectValue placeholder="Select Employee" />
                </SelectTrigger>
                <SelectContent>
                  {employeeList.map((emp) => (
                    <SelectItem
                      key={emp.id}
                      value={`${emp.firstName} ${emp.lastName}`}
                      className="text-[13px]"
                    >
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {addLeaveErrors.employeeName && <p className="text-[10px] text-red-500 mt-0.5">{addLeaveErrors.employeeName}</p>}
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Leave Type *</Label>
              <Select
                value={addLeaveForm.type}
                onValueChange={(v) => setAddLeaveForm({ ...addLeaveForm, type: v ?? "Sick Leave" })}
              >
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick Leave" className="text-[13px]">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave" className="text-[13px]">Personal Leave</SelectItem>
                  <SelectItem value="Emergency Leave" className="text-[13px]">Emergency Leave</SelectItem>
                  <SelectItem value="Casual Leave" className="text-[13px]">Casual Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">From *</Label>
                <Input
                  type="date"
                  value={addLeaveForm.dateFrom}
                  onChange={(e) => {
                    setAddLeaveForm({ ...addLeaveForm, dateFrom: e.target.value });
                    if (addLeaveErrors.dateFrom) setAddLeaveErrors((prev) => { const n = { ...prev }; delete n.dateFrom; return n; });
                  }}
                  className={`h-9 text-[13px] rounded-lg ${addLeaveErrors.dateFrom ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {addLeaveErrors.dateFrom && <p className="text-[10px] text-red-500 mt-0.5">{addLeaveErrors.dateFrom}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">To *</Label>
                <Input
                  type="date"
                  value={addLeaveForm.dateTo}
                  onChange={(e) => {
                    setAddLeaveForm({ ...addLeaveForm, dateTo: e.target.value });
                    if (addLeaveErrors.dateTo) setAddLeaveErrors((prev) => { const n = { ...prev }; delete n.dateTo; return n; });
                  }}
                  className={`h-9 text-[13px] rounded-lg ${addLeaveErrors.dateTo ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {addLeaveErrors.dateTo && <p className="text-[10px] text-red-500 mt-0.5">{addLeaveErrors.dateTo}</p>}
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Reason</Label>
              <textarea
                value={addLeaveForm.reason}
                onChange={(e) => setAddLeaveForm({ ...addLeaveForm, reason: e.target.value })}
                placeholder="Optional reason..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => { setAddLeaveOpen(false); setAddLeaveErrors({}); }}
                className="h-9 text-[13px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLeave}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Submit Leave
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT LEAVE DIALOG ===== */}
      <Dialog open={editLeaveOpen} onOpenChange={setEditLeaveOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              Edit Leave - {editLeaveTarget?.employeeName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Leave Type</Label>
              <Select
                value={editLeaveForm.type}
                onValueChange={(v) => setEditLeaveForm({ ...editLeaveForm, type: v ?? "" })}
              >
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sick Leave" className="text-[13px]">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave" className="text-[13px]">Personal Leave</SelectItem>
                  <SelectItem value="Emergency Leave" className="text-[13px]">Emergency Leave</SelectItem>
                  <SelectItem value="Casual Leave" className="text-[13px]">Casual Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">From</Label>
                <Input
                  type="date"
                  value={editLeaveForm.dateFrom}
                  onChange={(e) => setEditLeaveForm({ ...editLeaveForm, dateFrom: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">To</Label>
                <Input
                  type="date"
                  value={editLeaveForm.dateTo}
                  onChange={(e) => setEditLeaveForm({ ...editLeaveForm, dateTo: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Reason</Label>
              <textarea
                value={editLeaveForm.reason}
                onChange={(e) => setEditLeaveForm({ ...editLeaveForm, reason: e.target.value })}
                rows={2}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]"
              />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
              <Select
                value={editLeaveForm.status}
                onValueChange={(v) =>
                  setEditLeaveForm({ ...editLeaveForm, status: (v ?? "Pending") as LeaveRequest["status"] })
                }
              >
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending" className="text-[13px]">Pending</SelectItem>
                  <SelectItem value="Approved" className="text-[13px]">Approved</SelectItem>
                  <SelectItem value="Rejected" className="text-[13px]">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setEditLeaveOpen(false)}
                className="h-9 text-[13px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditLeave}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Leave
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE LEAVE DIALOG ===== */}
      <Dialog open={deleteLeaveOpen} onOpenChange={setDeleteLeaveOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Leave Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Delete leave request for{" "}
              <span className="font-semibold">{deleteLeaveTarget?.employeeName}</span>{" "}
              ({deleteLeaveTarget?.dateFrom} to {deleteLeaveTarget?.dateTo})?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeleteLeaveOpen(false)}
                className="h-9 text-[13px] rounded-lg"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteLeave}
                className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
