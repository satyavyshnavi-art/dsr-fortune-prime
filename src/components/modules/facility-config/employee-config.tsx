"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Users, Plus, Pencil, Trash2, Loader2, Search, Phone, Mail } from "lucide-react";

type Employee = {
  id: string;
  empId: string;
  firstName: string;
  lastName: string | null;
  designation: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  dateOfBirth: string | null;
  createdAt: string;
};

const demoEmployees: Employee[] = [
  { id: "demo-1", empId: "EMP001", firstName: "Neha", lastName: "Agarwal", designation: "Facility Manager", department: "Management", phone: "+91-9800000001", email: "neha.agarwal@dsrfp.com", dateOfBirth: "1988-05-15", createdAt: "2026-01-10T09:00:00Z" },
  { id: "demo-2", empId: "EMP002", firstName: "Shalini", lastName: "Mehta", designation: "Admin Executive", department: "Administration", phone: "+91-9800000002", email: "shalini.mehta@dsrfp.com", dateOfBirth: "1990-08-22", createdAt: "2026-01-10T09:00:00Z" },
  { id: "demo-3", empId: "EMP003", firstName: "Pradeep", lastName: "Desai", designation: "Chief Engineer", department: "Engineering", phone: "+91-9800000003", email: "pradeep.desai@dsrfp.com", dateOfBirth: "1985-02-10", createdAt: "2026-01-10T09:00:00Z" },
  { id: "demo-4", empId: "EMP004", firstName: "Ramesh", lastName: "Kumar", designation: "Electrician", department: "Engineering", phone: "+91-9800000004", email: "ramesh.kumar@dsrfp.com", dateOfBirth: "1992-11-30", createdAt: "2026-01-15T09:00:00Z" },
  { id: "demo-5", empId: "EMP005", firstName: "Suresh", lastName: "Patel", designation: "Plumber", department: "Engineering", phone: "+91-9800000005", email: "suresh.patel@dsrfp.com", dateOfBirth: "1991-06-18", createdAt: "2026-01-15T09:00:00Z" },
  { id: "demo-6", empId: "EMP006", firstName: "Anita", lastName: "Sharma", designation: "Housekeeping Supervisor", department: "Soft Services", phone: "+91-9800000006", email: "anita.sharma@dsrfp.com", dateOfBirth: "1993-01-25", createdAt: "2026-01-20T09:00:00Z" },
  { id: "demo-7", empId: "EMP007", firstName: "Vikram", lastName: "Singh", designation: "Security In-charge", department: "Security", phone: "+91-9800000007", email: "vikram.singh@dsrfp.com", dateOfBirth: "1987-09-14", createdAt: "2026-01-20T09:00:00Z" },
  { id: "demo-8", empId: "EMP008", firstName: "Lakshmi", lastName: "Devi", designation: "Gardener", department: "Soft Services", phone: "+91-9800000008", email: "lakshmi.devi@dsrfp.com", dateOfBirth: "1994-04-05", createdAt: "2026-02-01T09:00:00Z" },
  { id: "demo-9", empId: "EMP009", firstName: "Manoj", lastName: "Tiwari", designation: "HVAC Technician", department: "Engineering", phone: "+91-9800000009", email: "manoj.tiwari@dsrfp.com", dateOfBirth: "1989-12-20", createdAt: "2026-02-01T09:00:00Z" },
  { id: "demo-10", empId: "EMP010", firstName: "Kavitha", lastName: "Reddy", designation: "Accounts Executive", department: "Administration", phone: "+91-9800000010", email: "kavitha.reddy@dsrfp.com", dateOfBirth: "1991-07-08", createdAt: "2026-02-10T09:00:00Z" },
  { id: "demo-11", empId: "EMP011", firstName: "Raju", lastName: "Naidu", designation: "Lift Operator", department: "Operations", phone: "+91-9800000011", email: "raju.naidu@dsrfp.com", dateOfBirth: "1990-03-16", createdAt: "2026-02-10T09:00:00Z" },
  { id: "demo-12", empId: "EMP012", firstName: "Deepa", lastName: "Joshi", designation: "Front Desk", department: "Administration", phone: "+91-9800000012", email: "deepa.joshi@dsrfp.com", dateOfBirth: "1995-10-28", createdAt: "2026-02-15T09:00:00Z" },
];

const DEPARTMENTS = ["Management", "Administration", "Engineering", "Soft Services", "Security", "Operations"];

const emptyForm = {
  empId: "",
  firstName: "",
  lastName: "",
  designation: "",
  department: "",
  phone: "",
  email: "",
  dateOfBirth: "",
};

export function EmployeeConfig() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/facilities")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFacilityId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/employees");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEmployees(Array.isArray(data) && data.length > 0 ? data : demoEmployees);
    } catch {
      setEmployees(demoEmployees);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const filtered = employees.filter((e) => {
    if (deptFilter !== "all" && e.department !== deptFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        e.firstName.toLowerCase().includes(q) ||
        (e.lastName?.toLowerCase().includes(q) ?? false) ||
        e.empId.toLowerCase().includes(q) ||
        (e.designation?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  const isDemo = (id: string) => id.startsWith("demo-");

  const handleAdd = () => {
    setEditingEmployee(null);
    setForm({ ...emptyForm, empId: `EMP${String(employees.length + 1).padStart(3, "0")}` });
    setDialogOpen(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingEmployee(emp);
    setForm({
      empId: emp.empId,
      firstName: emp.firstName,
      lastName: emp.lastName || "",
      designation: emp.designation || "",
      department: emp.department || "",
      phone: emp.phone || "",
      email: emp.email || "",
      dateOfBirth: emp.dateOfBirth || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.firstName || !form.empId) {
      toast.error("Employee ID and First Name are required");
      return;
    }

    if (editingEmployee && isDemo(editingEmployee.id)) {
      setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...e, ...form } : e));
      toast.success("Employee updated");
      setDialogOpen(false);
      return;
    }

    setSaving(true);
    try {
      if (editingEmployee) {
        const res = await fetch(`/api/v1/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Employee updated");
      } else {
        const res = await fetch("/api/v1/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, facilityId }),
        });
        if (!res.ok) throw new Error();
        toast.success("Employee added");
      }
      await fetchEmployees();
    } catch {
      const newEmp: Employee = {
        id: `demo-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString(),
      };
      if (editingEmployee) {
        setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? { ...newEmp, id: editingEmployee.id } : e));
        toast.success("Employee updated (local)");
      } else {
        setEmployees(prev => [...prev, newEmp]);
        toast.success("Employee added (local)");
      }
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDemo(id)) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success("Employee deleted");
      setDeleteConfirmId(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/employees/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Employee deleted");
      await fetchEmployees();
    } catch {
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success("Employee deleted (local)");
    }
    setDeleteConfirmId(null);
  };

  const uniqueDepts = [...new Set(employees.map(e => e.department).filter(Boolean))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-800">Employee Management</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">{filtered.length} employees configured</p>
        </div>
        <Button size="sm" onClick={handleAdd} className="h-8 text-[12px] px-4 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Employee
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or designation..."
            className="pl-8 h-8 text-[12px]"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-[12px]"
        >
          <option value="all">All Departments</option>
          {uniqueDepts.map(d => <option key={d} value={d!}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-[13px] text-slate-500">Loading employees...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No employees found" description="Try adjusting your search or add a new employee." />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: "8%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "8%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Emp ID</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Name</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Designation</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Department</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Phone</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Email</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/40 group">
                  <td className="py-3 px-3">
                    <span className="inline-block rounded bg-blue-50 text-blue-600 text-[11px] font-mono font-medium px-2 py-0.5">
                      {emp.empId}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[13px] text-slate-800 font-medium">
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td className="py-3 px-3 text-[13px] text-slate-600 truncate">{emp.designation || "-"}</td>
                  <td className="py-3 px-3">
                    <span className="inline-block rounded bg-slate-100 text-slate-600 text-[11px] font-medium px-2 py-0.5">
                      {emp.department || "-"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[12px] text-slate-500">
                    {emp.phone ? (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {emp.phone}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-3 text-[12px] text-slate-500 truncate">
                    {emp.email ? (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {emp.email}
                      </span>
                    ) : "-"}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(emp)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(emp.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingEmployee ? "Edit Employee" : "Add Employee"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Employee ID *</label>
                <Input value={form.empId} onChange={(e) => setForm(f => ({ ...f, empId: e.target.value }))} placeholder="EMP001" className="text-[13px]" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Department</label>
                <select value={form.department} onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-[13px]">
                  <option value="">Select...</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">First Name *</label>
                <Input value={form.firstName} onChange={(e) => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="First name" className="text-[13px]" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Last Name</label>
                <Input value={form.lastName} onChange={(e) => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="Last name" className="text-[13px]" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Designation</label>
              <Input value={form.designation} onChange={(e) => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="e.g. Facility Manager" className="text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Phone</label>
                <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-XXXXXXXXXX" className="text-[13px]" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Date of Birth</label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} className="text-[13px]" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@example.com" className="text-[13px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-[13px]">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingEmployee ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-slate-600 py-2">Are you sure you want to delete this employee? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="text-[13px]">Cancel</Button>
            <Button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="bg-red-600 hover:bg-red-700 text-white text-[13px]">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
