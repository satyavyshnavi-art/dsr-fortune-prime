"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, DataTable, StatusBadge } from "@/components/shared";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, UserPlus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface Enrollment {
  id: string;
  employeeName: string;
  empId: string;
  deviceName: string;
  enrolledAt: string;
  status: "active" | "inactive";
}

const enrollmentColumns: ColumnDef<Enrollment, unknown>[] = [
  {
    accessorKey: "empId",
    header: "Emp ID",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-slate-500">{row.getValue("empId")}</span>
    ),
  },
  {
    accessorKey: "employeeName",
    header: "Employee Name",
  },
  {
    accessorKey: "deviceName",
    header: "Device",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status") as string} />,
  },
  {
    accessorKey: "enrolledAt",
    header: "Enrolled On",
    cell: ({ row }) => {
      const date = new Date(row.getValue("enrolledAt") as string);
      return (
        <span className="text-[11px] text-slate-500">
          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      );
    },
  },
];

export function EnrollmentsTab() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [empId, setEmpId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function handleAddEnrollment() {
    const errs: Record<string, boolean> = {};
    if (!employeeName.trim()) errs.employeeName = true;
    if (!empId.trim()) errs.empId = true;
    if (!deviceName.trim()) errs.deviceName = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newEnrollment: Enrollment = {
      id: crypto.randomUUID(),
      employeeName: employeeName.trim(),
      empId: empId.trim(),
      deviceName: deviceName.trim(),
      enrolledAt: new Date().toISOString(),
      status: "active",
    };

    setEnrollments((prev) => [...prev, newEnrollment]);
    setEmployeeName("");
    setEmpId("");
    setDeviceName("");
    setErrors({});
    setDialogOpen(false);
    toast.success("Employee linked successfully");
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800">Device Enrollments</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {enrollments.length} employee{enrollments.length !== 1 ? "s" : ""} linked
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            render={
              <Button className="h-7 text-[11px] gap-1.5">
                <UserPlus className="h-3 w-3" />
                Link Employee
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-[14px]">Link Employee to Device</DialogTitle>
              <DialogDescription className="text-[11px]">
                Map a device user to an employee record so punches are attributed correctly.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-1">
              <div className="space-y-1">
                <Label htmlFor="emp-id" className="text-[11px]">Employee ID <span className="text-red-500">*</span></Label>
                <Input
                  id="emp-id"
                  placeholder="e.g. EMP-001"
                  value={empId}
                  onChange={(e) => { setEmpId(e.target.value); setErrors((prev) => ({ ...prev, empId: false })); }}
                  className={`h-8 text-[12px] ${errors.empId ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                />
                {errors.empId && <p className="text-[10px] text-red-500 mt-0.5">Employee ID is required</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="emp-name" className="text-[11px]">Employee Name <span className="text-red-500">*</span></Label>
                <Input
                  id="emp-name"
                  placeholder="e.g. Ravi Kumar"
                  value={employeeName}
                  onChange={(e) => { setEmployeeName(e.target.value); setErrors((prev) => ({ ...prev, employeeName: false })); }}
                  className={`h-8 text-[12px] ${errors.employeeName ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                />
                {errors.employeeName && <p className="text-[10px] text-red-500 mt-0.5">Employee name is required</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="device-name" className="text-[11px]">Device Name <span className="text-red-500">*</span></Label>
                <Input
                  id="device-name"
                  placeholder="e.g. Main Gate Reader"
                  value={deviceName}
                  onChange={(e) => { setDeviceName(e.target.value); setErrors((prev) => ({ ...prev, deviceName: false })); }}
                  className={`h-8 text-[12px] ${errors.deviceName ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                />
                {errors.deviceName && <p className="text-[10px] text-red-500 mt-0.5">Device name is required</p>}
              </div>
            </div>

            <DialogFooter>
              <DialogClose render={<Button variant="outline" className="h-7 text-[11px]" />}>
                Cancel
              </DialogClose>
              <Button
                className="h-7 text-[11px]"
                onClick={handleAddEnrollment}
                disabled={!employeeName.trim() || !empId.trim() || !deviceName.trim()}
              >
                Link Employee
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Enrollments list or empty state */}
      <Card className="shadow-none border-slate-200 p-0">
        {enrollments.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No enrollments yet"
            description="Link device users to employee records to map biometric punches to the correct person."
            action={
              <Button className="h-7 text-[11px] gap-1.5" onClick={() => setDialogOpen(true)}>
                <UserPlus className="h-3 w-3" />
                Link Employee
              </Button>
            }
          />
        ) : (
          <div className="p-3">
            <DataTable
              columns={enrollmentColumns}
              data={enrollments}
              searchKey="employeeName"
              searchPlaceholder="Search enrollments..."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
