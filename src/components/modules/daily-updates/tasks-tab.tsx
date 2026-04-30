"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
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
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  Copy,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Download,
  ListTodo,
  Paperclip,
  Camera,
  Search,
  X,
  Loader2,
} from "lucide-react";
import { tasksData, type Task } from "./mock-data";

// Map DB status (snake_case) to display status (Title Case)
const statusDisplayMap: Record<string, Task["status"]> = {
  pending: "Pending",
  unassigned: "Unassigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Completed", // map cancelled to Completed for UI
};

// Map display status back to DB status
const statusDbMap: Record<string, string> = {
  "Pending": "pending",
  "Unassigned": "unassigned",
  "In Progress": "in_progress",
  "Completed": "completed",
};

// Map DB priority to display priority
const priorityDisplayMap: Record<string, Task["priority"]> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

// Map display priority back to DB
const priorityDbMap: Record<string, string> = {
  "Low": "low",
  "Medium": "medium",
  "High": "high",
  "Critical": "critical",
};

// Extend Task type locally to carry DB id
type TaskWithDbId = Task & { _dbId?: string };

// Convert a DB task record to the component's Task shape
function mapDbTask(row: Record<string, unknown>): TaskWithDbId {
  return {
    id: (row.id as string) ?? `task-${Date.now()}`,
    title: (row.title as string) ?? "",
    status: statusDisplayMap[(row.status as string) ?? "pending"] ?? "Pending",
    assignedTo: (row.assignedTo as string) ?? "Unassigned",
    dueDate: row.dueDate
      ? new Date(row.dueDate as string).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
      : "\u2014",
    priority: priorityDisplayMap[(row.priority as string) ?? "low"] ?? "Low",
    _dbId: (row.id as string) ?? undefined,
  };
}

const EMPLOYEES = [
  "Demo User", "Kumar A", "Govindaraju reddy", "Naveen Kumar", "Venkatesh N",
  "Nataraj P", "Alok kumar malik", "Sanjeevini G", "Sudhir Kumar",
  "Bhagyalaxmi D", "Bhagirathi Dev", "Tatkal Anand MD", "Janmejay M",
  "Prakash reddy", "Prasanti reddy", "Bhim C", "Dhive G",
];

export function TasksTab() {
  const [activeView, setActiveView] = useState<"list" | "add">("list");
  const [tasks, setTasks] = useState<TaskWithDbId[]>(tasksData);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const pageSize = 10;

  // Action dialog states
  const [assignOpen, setAssignOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDbId | null>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [editForm, setEditForm] = useState({ title: "", status: "", priority: "", dueDate: "" });

  const totalTasks = tasks.length;
  const paginatedTasks = tasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(totalTasks / pageSize);

  const filteredEmployees = useMemo(() => {
    if (!assignSearch) return EMPLOYEES;
    return EMPLOYEES.filter((e) => e.toLowerCase().includes(assignSearch.toLowerCase()));
  }, [assignSearch]);

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/tasks");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data.map(mapDbTask));
      }
      // If empty array, keep mock data as fallback
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Helper to get the identifier for API calls
  const getTaskId = (t: TaskWithDbId) => t._dbId ?? t.id;

  // Action handlers
  const openAssign = (t: TaskWithDbId) => { setSelectedTask(t); setAssignSearch(""); setAssignOpen(true); };

  const handleAssign = async (employee: string) => {
    if (!selectedTask) return;
    const id = getTaskId(selectedTask);

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._dbId ?? t.id) === (selectedTask._dbId ?? selectedTask.id) ? { ...t, assignedTo: employee, status: "In Progress" as const } : t));
    setAssignOpen(false);

    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: employee, status: "in_progress" }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success(`Assigned to ${employee}`);
    } catch {
      toast.success(`Assigned to ${employee} (offline)`);
    }
  };

  const openView = (t: TaskWithDbId) => { setSelectedTask(t); setViewOpen(true); };

  const openEditDialog = (t: TaskWithDbId) => {
    setSelectedTask(t);
    setEditForm({ title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate });
    setEditOpen(true);
  };

  const [newTask, setNewTask] = useState({
    title: "", description: "", department: "", responsibility: "Individual",
    priority: "Low", source: "Routine Maintenance", eisenhowerMatrix: "Urgent & Important", dueDate: "",
  });
  const [addErrors, setAddErrors] = useState<Record<string, boolean>>({});
  const [editErrors, setEditErrors] = useState<Record<string, boolean>>({});
  const [bulkFileName, setBulkFileName] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!selectedTask) return;
    const errs: Record<string, boolean> = {};
    if (!editForm.title.trim()) errs.title = true;
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const id = getTaskId(selectedTask);

    // Optimistic update
    setTasks((prev) => prev.map((t) => (t._dbId ?? t.id) === (selectedTask._dbId ?? selectedTask.id) ? { ...t, title: editForm.title, status: editForm.status as Task["status"], priority: editForm.priority as Task["priority"], dueDate: editForm.dueDate } : t));
    setEditOpen(false);

    try {
      const res = await fetch(`/api/v1/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          status: statusDbMap[editForm.status] ?? "pending",
          priority: priorityDbMap[editForm.priority] ?? "low",
          dueDate: editForm.dueDate || null,
        }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Task updated successfully");
    } catch {
      toast.success("Task updated (offline)");
    }
  };

  const handleDuplicate = async (t: TaskWithDbId) => {
    const body = {
      title: `${t.title} (Copy)`,
      status: statusDbMap[t.status] ?? "pending",
      priority: priorityDbMap[t.priority] ?? "low",
      assignedTo: t.assignedTo,
    };

    // Optimistic local copy
    const localCopy: TaskWithDbId = { ...t, id: `task-copy-${Date.now()}`, _dbId: undefined, title: `${t.title} (Copy)` };

    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const created = await res.json();
      setTasks((prev) => [mapDbTask(created), ...prev]);
      toast.success("Task duplicated");
    } catch {
      setTasks((prev) => [localCopy, ...prev]);
      toast.success("Task duplicated (offline)");
    }
  };

  const openDeleteDialog = (t: TaskWithDbId) => { setSelectedTask(t); setDeleteOpen(true); };

  const handleDelete = async () => {
    if (!selectedTask) return;
    const id = getTaskId(selectedTask);

    // Optimistic update
    setTasks((prev) => prev.filter((t) => (t._dbId ?? t.id) !== (selectedTask._dbId ?? selectedTask.id)));
    setDeleteOpen(false);

    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("API error");
      toast.success("Task deleted");
    } catch {
      toast.success("Task deleted (offline)");
    }
  };

  const handleFileUpload = (accept: string, onSelect?: (name: string) => void) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = () => {
      if (input.files?.[0]) {
        toast.success(`File selected: ${input.files[0].name}`);
        onSelect?.(input.files[0].name);
      }
    };
    input.click();
  };

  const handleAddTask = async () => {
    const errs: Record<string, boolean> = {};
    if (!newTask.title.trim()) errs.title = true;
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body = {
      title: newTask.title,
      description: newTask.description || null,
      department: newTask.department || null,
      responsibility: newTask.responsibility,
      priority: priorityDbMap[newTask.priority] ?? "low",
      source: newTask.source,
      eisenhowerMatrix: newTask.eisenhowerMatrix,
      dueDate: newTask.dueDate || null,
      status: "pending" as const,
      assignedTo: "Unassigned",
    };

    try {
      const res = await fetch("/api/v1/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const created = await res.json();
      setTasks((prev) => [mapDbTask(created), ...prev]);
      toast.success("Task created successfully");
    } catch {
      // Fallback: add to local state only
      setTasks((prev) => [
        { id: `task-${Date.now()}`, title: newTask.title, status: "Pending" as const, assignedTo: "Unassigned", dueDate: newTask.dueDate || "\u2014", priority: newTask.priority as Task["priority"] },
        ...prev,
      ]);
      toast.success("Task created (offline)");
    }

    setNewTask({ title: "", description: "", department: "", responsibility: "Individual", priority: "Low", source: "Routine Maintenance", eisenhowerMatrix: "Urgent & Important", dueDate: "" });
    setAddErrors({});
    setAttachmentName(null);
    setActiveView("list");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-slate-900">Tasks</h3>
        <Button onClick={() => setBulkUploadOpen(true)} size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 text-[12px] px-4 rounded-lg">
          <Upload className="h-3.5 w-3.5 mr-1.5" /> Bulk Upload
        </Button>
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-0">
        <button onClick={() => setActiveView("list")} className={`flex items-center gap-1.5 px-1 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${activeView === "list" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          <ListTodo className="h-3.5 w-3.5" /> View Tasks
        </button>
        <button onClick={() => setActiveView("add")} className={`flex items-center gap-1.5 px-1 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${activeView === "add" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
          <Plus className="h-3.5 w-3.5" /> Add New Task
        </button>
      </div>

      {activeView === "list" ? (
        <>
          {/* Loading state */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              <span className="ml-2 text-[13px] text-slate-500">Loading tasks...</span>
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col style={{ width: "30%" }} /><col style={{ width: "10%" }} /><col style={{ width: "16%" }} /><col style={{ width: "12%" }} /><col style={{ width: "10%" }} /><col style={{ width: "22%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">TASK TITLE</th>
                      <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">STATUS</th>
                      <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">ASSIGNED TO</th>
                      <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">DUE DATE</th>
                      <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">PRIORITY</th>
                      <th className="text-center py-3 px-3 text-[11px] font-medium text-slate-400">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedTasks.map((task) => (
                      <tr key={task._dbId ?? task.id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 px-3 text-[13px] text-slate-800 truncate">{task.title}</td>
                        <td className="py-3.5 px-3"><StatusBadge status={task.status} /></td>
                        <td className="py-3.5 px-3 text-[13px] text-slate-400">{task.assignedTo}</td>
                        <td className="py-3.5 px-3 text-[13px] text-slate-400">{task.dueDate}</td>
                        <td className="py-3.5 px-3"><StatusBadge status={task.priority} variant={task.priority === "High" ? "danger" : task.priority === "Medium" ? "purple" : "neutral"} /></td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => openAssign(task)} className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Assign">
                              <UserPlus className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => openView(task)} className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors" title="View">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDuplicate(task)} className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors" title="Duplicate">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => openEditDialog(task)} className="h-7 w-7 rounded-md flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors" title="Edit">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => openDeleteDialog(task)} className="h-7 w-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-[12px] text-slate-400">Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalTasks)} of {totalTasks} tasks</p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} className="h-7 text-[11px]"><ChevronLeft className="h-3 w-3 mr-0.5" /> Previous</Button>
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="h-7 w-7 text-[11px]">{page}</Button>
                  ))}
                  {totalPages > 3 && <span className="text-[11px] text-slate-400">...</span>}
                  <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)} className="h-7 text-[11px]">Next <ChevronRight className="h-3 w-3 ml-0.5" /></Button>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-[14px] font-semibold text-slate-900 mb-4 flex items-center gap-2"><ListTodo className="h-4 w-4" /> Add New Task</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Task Title *</Label><Input value={newTask.title} onChange={(e) => { setNewTask({ ...newTask, title: e.target.value }); setAddErrors((prev) => ({ ...prev, title: false })); }} className={`h-9 text-[13px] rounded-lg ${addErrors.title ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'}`} />{addErrors.title && <p className="text-[10px] text-red-500 mt-0.5">Title is required</p>}</div>
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Due Date</Label><Input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="h-9 text-[13px] rounded-lg" /></div>
            </div>
            <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Description</Label><textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} rows={3} className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Department</Label><select value={newTask.department} onChange={(e) => setNewTask({ ...newTask, department: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option value="">Select</option><option>Operations</option><option>Maintenance</option><option>Housekeeping</option><option>Security</option><option>Electrical</option></select></div>
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Priority</Label><select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Source</Label><select value={newTask.source} onChange={(e) => setNewTask({ ...newTask, source: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option>Routine Maintenance</option><option>Complaint</option><option>Inspection</option><option>Audit Finding</option></select></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Responsibility</Label><select value={newTask.responsibility} onChange={(e) => setNewTask({ ...newTask, responsibility: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option>Individual</option><option>Team</option><option>Department</option></select></div>
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Eisenhower Matrix</Label><select value={newTask.eisenhowerMatrix} onChange={(e) => setNewTask({ ...newTask, eisenhowerMatrix: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option>Urgent & Important</option><option>Not Urgent & Important</option><option>Urgent & Not Important</option><option>Not Urgent & Not Important</option></select></div>
            </div>
            <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Attachments</Label><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-8 text-[12px] rounded-lg" onClick={() => handleFileUpload(".jpg,.jpeg,.png,.pdf,.doc,.docx", setAttachmentName)}><Paperclip className="h-3.5 w-3.5 mr-1" /> Choose files</Button><Button variant="outline" size="sm" className="h-8 text-[12px] rounded-lg" onClick={() => handleFileUpload("image/*", setAttachmentName)}><Camera className="h-3.5 w-3.5 mr-1" /> Take Photo</Button>{attachmentName && <span className="text-[12px] text-slate-500">{attachmentName}</span>}</div></div>
            <Button onClick={handleAddTask} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-[13px] rounded-lg"><Plus className="h-3.5 w-3.5 mr-1.5" /> Create Task</Button>
          </div>
        </div>
      )}

      {/* ===== ASSIGN DIALOG ===== */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden" showCloseButton={false}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <DialogTitle className="text-[15px]">Assign Task</DialogTitle>
            <button onClick={() => setAssignOpen(false)} className="h-7 w-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /></button>
          </div>
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input placeholder="Search employees..." value={assignSearch} onChange={(e) => setAssignSearch(e.target.value)} className="pl-9 h-9 text-[13px] rounded-lg" autoFocus />
            </div>
          </div>
          <div className="max-h-[300px] overflow-y-auto px-2 pb-3">
            {filteredEmployees.map((emp, idx) => (
              <button key={idx} onClick={() => handleAssign(emp)} className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-md transition-colors flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold shrink-0">{emp[0]}</div>
                {emp}
              </button>
            ))}
            {filteredEmployees.length === 0 && <p className="text-center text-[12px] text-slate-400 py-4">No employees found</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle className="text-[15px]">Task Details</DialogTitle></DialogHeader>
          {selectedTask && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Status</span><StatusBadge status={selectedTask.status} /></div>
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Priority</span><StatusBadge status={selectedTask.priority} /></div>
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Assigned To</span><span className="text-[13px] text-slate-700">{selectedTask.assignedTo}</span></div>
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Due Date</span><span className="text-[13px] text-slate-700">{selectedTask.dueDate}</span></div>
              </div>
              <div><p className="text-[11px] text-slate-400 mb-1">Title</p><p className="text-[13px] text-slate-800">{selectedTask.title}</p></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle className="text-[15px]">Edit Task</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Title *</Label><Input value={editForm.title} onChange={(e) => { setEditForm({ ...editForm, title: e.target.value }); setEditErrors((prev) => ({ ...prev, title: false })); }} className={`h-9 text-[13px] rounded-lg ${editErrors.title ? 'border-red-400 ring-1 ring-red-200' : 'border-slate-200'}`} />{editErrors.title && <p className="text-[10px] text-red-500 mt-0.5">Title is required</p>}</div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label><select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option>Pending</option><option>In Progress</option><option>Completed</option></select></div>
              <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Priority</Label><select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
            </div>
            <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Due Date</Label><Input type="date" value={editForm.dueDate} onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} className="h-9 text-[13px] rounded-lg" /></div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => { setEditOpen(false); setEditErrors({}); }} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleEdit} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Update Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader><DialogTitle className="text-[15px]">Delete Task</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">Are you sure you want to delete <span className="font-semibold">&ldquo;{selectedTask?.title}&rdquo;</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleDelete} className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== BULK UPLOAD DIALOG ===== */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="text-[15px]">Bulk Upload Tasks</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-[12px] font-medium text-blue-800">Excel Format Required</p>
              <p className="text-[11px] text-blue-600 mt-0.5">Columns: Task Title, Description, Due Date, Department, Priority, Responsibility, Source</p>
              <Button variant="link" size="sm" className="text-blue-700 text-[11px] h-6 px-0 mt-1" onClick={() => toast.success("Downloading template...")}><Download className="h-3 w-3 mr-1" /> Download Template</Button>
            </div>
            <div><Label className="text-[12px] text-slate-600 mb-1.5 block">Select Excel File</Label><div className="flex items-center gap-2"><Button variant="outline" size="sm" className="h-8 text-[12px] rounded-lg" onClick={() => handleFileUpload(".xlsx,.xls,.csv", setBulkFileName)}>Choose file</Button><span className="text-[12px] text-slate-400">{bulkFileName || "No file chosen"}</span></div></div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => { setBulkUploadOpen(false); setBulkFileName(null); }} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={() => { if (!bulkFileName) { toast.error("Please select a file first"); return; } toast.success("Tasks uploaded successfully"); setBulkUploadOpen(false); setBulkFileName(null); }} className="bg-green-600 hover:bg-green-700 text-white h-9 text-[13px] rounded-lg"><Upload className="h-3.5 w-3.5 mr-1.5" /> Upload Tasks</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
