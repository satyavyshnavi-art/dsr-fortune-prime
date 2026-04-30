"use client";

import { useState, useMemo } from "react";
import { KPICard } from "@/components/shared/kpi-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UserPlus,
  Eye,
  Pencil,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
} from "lucide-react";
import { complaintsData, type Complaint } from "./mock-data";

// Mock employees for assignment
const EMPLOYEES = [
  "Demo User ①",
  "Kumar A ①",
  "Govindaraju reddy ①",
  "Naveen Kumar ①",
  "Venkatesh N ①",
  "Nataraj P ①",
  "Alok kumar malik ①",
  "Sanjeevini G ①",
  "Sudhir Kumar ①",
  "Bhagyalaxmi D ①",
  "Bhagirathi Dev ①",
  "Tatkal Anand MD ①",
  "Janmejay M ①",
  "Prakash reddy ①",
  "Prasanti reddy ①",
  "Bhim C ①",
  "Dhive G ①",
  "Veerabhadreshwaramma Lakshmippa ①",
  "Karna V ①",
];

export function ComplaintsTab() {
  const [activeView, setActiveView] = useState<"list" | "add">("list");
  const [complaints, setComplaints] = useState(complaintsData);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Action dialog states
  const [assignOpen, setAssignOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [editForm, setEditForm] = useState({ title: "", status: "", priority: "" });

  // New complaint form
  const [newComplaint, setNewComplaint] = useState({
    title: "", description: "", department: "", priority: "medium",
  });

  const totalComplaints = complaints.length;
  const openCount = complaints.filter((c) => c.status === "Open").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  const paginatedComplaints = complaints.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(totalComplaints / pageSize);

  // Filtered employees for assign
  const filteredEmployees = useMemo(() => {
    if (!assignSearch) return EMPLOYEES;
    return EMPLOYEES.filter((e) =>
      e.toLowerCase().includes(assignSearch.toLowerCase())
    );
  }, [assignSearch]);

  // Action handlers
  const openAssign = (c: Complaint) => {
    setSelectedComplaint(c);
    setAssignSearch("");
    setAssignOpen(true);
  };

  const handleAssign = (employee: string) => {
    if (!selectedComplaint) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.ticketId === selectedComplaint.ticketId
          ? { ...c, assignedTo: employee.replace(/ ①$/, ""), status: "In Progress" as const }
          : c
      )
    );
    setAssignOpen(false);
  };

  const openView = (c: Complaint) => {
    setSelectedComplaint(c);
    setViewOpen(true);
  };

  const openEditDialog = (c: Complaint) => {
    setSelectedComplaint(c);
    setEditForm({ title: c.title, status: c.status, priority: "Medium" });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!selectedComplaint) return;
    setComplaints((prev) =>
      prev.map((c) =>
        c.ticketId === selectedComplaint.ticketId
          ? { ...c, title: editForm.title, status: editForm.status as Complaint["status"] }
          : c
      )
    );
    setEditOpen(false);
  };

  const openDeleteDialog = (c: Complaint) => {
    setSelectedComplaint(c);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedComplaint) return;
    setComplaints((prev) => prev.filter((c) => c.ticketId !== selectedComplaint.ticketId));
    setDeleteOpen(false);
  };

  const handleAddComplaint = () => {
    if (!newComplaint.title) return;
    const id = `GV-${String(complaints.length + 1).padStart(5, "0")}`;
    setComplaints((prev) => [
      {
        ticketId: id,
        title: newComplaint.title,
        status: "Open" as const,
        assignedTo: "Unassigned",
        date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
      },
      ...prev,
    ]);
    setNewComplaint({ title: "", description: "", department: "", priority: "medium" });
    setActiveView("list");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold text-slate-900">Complaints</h3>

      {/* Sub-nav */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-0">
        <button
          onClick={() => setActiveView("list")}
          className={`flex items-center gap-1.5 px-1 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
            activeView === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          View Complaints
        </button>
        <button
          onClick={() => setActiveView("add")}
          className={`flex items-center gap-1.5 px-1 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
            activeView === "add"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add New Complaint
        </button>
      </div>

      {activeView === "list" ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard title="Total" value={totalComplaints} color="slate" />
            <KPICard title="Open" value={openCount} color="red" />
            <KPICard title="In Progress" value={inProgressCount} color="yellow" />
            <KPICard title="Resolved" value={resolvedCount} color="green" />
          </div>

          {/* Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "12%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">TICKET ID</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">TITLE</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">STATUS</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">ASSIGNED TO</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">DATE</th>
                  <th className="text-center py-3 px-3 text-[11px] font-medium text-slate-400">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedComplaints.map((c) => (
                  <tr key={c.ticketId} className="hover:bg-slate-50/40">
                    <td className="py-3.5 px-3 text-[13px] font-medium text-slate-800">{c.ticketId}</td>
                    <td className="py-3.5 px-3 text-[13px] text-slate-700 truncate">{c.title}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        status={c.status}
                        variant={c.status === "Open" ? "danger" : c.status === "In Progress" ? "warning" : "success"}
                      />
                    </td>
                    <td className="py-3.5 px-3 text-[13px] text-slate-400">{c.assignedTo}</td>
                    <td className="py-3.5 px-3 text-[13px] text-slate-400">{c.date}</td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openAssign(c)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Assign"
                        >
                          <UserPlus className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openView(c)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditDialog(c)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(c)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalComplaints)} of {totalComplaints} complaints
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 text-[11px]">
                <ChevronLeft className="h-3 w-3 mr-0.5" /> Previous
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="h-7 w-7 text-[11px]">
                  {page}
                </Button>
              ))}
              <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-7 text-[11px]">
                Next <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Add Complaint Form */
        <div className="rounded-xl border border-slate-200 bg-white p-5 max-w-2xl">
          <h4 className="text-[14px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Add New Complaint
          </h4>
          <div className="space-y-3">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Complaint Title *</Label>
              <Input value={newComplaint.title} onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })} placeholder="Enter complaint title" className="h-9 text-[13px] rounded-lg" />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Description *</Label>
              <textarea value={newComplaint.description} onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })} placeholder="Describe the complaint in detail..." rows={3} className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Department *</Label>
                <select value={newComplaint.department} onChange={(e) => setNewComplaint({ ...newComplaint, department: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]">
                  <option value="">Select Department</option>
                  <option>Operations</option><option>Maintenance</option><option>Housekeeping</option><option>Security</option><option>Electrical</option><option>Plumbing</option>
                </select>
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Priority *</Label>
                <select value={newComplaint.priority} onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <Button onClick={handleAddComplaint} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-[13px] rounded-lg">
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Complaint
            </Button>
          </div>
        </div>
      )}

      {/* ===== ASSIGN COMPLAINT DIALOG ===== */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden" showCloseButton={false}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <DialogTitle className="text-[15px]">Assign Complaint</DialogTitle>
            <button onClick={() => setAssignOpen(false)} className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Search */}
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search employees..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="pl-9 h-9 text-[13px] rounded-lg"
                autoFocus
              />
            </div>
          </div>

          {/* Employee List */}
          <div className="max-h-[300px] overflow-y-auto px-2 pb-3">
            {filteredEmployees.map((employee, idx) => (
              <button
                key={idx}
                onClick={() => handleAssign(employee)}
                className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2"
              >
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                  {employee[0]}
                </div>
                {employee}
              </button>
            ))}
            {filteredEmployees.length === 0 && (
              <p className="text-center text-[12px] text-slate-400 py-4">No employees found</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW COMPLAINT DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Complaint Details</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Ticket ID</span>
                  <span className="text-[13px] font-semibold text-slate-800">{selectedComplaint.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Status</span>
                  <StatusBadge status={selectedComplaint.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Assigned To</span>
                  <span className="text-[13px] text-slate-700">{selectedComplaint.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Date</span>
                  <span className="text-[13px] text-slate-700">{selectedComplaint.date}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Title</p>
                <p className="text-[13px] text-slate-800">{selectedComplaint.title}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT COMPLAINT DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Edit Complaint - {selectedComplaint?.ticketId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Title</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="h-9 text-[13px] rounded-lg" />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]">
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleEdit} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Update Complaint</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Complaint</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete complaint <span className="font-semibold">{selectedComplaint?.ticketId}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleDelete} className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
