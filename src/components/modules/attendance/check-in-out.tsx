"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  LogIn,
  LogOut,
  Clock,
  MapPin,
  AlertTriangle,
  Timer,
  Shield,
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
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [status, setStatus] = useState<AttendanceStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: string; lng: string } | null>(null);
  const [cooldownTimer, setCooldownTimer] = useState("");

  // Shift selection modal state
  const [shiftModalOpen, setShiftModalOpen] = useState(false);
  const [checkOutData, setCheckOutData] = useState<CheckOutResponse | null>(null);
  const [selectedShift, setSelectedShift] = useState("");

  // Load employees from API
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

  // Fetch attendance status when employee changes
  const fetchStatus = useCallback(async (empId: string) => {
    if (!empId) {
      setStatus(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/attendance/status?employee_id=${empId}`);
      if (res.ok) {
        const json = await res.json();
        setStatus(json.data);
      }
    } catch {
      // Silently fail — status just won't display
    }
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchStatus(selectedEmployee);
    } else {
      setStatus(null);
    }
  }, [selectedEmployee, fetchStatus]);

  // Cooldown countdown timer
  useEffect(() => {
    if (!status?.cooldown?.active || !status.cooldown.until) {
      setCooldownTimer("");
      return;
    }

    const update = () => {
      const remaining = new Date(status.cooldown.until!).getTime() - Date.now();
      if (remaining <= 0) {
        setCooldownTimer("");
        fetchStatus(selectedEmployee);
        return;
      }
      const hrs = Math.floor(remaining / (1000 * 60 * 60));
      const mins = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remaining % (1000 * 60)) / 1000);
      setCooldownTimer(
        `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [status?.cooldown?.active, status?.cooldown?.until, selectedEmployee, fetchStatus]);

  // Capture geolocation
  const captureGeo = useCallback((): Promise<{ lat: string; lng: string } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude.toFixed(7),
            lng: pos.coords.longitude.toFixed(7),
          };
          setGeoCoords(coords);
          setGeoLoading(false);
          resolve(coords);
        },
        () => {
          setGeoLoading(false);
          resolve(null);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }, []);

  // Check In
  const handleCheckIn = async () => {
    if (!selectedEmployee) return;
    setLoading(true);

    // Capture geo coordinates
    const coords = await captureGeo();

    try {
      const res = await fetch("/api/v1/attendance/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee,
          source: "manual",
          geoLat: coords?.lat,
          geoLng: coords?.lng,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error?.message || json.error || "Check-in failed";
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success("Checked in successfully");
      await fetchStatus(selectedEmployee);
    } catch {
      toast.error("Network error during check-in");
    }
    setLoading(false);
  };

  // Initiate Check Out (first call without shift to get hours/shift info)
  const handleCheckOutInitiate = async () => {
    if (!selectedEmployee) return;
    setLoading(true);

    try {
      const res = await fetch("/api/v1/attendance/check-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: selectedEmployee }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error?.message || json.error || "Check-out failed";
        toast.error(msg);
        setLoading(false);
        return;
      }

      const data = json.data as CheckOutResponse;

      // For triple shifts, auto-complete (no selection needed)
      if (data.shiftCategory === "triple") {
        toast.success(
          `Checked out — ${data.hoursWorked.toFixed(1)}h worked (Triple shift ABC). 8h cooldown active.`
        );
        await fetchStatus(selectedEmployee);
        setLoading(false);
        return;
      }

      // For single/double, show shift selection modal
      // But the checkout already happened — the modal is for display / confirmation
      setCheckOutData(data);
      setSelectedShift("");
      setShiftModalOpen(true);
      toast.success(
        `Checked out — ${data.hoursWorked.toFixed(1)}h worked (${data.shiftCategory} shift)${data.cooldownUntil ? ". 8h cooldown active." : ""}`
      );
      await fetchStatus(selectedEmployee);
    } catch {
      toast.error("Network error during check-out");
    }
    setLoading(false);
  };

  const selectedEmp = employeeList.find((e) => e.id === selectedEmployee);

  return (
    <div className="space-y-4">
      <h3 className="text-[13px] font-semibold text-slate-800">
        Check In / Check Out
      </h3>

      <div className="max-w-md space-y-4">
        {/* Employee Selection */}
        <div>
          <label className="text-[12px] text-slate-600 mb-1.5 block">
            Select Employee
          </label>
          <Select
            value={selectedEmployee}
            onValueChange={(v) => setSelectedEmployee(v ?? "")}
          >
            <SelectTrigger className="h-9 text-[13px] rounded-lg">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employeeList.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="text-[13px]">
                  {emp.firstName} {emp.lastName}{" "}
                  <span className="text-slate-400">({emp.empId})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Display */}
        {selectedEmployee && status && (
          <div className="rounded-md border border-slate-200 bg-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-medium text-slate-700">
                {selectedEmp?.firstName} {selectedEmp?.lastName}
              </p>
              <Badge
                className={`text-[10px] px-1.5 py-0 h-[18px] ${
                  status.isCheckedIn
                    ? "bg-emerald-100 text-teal-700 border-emerald-200"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                }`}
              >
                {status.isCheckedIn ? "Checked In" : "Checked Out"}
              </Badge>
            </div>

            {/* Active Session Info */}
            {status.isCheckedIn && status.activeSession && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    Checked in at{" "}
                    {new Date(status.activeSession.checkIn).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Timer className="h-3 w-3" />
                  <span>
                    {status.activeSession.hoursWorked.toFixed(1)}h working
                  </span>
                </div>
                {status.activeSession.geoLat && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    <span>
                      Location: {status.activeSession.geoLat},{" "}
                      {status.activeSession.geoLng}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Cooldown Display */}
            {status.cooldown.active && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2.5 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-amber-600" />
                  <p className="text-[11px] font-medium text-amber-800">
                    Rest Cooldown Active
                  </p>
                </div>
                <p className="text-[10px] text-amber-600">
                  Multi-shift cooldown (8h mandatory rest). Check-in blocked
                  until cooldown expires.
                </p>
                {cooldownTimer && (
                  <p className="text-[16px] font-mono font-bold text-amber-700 text-center pt-1">
                    {cooldownTimer}
                  </p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-1">
              {!status.isCheckedIn && !status.cooldown.active && (
                <Button
                  onClick={handleCheckIn}
                  disabled={loading || geoLoading}
                  className="w-full h-9 text-[12px] bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  {geoLoading ? "Capturing Location..." : loading ? "Checking In..." : "Check In"}
                </Button>
              )}
              {!status.isCheckedIn && status.cooldown.active && (
                <Button
                  disabled
                  className="w-full h-9 text-[12px] bg-slate-300 text-slate-500 gap-1.5 cursor-not-allowed"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Cooldown Active — Check-in Blocked
                </Button>
              )}
              {status.isCheckedIn && (
                <Button
                  onClick={handleCheckOutInitiate}
                  disabled={loading}
                  className="w-full h-9 text-[12px] bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {loading ? "Checking Out..." : "Check Out"}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {selectedEmployee && !status && (
          <div className="rounded-md border border-slate-200 bg-white p-4 text-center">
            <p className="text-[11px] text-slate-400">
              Loading attendance status...
            </p>
          </div>
        )}
      </div>

      {/* Shift Selection Modal (shown after checkout) */}
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
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  {SHIFT_LABELS[shift] || shift}
                </button>
              ))}
            </div>

            {checkOutData?.cooldownUntil && (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-[11px] text-amber-700">
                <strong>Note:</strong> 8-hour mandatory rest cooldown has been
                activated for this multi-shift session.
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setShiftModalOpen(false)}
                className="h-9 text-[13px] rounded-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
