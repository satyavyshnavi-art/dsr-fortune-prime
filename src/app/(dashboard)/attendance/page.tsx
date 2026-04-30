"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { AlertTriangle } from "lucide-react";
import {
  EmployeeTable,
  ManualEntry,
  AttendanceTab,
  QRScanner,
  StaffShift,
  ShiftView,
  CalendarView,
  BillingView,
  TimesheetView,
} from "@/components/modules/attendance";

const TABS = [
  { value: "employees", label: "Employees" },
  { value: "entry", label: "Entry" },
  { value: "attendance", label: "Attendance" },
  { value: "qr-scanner", label: "QR Scanner" },
  { value: "staff-shift", label: "Staff & Shift" },
  { value: "shift-view", label: "Shift View" },
  { value: "calendar-view", label: "Calendar View" },
  { value: "billing-view", label: "Billing View" },
  { value: "timesheet-view", label: "Timesheet View" },
] as const;

const TAB_CONTENT: Record<string, React.ComponentType> = {
  employees: EmployeeTable,
  entry: ManualEntry,
  attendance: AttendanceTab,
  "qr-scanner": QRScanner,
  "staff-shift": StaffShift,
  "shift-view": ShiftView,
  "calendar-view": CalendarView,
  "billing-view": BillingView,
  "timesheet-view": TimesheetView,
};

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<string>("employees");
  const ActiveComponent = TAB_CONTENT[activeTab];

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Attendance & Staffing" />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-2 flex items-center gap-2">
        <AlertTriangle className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-[11px] text-blue-700">
          <span className="font-semibold">Note:</span> Please add employees first in the
          &quot;Employees&quot; tab, then configure their QR codes.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-0 -mb-px overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`whitespace-nowrap px-3 py-2 text-[12px] font-medium border-b-2 transition-colors ${
                activeTab === tab.value
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
}
