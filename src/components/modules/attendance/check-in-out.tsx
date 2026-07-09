"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  LogOut,
  Clock,
  Search,
  Timer,
  Shield,
  Users,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_EMPLOYEES } from "./mock-data";

interface AttendanceStatus {
  isCheckedIn: boolean;
  activeSession: {
    id: string;
    checkIn: string;
    hoursWorked: number;
    geoLat: string | null;
    geoLng: string | null;
  } | null;
  cooldown: {
    active: boolean;
    until: string | null;
    remainingMinutes: number;
  };
}

interface CheckOutResponse {
  hoursWorked: number;
  shiftCategory: "single" | "double" | "triple";
  allowedShifts: string[];
  cooldownUntil: string | null;
}

interface EmpWithStatus {
  id: string;
  empId: string;
  firstName: string;
  lastName: string;
  designation: string;
  department: string;
  status: AttendanceStatus | null;
}

const SHIFT_LABELS: Record<string, string> = {
  G: "General (G)",
  A: "Morning (A)",
  B: "Afternoon (B)",
  C: "Night (C)",
  AB: "Double A+B",
  BC: "Double B+C",
  AC: "Double A+C",
  ABC: "Triple A+B+C",
};

export function CheckInOut() {
  const [employeeList, setEmployeeList] = useState(MOCK_EMPLOYEES);
  const [statusMap, setStatusMap] = useState<Record<string, AttendanceStatus>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [statusLoading, setStatusLoading] = useState(true);

  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [checkOutData, setCheckOutData] = useState<CheckOutResponse | null>(null);
  const [selectedShift, setSelectedShift] = useState("");

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

  const fetchAllStatuses = useCallback(async (emps: typeof MOCK_EMPLOYEES) => {
    setStatusLoading(true);
    const results: Record<string, AttendanceStatus> = {};
    await Promise.all(
      emps.map(async (emp) => {
        try {
          const res = await fetch(`/api/v1/attendance/status?employee_id=${emp.id}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data) results[emp.id] = json.data;
          }
        } catch {}
      })
    );
    setStatusMap(results);
    setStatusLoading(false);
  }, []);

  useEffect(() => {
    if (employeeList.length > 0) fetchAllStatuses(employeeList);
  }, [employeeList, fetchAllStatuses]);

  const captureGeo = useCallback((): Promise<{ lat: string; lng: string } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude.toFixed(7), lng: pos.coords.longitude.toFixed(7) }),
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  const handleCheckIn = async (empId: string) => {
    setLoadingIds((prev) => new Set(prev).add(empId));
    const coords = await captureGeo();
    try {
      const res = await fetch("/api/v1/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId, source: "manual", geoLat: coords?.lat, geoLng: coords?.lng }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || json.error || "Check-in failed");
      } else {
        const emp = employeeList.find((e) => e.id === empId);
        toast.success(`${emp?.firstName} ${emp?.lastName} checked in`);
        const statusRes = await fetch(`/api/v1/attendance/status?employee_id=${empId}`);
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          if (statusJson.data) setStatusMap((prev) => ({ ...prev, [empId]: statusJson.data }));
        }
      }
    } catch {
      toast.error("Network error during check-in");
    }
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(empId); return next; });
  };

  const handleCheckOut = async (empId: string) => {
    setLoadingIds((prev) => new Set(prev).add(empId));
    try {
      const res = await fetch("/api/v1/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: empId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error?.message || json.error || "Check-out failed");
      } else {
        const data = json.data as CheckOutResponse;
        const emp = employeeList.find((e) => e.id === empId);
        if (data.shiftCategory === "triple") {
          toast.success(`${emp?.firstName} ${emp?.lastName} checked out — ${data.hoursWorked.toFixed(1)}h (Triple shift)`);
        } else if (data.shiftCategory === "double") {
          setCheckOutData(data);
          setSelectedShift("");
          setShiftModalOpen(true);
          toast.success(`${emp?.firstName} ${emp?.lastName} checked out — ${data.hoursWorked.toFixed(1)}h (Double shift)`);
        } else {
          toast.success(`${emp?.firstName} ${emp?.lastName} checked out — ${data.hoursWorked.toFixed(1)}h`);
        }
        const statusRes = await fetch(`/api/v1/attendance/status?employee_id=${empId}`);
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          if (statusJson.data) setStatusMap((prev) => ({ ...prev, [empId]: statusJson.data }));
        }
      }
    } catch {
      toast.error("Network error during check-out");
    }
    setLoadingIds((prev) => { const next = new Set(prev); next.delete(empId); return next; });
  };

  const filtered = useMemo(() => {
    let result = employeeList;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.empId.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    if (filter === "in") {
      result = result.filter((e) => statusMap[e.id]?.isCheckedIn);
    } else if (filter === "out") {
      result = result.filter((e) => !statusMap[e.id]?.isCheckedIn);
    }
    return result;
  }, [employeeList, search, filter, statusMap]);

  const checkedInCount = employeeList.filter((e) => statusMap[e.id]?.isCheckedIn).length;
  const checkedOutCount = employeeList.length - checkedInCount;

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-semibold text-slate-800">
        Check In / Check Out
      </h3>

      {/* Summary Pills */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <span>{employeeList.length} total</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
          <UserCheck className="h-3.5 w-3.5" />
          <span>{checkedInCount} checked in</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
          <UserX className="h-3.5 w-3.5" />
          <span>{checkedOutCount} not checked in</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by name, ID, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-[12px] pl-8 rounded-lg"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "in", "out"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${
                filter === f
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "text-slate-500 hover:bg-slate-50 border border-transparent"
              }`}
            >
              {f === "all" ? "All" : f === "in" ? "Checked In" : "Not In"}
            </button>
          ))}
        </div>
      </div>

      {/* Employee Grid */}
      {statusLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
            <span className="text-[11px] text-slate-400">Loading employee statuses...</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((emp) => {
            const st = statusMap[emp.id];
            const isIn = st?.isCheckedIn ?? false;
            const isCooldown = st?.cooldown?.active ?? false;
            const isLoading = loadingIds.has(emp.id);

            return (
              <div
                key={emp.id}
                className={`rounded-xl border p-3.5 space-y-2.5 transition-colors ${
                  isIn
                    ? "border-emerald-200 bg-emerald-50/40"
                    : isCooldown
                    ? "border-amber-200 bg-amber-50/30"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-slate-800 truncate">
                      {emp.firstName} {emp.lastName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {emp.designation || emp.department || emp.empId}
                    </p>
                  </div>
                  <Badge
                    className={`text-[9px] px-1.5 py-0 h-[16px] shrink-0 ${
                      isIn
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : isCooldown
                        ? "bg-amber-100 text-amber-700 border-amber-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                    }`}
                  >
                    {isIn ? "IN" : isCooldown ? "REST" : "OUT"}
                  </Badge>
                </div>

                {isIn && st?.activeSession && (
                  <div className="flex items-center gap-3 text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {new Date(st.activeSession.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Timer className="h-2.5 w-2.5" />
                      {st.activeSession.hoursWorked.toFixed(1)}h
                    </span>
                  </div>
                )}

                {isCooldown && (
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-600">
                    <Shield className="h-2.5 w-2.5" />
                    <span>8h rest cooldown active</span>
                  </div>
                )}

                <div>
                  {isIn ? (
                    <Button
                      onClick={() => handleCheckOut(emp.id)}
                      disabled={isLoading}
                      className="w-full h-7 text-[11px] bg-red-600 hover:bg-red-700 text-white gap-1"
                    >
                      <LogOut className="h-3 w-3" />
                      {isLoading ? "..." : "Check Out"}
                    </Button>
                  ) : isCooldown ? (
                    <Button
                      disabled
                      className="w-full h-7 text-[11px] bg-slate-200 text-slate-400 gap-1 cursor-not-allowed"
                    >
                      <Shield className="h-3 w-3" />
                      Cooldown
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleCheckIn(emp.id)}
                      disabled={isLoading}
                      className="w-full h-7 text-[11px] bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                    >
                      <LogIn className="h-3 w-3" />
                      {isLoading ? "..." : "Check In"}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!statusLoading && filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[12px] text-slate-400">No employees match your search.</p>
        </div>
      )}

      {/* Shift Selection Modal */}
      <Dialog open={shiftModalOpen} onOpenChange={setShiftModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">
              Shift Record — {checkOutData?.hoursWorked.toFixed(1)}h Worked
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[12px] text-slate-600">
              {checkOutData?.shiftCategory === "single"
                ? "Single shift detected (up to 12 hours). Select the shift worked:"
                : "Double shift detected (12-18 hours). Select the shift combination:"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {checkOutData?.allowedShifts.map((shift) => (
                <button
                  key={shift}
                  onClick={() => setSelectedShift(shift)}
                  className={`rounded-md border px-3 py-2 text-[12px] font-medium transition-colors ${
                    selectedShift === shift
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {SHIFT_LABELS[shift] || shift}
                </button>
              ))}
            </div>
            {checkOutData?.cooldownUntil && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-700">
                <strong>Note:</strong> 8-hour mandatory rest cooldown has been activated.
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShiftModalOpen(false)} className="h-9 text-[13px] rounded-lg">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
