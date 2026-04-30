"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
  UserPlus,
  QrCode,
  Pencil,
  Trash2,
  Search,
  AlertTriangle,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  Employee,
  MOCK_EMPLOYEES,
  DESIGNATIONS,
} from "./mock-data";
import { useApi } from "@/hooks/use-api";
import { exportCSV, exportPDF, exportExcel } from "@/lib/export";
import { toast } from "sonner";

/** Map a raw API employee row to the component's Employee shape */
function mapApiEmployee(row: any): Employee {
  return {
    id: row.id,
    empId: row.empId,
    firstName: row.firstName,
    lastName: row.lastName ?? "",
    designation: row.designation ?? "",
    department: row.department ?? "",
    phone: row.phone ?? "",
    email: row.email ?? "",
    dateOfBirth: row.dateOfBirth ?? "",
    qrConfigured: !!row.qrCodeData,
    smartcardId: row.smartcardId,
    shift: undefined,
    isActive: true,
  };
}

function generateNextEmpId(employees: Employee[]): string {
  const maxNum = Math.max(
    0,
    ...employees.map((e) => parseInt(e.empId.replace("EMP", "")))
  );
  return `EMP${(maxNum + 1).toString().padStart(4, "0")}`;
}

export function EmployeeTable() {
  const {
    data: apiEmployees,
    loading,
    error: apiError,
    create,
    update,
    remove,
    fetchData,
  } = useApi<any[]>({
    url: "/api/v1/employees",
    initialData: [],
  });

  // Map API rows to component shape, fall back to mock data on error
  const employees: Employee[] = useMemo(() => {
    if (apiError || !apiEmployees || apiEmployees.length === 0) {
      return apiError ? MOCK_EMPLOYEES : (apiEmployees ?? []).map(mapApiEmployee);
    }
    return apiEmployees.map(mapApiEmployee);
  }, [apiEmployees, apiError]);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [designationFilter, setDesignationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredEmployees = employees.filter((emp) => {
    const matchesDesignation =
      designationFilter === "all" || emp.designation === designationFilter;
    const matchesSearch =
      !searchQuery ||
      `${emp.firstName} ${emp.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDesignation && matchesSearch;
  });

  const handleEdit = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowEditDialog(true);
  };

  const handleDelete = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowDeleteDialog(true);
  };

  const handleQR = (emp: Employee) => {
    setSelectedEmployee(emp);
    setShowQRDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;
    try {
      await remove(selectedEmployee.id);
      toast.success("Deleted successfully");
    } catch {
      toast.error("Failed to delete employee");
    }
    setShowDeleteDialog(false);
    setSelectedEmployee(null);
  };

  const buildEmployeeExportData = () =>
    employees.map((emp) => ({
      "EMP ID": emp.empId,
      "First Name": emp.firstName,
      "Last Name": emp.lastName,
      "Designation": emp.designation,
      "Phone": emp.phone || "-",
      "Email": emp.email || "-",
      "Department": emp.department || "-",
    }));

  const handleExportPDF = () => {
    exportPDF(buildEmployeeExportData(), "Employee_List", "Employee List Report");
    toast.success("PDF exported");
  };

  const handleExportExcel = () => {
    exportExcel(buildEmployeeExportData(), "Employee_List", "Employees");
    toast.success("Excel exported");
  };

  const handleDownloadQRPDF = () => {
    // Generate a PDF with all employee QR codes
    const html = `
      <!DOCTYPE html>
      <html><head><title>Employee QR Codes</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { font-size: 18px; margin-bottom: 15px; }
        .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: center; }
        .card h3 { font-size: 13px; margin: 8px 0 2px; }
        .card p { font-size: 11px; color: #64748b; margin: 0; }
        .card img { width: 120px; height: 120px; }
        @media print { .grid { grid-template-columns: repeat(3, 1fr); } }
      </style></head>
      <body>
        <h1>Employee QR Codes</h1>
        <p style="font-size:11px;color:#666;margin-bottom:15px;">${employees.length} employees • Generated ${new Date().toLocaleString("en-IN")}</p>
        <div class="grid">
          ${employees.map((emp) => `
            <div class="card">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`empId=${emp.empId}|name=${emp.firstName} ${emp.lastName}`)}" />
              <h3>${emp.firstName} ${emp.lastName}</h3>
              <p>${emp.empId} • ${emp.designation}</p>
            </div>
          `).join("")}
        </div>
      </body></html>
    `;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); setTimeout(() => w.print(), 600); }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900">
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },
    {
      accessorKey: "empId",
      header: "Emp ID",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-600">{row.original.empId}</span>
      ),
    },
    {
      accessorKey: "phone",
      header: "Mobile No.",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.phone}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-400">{row.original.email}</span>
      ),
    },
    {
      accessorKey: "designation",
      header: "Designation",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.designation}</span>
      ),
    },
    {
      accessorKey: "qr",
      header: "QR",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleQR(row.original)}
          >
            {row.original.qrConfigured ? (
              <QrCode className="h-3.5 w-3.5 text-slate-400" />
            ) : (
              <QrCode className="h-3.5 w-3.5 text-slate-300" />
            )}
          </Button>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-3 w-3 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleDelete(row.original)}
          >
            <Trash2 className="h-3 w-3 text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header + Action bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold text-slate-800">
            Employee Management
          </h3>
          <span className="text-[11px] text-slate-400">
            {filteredEmployees.length} employees
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            className="h-7 text-[11px] px-2.5 gap-1"
            onClick={handleDownloadQRPDF}
          >
            <Download className="h-3 w-3" />
            Download QR PDF
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleExportExcel}
          >
            <FileSpreadsheet className="h-3 w-3" />
            Export Excel
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-red-600 hover:bg-red-700 text-white"
            onClick={handleExportPDF}
          >
            <FileText className="h-3 w-3" />
            Export PDF
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => {
              // Bulk upload: trigger file input
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".xlsx,.xls,.csv";
              input.onchange = () => {
                if (input.files?.[0]) {
                  toast.success(`File "${input.files[0].name}" selected for import`);
                }
              };
              input.click();
            }}
          >
            <Upload className="h-3 w-3" />
            Bulk Upload
          </Button>
          <Button
            className="h-7 text-[11px] px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-3 w-3" />
            Add Employee
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative max-w-[220px] flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-[12px]"
          />
        </div>
        <Select
          value={designationFilter}
          onValueChange={(v) => setDesignationFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[160px] h-8 text-[12px]">
            <SelectValue placeholder="All Designations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Designations</SelectItem>
            {DESIGNATIONS.map((d) => (
              <SelectItem key={d} value={d} className="text-[12px]">
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <span className="text-[11px] text-slate-400">Loading employees...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredEmployees} pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data. {apiError}
        </p>
      )}

      {/* Add Employee Dialog */}
      <AddEmployeeDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={async (emp) => {
          try {
            await create({
              empId: emp.empId,
              firstName: emp.firstName,
              lastName: emp.lastName,
              designation: emp.designation,
              department: emp.department,
              phone: emp.phone,
              email: emp.email,
              dateOfBirth: emp.dateOfBirth || null,
              facilityId: (apiEmployees?.[0] as any)?.facilityId ?? undefined,
            });
            setShowAddDialog(false);
            toast.success("Employee added successfully");
          } catch {
            toast.error("Failed to add employee");
          }
        }}
        employees={employees}
      />

      {/* Edit Employee Dialog */}
      <EditEmployeeDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        employee={selectedEmployee}
        onUpdate={async (updated) => {
          try {
            await update(updated.id, {
              firstName: updated.firstName,
              lastName: updated.lastName,
              designation: updated.designation,
              phone: updated.phone,
              email: updated.email,
            });
            setShowEditDialog(false);
            setSelectedEmployee(null);
            toast.success("Updated successfully");
          } catch {
            toast.error("Failed to update employee");
          }
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] p-5" showCloseButton>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-[14px] font-semibold text-slate-800">
              Delete Employee
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-slate-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">
                    {selectedEmployee?.firstName} {selectedEmployee?.lastName}
                  </span>{" "}
                  ({selectedEmployee?.empId})?
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-7 text-[11px] px-3"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-7 text-[11px] px-3 bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-sm p-5" showCloseButton>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-[14px] font-semibold text-slate-800 text-center">
              QR Code - {selectedEmployee?.firstName} {selectedEmployee?.lastName}
            </DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeQRCode employee={selectedEmployee} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add Employee Dialog                                                */
/* ------------------------------------------------------------------ */
function AddEmployeeDialog({
  open,
  onOpenChange,
  onAdd,
  employees,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (employee: Employee) => void | Promise<void>;
  employees: Employee[];
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    designation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const nextEmpId = generateNextEmpId(employees);

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      empId: nextEmpId,
      firstName: formData.firstName,
      lastName: formData.lastName,
      designation: formData.designation,
      department: formData.designation,
      phone: formData.phone ? `+91-${formData.phone}` : "",
      email: `${formData.firstName.toLowerCase()}@greenviewdemo.com`,
      dateOfBirth: formData.dateOfBirth,
      qrConfigured: false,
    };
    onAdd(newEmployee);
    setFormData({
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      phone: "",
      designation: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-5" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800">Add New Employee</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          {/* Employee ID */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-[11px] text-slate-500">Employee ID</Label>
              <p className="text-[10px] text-slate-400">Auto-generated</p>
            </div>
            <span className="inline-block bg-blue-50 text-blue-700 font-mono text-[12px] px-2.5 py-1 rounded border border-blue-200">
              {nextEmpId}
            </span>
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Jane"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                  if (errors.firstName) setErrors((prev) => { const n = { ...prev }; delete n.firstName; return n; });
                }}
                className={`h-9 text-[13px] rounded-lg ${errors.firstName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">{errors.firstName}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }));
                  if (errors.lastName) setErrors((prev) => { const n = { ...prev }; delete n.lastName; return n; });
                }}
                className={`h-9 text-[13px] rounded-lg ${errors.lastName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.lastName && <p className="text-[10px] text-red-500 mt-0.5">{errors.lastName}</p>}
            </div>
          </div>

          {/* DOB & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Date of Birth</Label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))
                }
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Phone</Label>
              <div className="flex">
                <span className="inline-flex items-center px-2 text-[11px] text-slate-500 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg">
                  +91
                </span>
                <Input
                  placeholder="9876543210"
                  className="rounded-l-none h-9 text-[13px] rounded-r-lg"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Designation <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.designation}
              onValueChange={(val) => {
                setFormData((prev) => ({ ...prev, designation: val ?? "" }));
                if (errors.designation) setErrors((prev) => { const n = { ...prev }; delete n.designation; return n; });
              }}
            >
              <SelectTrigger className={`h-9 text-[13px] rounded-lg ${errors.designation ? "border-red-400 ring-1 ring-red-200" : ""}`}>
                <SelectValue placeholder="Select Designation" />
              </SelectTrigger>
              <SelectContent>
                {DESIGNATIONS.map((d) => (
                  <SelectItem key={d} value={d} className="text-[12px]">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.designation && <p className="text-[10px] text-red-500 mt-0.5">{errors.designation}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="h-7 text-[11px] px-3" onClick={() => { onOpenChange(false); setErrors({}); }}>
              Cancel
            </Button>
            <Button
              className="h-7 text-[11px] px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              <UserPlus className="h-3 w-3" />
              Add Employee
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Edit Employee Dialog                                               */
/* ------------------------------------------------------------------ */
function EditEmployeeDialog({
  open,
  onOpenChange,
  employee,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onUpdate: (updated: Employee) => void | Promise<void>;
}) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    designation: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form when employee changes
  const [prevId, setPrevId] = useState<string | null>(null);
  if (employee && employee.id !== prevId) {
    setPrevId(employee.id);
    setErrors({});
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      designation: employee.designation,
      phone: employee.phone,
      email: employee.email,
    });
  }

  const handleUpdate = () => {
    if (!employee) return;
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.designation) newErrors.designation = "Designation is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onUpdate({
      ...employee,
      firstName: formData.firstName,
      lastName: formData.lastName,
      designation: formData.designation,
      phone: formData.phone,
      email: formData.email,
    });
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-5" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800">
            Edit Employee — {employee.empId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          {/* Name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.firstName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, firstName: e.target.value }));
                  if (errors.firstName) setErrors((prev) => { const n = { ...prev }; delete n.firstName; return n; });
                }}
                className={`h-9 text-[13px] rounded-lg ${errors.firstName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">{errors.firstName}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                }
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>

          {/* Designation */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Designation <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.designation}
              onValueChange={(val) => {
                setFormData((prev) => ({ ...prev, designation: val ?? "" }));
                if (errors.designation) setErrors((prev) => { const n = { ...prev }; delete n.designation; return n; });
              }}
            >
              <SelectTrigger className={`h-9 text-[13px] rounded-lg ${errors.designation ? "border-red-400 ring-1 ring-red-200" : ""}`}>
                <SelectValue placeholder="Select Designation" />
              </SelectTrigger>
              <SelectContent>
                {DESIGNATIONS.map((d) => (
                  <SelectItem key={d} value={d} className="text-[12px]">
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.designation && <p className="text-[10px] text-red-500 mt-0.5">{errors.designation}</p>}
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Phone</Label>
              <Input
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Email</Label>
              <Input
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="h-7 text-[11px] px-3"
              onClick={() => { onOpenChange(false); setErrors({}); }}
            >
              Cancel
            </Button>
            <Button
              className="h-7 text-[11px] px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleUpdate}
            >
              <Pencil className="h-3 w-3" />
              Update Employee
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  Employee QR Code                                                   */
/* ------------------------------------------------------------------ */
function EmployeeQRCode({ employee }: { employee: Employee }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const qrValue = `empId=${employee.empId}|name=${employee.firstName} ${employee.lastName}|designation=${employee.designation}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = qrValue;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [qrValue]);

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR-${employee.empId}-${employee.firstName}-${employee.lastName}.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  }, [employee]);

  return (
    <div className="flex flex-col items-center py-4">
      {/* QR Code */}
      <div
        ref={qrRef}
        className="bg-white p-4 rounded-lg border-2 border-slate-200 mb-3"
      >
        <QRCodeSVG value={qrValue} size={200} level="M" includeMargin={false} />
      </div>

      {/* Employee Info */}
      <p className="text-[13px] font-semibold text-slate-800">
        {employee.firstName} {employee.lastName}
      </p>
      <p className="text-[11px] text-slate-500 font-mono mb-1">
        {employee.empId}
      </p>
      <p className="text-[11px] text-slate-400 mb-4">{employee.designation}</p>

      {/* QR Code Info */}
      <p className="text-[10px] text-slate-400 font-medium mb-1">QR Code Info</p>
      <p className="text-[10px] text-slate-500 text-center mb-4 font-mono px-4 break-all leading-relaxed">
        {qrValue}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleCopy}
          className="h-7 text-[11px] px-4 bg-green-600 hover:bg-green-700 text-white"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 mr-1" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1" />
              Copy Info
            </>
          )}
        </Button>
        <Button
          size="sm"
          onClick={handleDownload}
          className="h-7 text-[11px] px-4 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Download className="h-3 w-3 mr-1" />
          Download QR
        </Button>
      </div>
    </div>
  );
}
