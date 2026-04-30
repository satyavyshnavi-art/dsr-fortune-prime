"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  Download,
  Search,
  CheckCircle2,
  ArrowUpDown,
  QrCode,
} from "lucide-react";
import { toast } from "sonner";
import { MOCK_EMPLOYEES } from "./mock-data";
import type { Employee } from "./mock-data";
import { exportCSV, exportPDF } from "@/lib/export";

const SHIFTS = ["Morning", "Evening", "Night", "Flexible"] as const;
type Shift = (typeof SHIFTS)[number];

type SortKey = "designation" | "empId" | "name" | "phone" | "smartcard" | "shift";
type SortDir = "asc" | "desc";

export function StaffShift() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showPastStaff, setShowPastStaff] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("empId");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Employees: API with mock fallback
  const [employeeList, setEmployeeList] = useState<Employee[]>(MOCK_EMPLOYEES);

  useEffect(() => {
    fetch("/api/v1/employees")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setEmployeeList(
            data.map((e: Record<string, string | boolean | undefined>) => ({
              id: e.id as string,
              empId: (e.empId || e.emp_id || "") as string,
              firstName: (e.firstName || e.first_name || "") as string,
              lastName: (e.lastName || e.last_name || "") as string,
              designation: (e.designation || "") as string,
              department: (e.department || "") as string,
              phone: (e.phone || "") as string,
              email: (e.email || "") as string,
              dateOfBirth: (e.dateOfBirth || e.date_of_birth || "") as string,
              qrConfigured: false,
              shift: e.shift as string | undefined,
              smartcardId: e.smartcardId as string | undefined,
              isActive: e.isActive !== false,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Local state for shifts and smartcard toggles (keyed by employee id)
  const [shiftOverrides, setShiftOverrides] = useState<Record<string, string>>(
    () => {
      const map: Record<string, string> = {};
      MOCK_EMPLOYEES.forEach((emp) => {
        if (emp.shift) map[emp.id] = emp.shift;
      });
      return map;
    }
  );
  const [smartcardOverrides, setSmartcardOverrides] = useState<
    Record<string, boolean>
  >(() => {
    const map: Record<string, boolean> = {};
    MOCK_EMPLOYEES.forEach((emp) => {
      map[emp.id] = !!emp.smartcardId;
    });
    return map;
  });

  // Sync overrides when employee list changes from API
  useEffect(() => {
    setShiftOverrides((prev) => {
      const map = { ...prev };
      employeeList.forEach((emp) => {
        if (emp.shift && !(emp.id in map)) map[emp.id] = emp.shift;
      });
      return map;
    });
    setSmartcardOverrides((prev) => {
      const map = { ...prev };
      employeeList.forEach((emp) => {
        if (!(emp.id in map)) map[emp.id] = !!emp.smartcardId;
      });
      return map;
    });
  }, [employeeList]);

  const handleShiftChange = useCallback((empId: string, shift: string) => {
    setShiftOverrides((prev) => ({ ...prev, [empId]: shift }));
    toast.success("Shift updated");
  }, []);

  const handleSmartcardToggle = useCallback((empId: string) => {
    setSmartcardOverrides((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
    toast.success("Smartcard status updated");
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (sortKey === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDir("asc");
      }
    },
    [sortKey]
  );

  const filteredEmployees = useMemo(() => {
    let list = employeeList.filter((emp) => {
      // Active/past filter
      const isActive = emp.isActive !== false;
      if (!showPastStaff && !isActive) return false;

      // Search filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      return (
        fullName.includes(q) ||
        emp.designation.toLowerCase().includes(q) ||
        emp.empId.toLowerCase().includes(q)
      );
    });

    // Sort
    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "designation":
          cmp = a.designation.localeCompare(b.designation);
          break;
        case "empId":
          cmp = a.empId.localeCompare(b.empId);
          break;
        case "name": {
          const nameA = `${a.firstName} ${a.lastName}`;
          const nameB = `${b.firstName} ${b.lastName}`;
          cmp = nameA.localeCompare(nameB);
          break;
        }
        case "phone":
          cmp = a.phone.localeCompare(b.phone);
          break;
        case "smartcard": {
          const scA = smartcardOverrides[a.id] ? 1 : 0;
          const scB = smartcardOverrides[b.id] ? 1 : 0;
          cmp = scA - scB;
          break;
        }
        case "shift": {
          const shA = shiftOverrides[a.id] || "";
          const shB = shiftOverrides[b.id] || "";
          cmp = shA.localeCompare(shB);
          break;
        }
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [searchQuery, showPastStaff, sortKey, sortDir, shiftOverrides, smartcardOverrides, employeeList]);

  const SortHeader = ({
    label,
    colKey,
    align = "left",
  }: {
    label: string;
    colKey: SortKey;
    align?: "left" | "center";
  }) => (
    <th
      className={`px-3 py-2 text-${align} text-[10px] font-semibold text-slate-500 uppercase tracking-wider cursor-pointer select-none hover:text-slate-700 transition-colors`}
      onClick={() => handleSort(colKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={`h-2.5 w-2.5 ${
            sortKey === colKey ? "text-blue-500" : "text-slate-300"
          }`}
        />
      </span>
    </th>
  );

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="relative max-w-[240px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search name, EMP ID, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-[12px]"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500">
              Show past staff as well
            </span>
            <Switch
              checked={showPastStaff}
              onCheckedChange={setShowPastStaff}
            />
          </div>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              const rows = filteredEmployees.map((emp: Employee) => ({
                "Role": emp.designation,
                "EMP ID": emp.empId,
                "Name": `${emp.firstName} ${emp.lastName}`,
                "Phone": emp.phone || "-",
                "Shift": shiftOverrides[emp.id] || "Morning",
              }));
              exportPDF(rows, "Staff_Shift_Report", "Staff & Shift Report");
              toast.success("PDF generated");
            }}
          >
            <Download className="h-3 w-3" />
            Download PDF
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              const rows = filteredEmployees.map((emp: Employee) => ({
                "Role": emp.designation,
                "EMP ID": emp.empId,
                "Name": `${emp.firstName} ${emp.lastName}`,
                "Phone": emp.phone || "-",
                "Shift": shiftOverrides[emp.id] || "Morning",
              }));
              exportCSV(rows, "Staff_Shift_Report");
              toast.success("CSV downloaded");
            }}
          >
            <Download className="h-3 w-3" />
            Download CSV
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => toast.info("QR codes downloading...")}
          >
            <QrCode className="h-3 w-3" />
            Download QR
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full table-fixed">
          <colgroup>
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-50/80">
              <SortHeader label="Role" colKey="designation" />
              <SortHeader label="Emp ID" colKey="empId" />
              <SortHeader label="Name" colKey="name" />
              <SortHeader label="Phone" colKey="phone" />
              <SortHeader label="Smartcard" colKey="smartcard" align="center" />
              <SortHeader label="Shift" colKey="shift" />
              <th className="px-3 py-2 text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                BOV
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-[13px] text-slate-400"
                >
                  No employees found
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <StaffRow
                  key={emp.id}
                  emp={emp}
                  shift={shiftOverrides[emp.id] || ""}
                  hasSmartcard={smartcardOverrides[emp.id] ?? false}
                  onShiftChange={handleShiftChange}
                  onSmartcardToggle={handleSmartcardToggle}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-[11px] text-slate-400">
        Showing {filteredEmployees.length} of {employeeList.length} employees
      </div>
    </div>
  );
}

function StaffRow({
  emp,
  shift,
  hasSmartcard,
  onShiftChange,
  onSmartcardToggle,
}: {
  emp: Employee;
  shift: string;
  hasSmartcard: boolean;
  onShiftChange: (empId: string, shift: string) => void;
  onSmartcardToggle: (empId: string) => void;
}) {
  const isInactive = emp.isActive === false;

  return (
    <tr
      className={`border-t border-slate-100 hover:bg-slate-50/50 ${
        isInactive ? "opacity-50" : ""
      }`}
    >
      <td className="px-3 py-2 text-[12px] text-slate-600 truncate">
        {emp.designation}
      </td>
      <td className="px-3 py-2 text-[12px] font-mono text-slate-800">
        {emp.empId}
      </td>
      <td className="px-3 py-2 text-[12px] font-medium text-blue-600 truncate">
        {emp.firstName} {emp.lastName}
        {isInactive && (
          <span className="ml-1.5 text-[10px] text-red-400 font-normal">
            (Past)
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-[12px] text-slate-600">{emp.phone}</td>
      <td className="px-3 py-2 text-center">
        <button
          type="button"
          onClick={() => onSmartcardToggle(emp.id)}
          className="inline-flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
          title={hasSmartcard ? "Has smartcard - click to remove" : "No smartcard - click to add"}
        >
          {hasSmartcard ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <span className="text-[11px] text-slate-300">-</span>
          )}
        </button>
      </td>
      <td className="px-3 py-2">
        <Select
          value={shift || undefined}
          onValueChange={(v) => {
            if (v) onShiftChange(emp.id, v);
          }}
        >
          <SelectTrigger
            size="sm"
            className="h-7 text-[12px] min-w-[120px] border-slate-200"
          >
            <SelectValue placeholder="No Shift Assigned" />
          </SelectTrigger>
          <SelectContent>
            {SHIFTS.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-3 py-2 text-center">
        <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mx-auto" />
      </td>
    </tr>
  );
}
