"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, Camera, UserCheck, LogIn, LogOut, Search, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { MOCK_EMPLOYEES, MOCK_RECENT_SCANS, type RecentScan } from "./mock-data";

export function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<RecentScan[]>(MOCK_RECENT_SCANS);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [checkAction, setCheckAction] = useState<"in" | "out">("in");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScannedText, setLastScannedText] = useState("");
  const [scanError, setScanError] = useState("");
  const [manualErrors, setManualErrors] = useState<Record<string, string>>({});

  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  // Start real camera scanner
  const startScanning = useCallback(async () => {
    setScanError("");
    setScanning(true);

    try {
      // Dynamic import to avoid SSR issues
      const { Html5Qrcode } = await import("html5-qrcode");

      // Small delay to let the DOM render the container
      await new Promise((r) => setTimeout(r, 100));

      const scannerId = "qr-reader";
      const scannerEl = document.getElementById(scannerId);
      if (!scannerEl) {
        setScanError("Scanner container not found");
        setScanning(false);
        return;
      }

      const html5QrCode = new Html5Qrcode(scannerId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.0,
        },
        (decodedText: string) => {
          // QR code scanned successfully
          handleQRResult(decodedText);
          // Stop after successful scan
          html5QrCode.stop().catch(() => {});
          html5QrCodeRef.current = null;
          setScanning(false);
        },
        () => {
          // QR code not detected in this frame — ignore
        }
      );
    } catch (err: any) {
      console.error("Camera error:", err);
      if (err?.message?.includes("NotAllowedError") || err?.name === "NotAllowedError") {
        setScanError("Camera permission denied. Please allow camera access and try again.");
      } else if (err?.message?.includes("NotFoundError") || err?.name === "NotFoundError") {
        setScanError("No camera found on this device.");
      } else {
        setScanError(`Camera error: ${err?.message || "Unknown error"}`);
      }
      setScanning(false);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setScanning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(() => {});
      }
    };
  }, []);

  // Process scanned QR code
  const handleQRResult = useCallback((text: string) => {
    setLastScannedText(text);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Try to match to an employee by empId or name in the QR text
    const matchedEmp = MOCK_EMPLOYEES.find(
      (e) =>
        text.includes(e.empId) ||
        text.toLowerCase().includes(e.firstName.toLowerCase()) ||
        text.toLowerCase().includes(`${e.firstName} ${e.lastName}`.toLowerCase())
    );

    const newScan: RecentScan = {
      employeeName: matchedEmp
        ? `${matchedEmp.firstName} ${matchedEmp.lastName}`
        : `Unknown (${text.slice(0, 30)})`,
      empId: matchedEmp?.empId || "SCAN",
      designation: matchedEmp?.designation || "—",
      checkIn: timeStr,
      status: "Checked In",
    };

    setRecentScans((prev) => [newScan, ...prev]);
    toast.success(`${newScan.employeeName} checked in`);
  }, []);

  // Manual check-in handler
  const handleManualCheckIn = useCallback(() => {
    if (!selectedEmployeeId) {
      setManualErrors({ employee: "Please select an employee" });
      return;
    }
    setManualErrors({});
    const emp = MOCK_EMPLOYEES.find((e) => e.id === selectedEmployeeId);
    if (!emp) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const newScan: RecentScan = {
      employeeName: `${emp.firstName} ${emp.lastName}`,
      empId: emp.empId,
      designation: emp.designation,
      checkIn: timeStr,
      status: checkAction === "in" ? "Checked In" : "Checked Out",
    };

    setRecentScans((prev) => [newScan, ...prev]);
    setShowManualDialog(false);
    setSelectedEmployeeId("");
    setCheckAction("in");
    toast.success(checkAction === "in" ? "Checked in successfully" : "Checked out successfully");
  }, [selectedEmployeeId, checkAction]);

  const filteredScans = searchQuery
    ? recentScans.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.empId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentScans;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 rounded-lg">
            <QrCode className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">QR Attendance Scanner</h3>
            <p className="text-[11px] text-slate-400">Scan employee QR codes for attendance tracking</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="h-8 text-[12px] gap-1.5 rounded-lg"
          onClick={() => setShowManualDialog(true)}
        >
          <UserCheck className="h-3.5 w-3.5" />
          Manual Check-in
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Scanner Area */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-[13px] font-semibold text-slate-800 mb-4">QR Code Scanner</h4>

          {scanning ? (
            <div className="space-y-3">
              {/* Live camera feed renders here */}
              <div
                id="qr-reader"
                ref={scannerRef}
                className="w-full max-w-[300px] mx-auto rounded-lg overflow-hidden border-2 border-emerald-300"
              />
              <div className="flex items-center justify-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <p className="text-[12px] text-emerald-600 font-medium">Camera active — point at QR code</p>
              </div>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="h-8 text-[12px] rounded-lg"
                  onClick={stopScanning}
                >
                  Stop Scanning
                </Button>
              </div>
            </div>
          ) : (
            <div className="aspect-square max-w-[280px] mx-auto bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200">
              <div className="text-center space-y-3 p-6">
                <div className="mx-auto w-14 h-14 bg-white rounded-xl border border-slate-200 flex items-center justify-center shadow-sm">
                  <Camera className="h-7 w-7 text-slate-400" />
                </div>
                <p className="text-[12px] text-slate-500">Ready to scan employee QR codes</p>
                <Button
                  className="h-9 text-[13px] px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
                  onClick={startScanning}
                >
                  <Camera className="h-4 w-4 mr-1.5" />
                  Start Scanning
                </Button>
              </div>
            </div>
          )}

          {/* Error message */}
          {scanError && (
            <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] text-red-700 font-medium">Scanner Error</p>
                <p className="text-[11px] text-red-600 mt-0.5">{scanError}</p>
              </div>
            </div>
          )}

          {/* Last scanned result */}
          {lastScannedText && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <p className="text-[11px] text-emerald-700 font-medium">Last Scanned:</p>
              <p className="text-[12px] text-emerald-800 font-mono mt-0.5 break-all">{lastScannedText}</p>
            </div>
          )}
        </div>

        {/* Recent Log */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[13px] font-semibold text-slate-800">Recent Attendance</h4>
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {recentScans.length} entries
            </span>
          </div>

          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 text-[12px] bg-white focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100"
            />
          </div>

          <div className="space-y-2 max-h-[350px] overflow-y-auto">
            {filteredScans.length === 0 ? (
              <p className="text-[12px] text-slate-400 text-center py-8">No attendance records found</p>
            ) : (
              filteredScans.map((scan, index) => (
                <div
                  key={`${scan.empId}-${index}`}
                  className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[12px] font-semibold text-slate-800">{scan.employeeName}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        scan.status === "Checked In"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {scan.status === "Checked In" ? (
                        <LogIn className="h-2.5 w-2.5" />
                      ) : (
                        <LogOut className="h-2.5 w-2.5" />
                      )}
                      {scan.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>{scan.empId}</span>
                    <span>{scan.designation}</span>
                    <span className="ml-auto">{scan.checkIn || "—"}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Manual Check-in Dialog */}
      <Dialog open={showManualDialog} onOpenChange={setShowManualDialog}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Manual Check-in / Check-out</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-[12px] text-slate-600 mb-1.5 block">Employee *</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => {
                  setSelectedEmployeeId(e.target.value);
                  if (manualErrors.employee) setManualErrors({});
                }}
                className={`w-full h-9 rounded-lg border bg-white px-3 text-[13px] focus:outline-none focus:border-emerald-300 focus:ring-1 focus:ring-emerald-100 ${manualErrors.employee ? "border-red-400 ring-1 ring-red-200" : "border-slate-200"}`}
              >
                <option value="">Select employee...</option>
                {MOCK_EMPLOYEES.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName} ({emp.empId})
                  </option>
                ))}
              </select>
              {manualErrors.employee && <p className="text-[10px] text-red-500 mt-0.5">{manualErrors.employee}</p>}
            </div>

            <div>
              <label className="text-[12px] text-slate-600 mb-1.5 block">Action</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCheckAction("in")}
                  className={`flex-1 h-9 rounded-lg border text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    checkAction === "in"
                      ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <LogIn className="h-4 w-4" />
                  Check In
                </button>
                <button
                  onClick={() => setCheckAction("out")}
                  className={`flex-1 h-9 rounded-lg border text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    checkAction === "out"
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <LogOut className="h-4 w-4" />
                  Check Out
                </button>
              </div>
            </div>

            {selectedEmployeeId && (
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[12px] text-slate-600">
                  {(() => {
                    const emp = MOCK_EMPLOYEES.find((e) => e.id === selectedEmployeeId);
                    return emp ? `${emp.firstName} ${emp.lastName} — ${emp.designation}` : "";
                  })()}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                className="h-9 text-[13px] rounded-lg"
                onClick={() => {
                  setShowManualDialog(false);
                  setSelectedEmployeeId("");
                  setManualErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                className={`h-9 text-[13px] rounded-lg text-white ${
                  checkAction === "in"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
                onClick={handleManualCheckIn}
                disabled={!selectedEmployeeId}
              >
                {checkAction === "in" ? (
                  <><LogIn className="h-4 w-4 mr-1.5" /> Confirm Check In</>
                ) : (
                  <><LogOut className="h-4 w-4 mr-1.5" /> Confirm Check Out</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
