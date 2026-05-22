"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
  Loader2,
  MoreHorizontal,
} from "lucide-react";
import { tasksData, type Task } from "./mock-data";

const statusDisplayMap: Record<string, Task["status"]> = {
  pending: "Pending",
  unassigned: "Unassigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Completed",
};

const statusDbMap: Record<string, string> = {
  Pending: "pending",
  Unassigned: "unassigned",
  "In Progress": "in_progress",
  Completed: "completed",
};

const priorityDisplayMap: Record<string, Task["priority"]> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

const priorityDbMap: Record<string, string> = {
  Low: "low",
  Medium: "medium",
  High: "high",
  Critical: "critical",
};

type TaskWithDbId = Task & { _dbId?: string };

function mapDbTask(row: Record<string, unknown>): TaskWithDbId {
  return {
    id: (row.id as string) ?? `task-${Date.now()}`,
    title: (row.title as string) ?? "",
    status: statusDisplayMap[(row.status as string) ?? "pending"] ?? "Pending",
    assignedTo: (row.assignedTo as string) ?? "Unassigned",
    dueDate: row.dueDate
      ? new Date(row.dueDate as string).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
      : "—",
    priority: priorityDisplayMap[(row.priority as string) ?? "low"] ?? "Low",
    _dbId: (row.id as string) ?? undefined,
  };
}

const EMPLOYEES = [
  "Demo User",
  "Kumar A",
  "Govindaraju reddy",
  "Naveen Kumar",
  "Venkatesh N",
  "Nataraj P",
  "Alok kumar malik",
  "Sanjeevini G",
  "Sudhir Kumar",
  "Bhagyalaxmi D",
  "Bhagirathi Dev",
  "Tatkal Anand MD",
  "Janmejay M",
  "Prakash reddy",
  "Prasanti reddy",
  "Bhim C",
  "Dhive G",
];

const STATUS_FILTERS = ["all", "Pending", "Unassigned", "In Progress", "Completed"] as const;
const PRIORITY_FILTERS = ["all", "Low", "Medium", "High", "Critical"] as const;

export function TasksTab() {
  const [activeView, setActiveView] = useState<"list" | "add">("list");
  const [tasks, setTasks] = useState<TaskWithDbId[]>(tasksData);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const [assignOpen, setAssignOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithDbId | null>(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [editForm, setEditForm] = useState({
    title: "",
    status: "",
    priority: "",
    dueDate: "",
  });

  const filteredTasks = useMemo(() => {
    let result = tasks;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    return result;
  }, [tasks, search, statusFilter, priorityFilter]);

  const totalTasks = filteredTasks.length;
  const totalPages = Math.max(1, Math.ceil(totalTasks / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedTasks = filteredTasks.slice(pageStart, pageStart + pageSize);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };
  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  const filteredEmployees = useMemo(() => {
    if (!assignSearch) return EMPLOYEES;
    return EMPLOYEES.filter((e) =>
      e.toLowerCase().includes(assignSearch.toLowerCase())
    );
  }, [assignSearch]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/tasks");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setTasks(data.map(mapDbTask));
      }
    } catch {
      // keep mock data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getTaskId = (t: TaskWithDbId) => t._dbId ?? t.id;

  const openAssign = (t: TaskWithDbId) => {
    setSelectedTask(t);
    setAssignSearch("");
    setAssignOpen(true);
  };

  const handleAssign = async (employee: string) => {
    if (!selectedTask) return;
    const id = getTaskId(selectedTask);
    setTasks((prev) =>
      prev.map((t) =>
        (t._dbId ?? t.id) === (selectedTask._dbId ?? selectedTask.id)
          ? { ...t, assignedTo: employee, status: "In Progress" as const }
          : t
      )
    );
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

  const openView = (t: TaskWithDbId) => {
    setSelectedTask(t);
    setViewOpen(true);
  };

  const openEditDialog = (t: TaskWithDbId) => {
    setSelectedTask(t);
    setEditForm({
      title: t.title,
      status: t.status,
      priority: t.priority,
      dueDate: t.dueDate,
    });
    setEditOpen(true);
  };

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    department: "",
    responsibility: "Individual",
    priority: "Low",
    source: "Routine Maintenance",
    eisenhowerMatrix: "Urgent & Important",
    dueDate: "",
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
    setTasks((prev) =>
      prev.map((t) =>
        (t._dbId ?? t.id) === (selectedTask._dbId ?? selectedTask.id)
          ? {
              ...t,
              title: editForm.title,
              status: editForm.status as Task["status"],
              priority: editForm.priority as Task["priority"],
              dueDate: editForm.dueDate,
            }
          : t
      )
    );
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
    const localCopy: TaskWithDbId = {
      ...t,
      id: `task-copy-${Date.now()}`,
      _dbId: undefined,
      title: `${t.title} (Copy)`,
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
      toast.success("Task duplicated");
    } catch {
      setTasks((prev) => [localCopy, ...prev]);
      toast.success("Task duplicated (offline)");
    }
  };

  const openDeleteDialog = (t: TaskWithDbId) => {
    setSelectedTask(t);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTask) return;
    const id = getTaskId(selectedTask);
    setTasks((prev) =>
      prev.filter(
        (t) =>
          (t._dbId ?? t.id) !== (selectedTask._dbId ?? selectedTask.id)
      )
    );
    setDeleteOpen(false);
    try {
      const res = await fetch(`/api/v1/tasks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("API error");
      toast.success("Task deleted");
    } catch {
      toast.success("Task deleted (offline)");
    }
  };

  const handleFileUpload = (
    accept: string,
    onSelect?: (name: string) => void
  ) => {
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
      setTasks((prev) => [
        {
          id: `task-${Date.now()}`,
          title: newTask.title,
          status: "Pending" as const,
          assignedTo: "Unassigned",
          dueDate: newTask.dueDate || "—",
          priority: newTask.priority as Task["priority"],
        },
        ...prev,
      ]);
      toast.success("Task created (offline)");
    }

    setNewTask({
      title: "",
      description: "",
      department: "",
      responsibility: "Individual",
      priority: "Low",
      source: "Routine Maintenance",
      eisenhowerMatrix: "Urgent & Important",
      dueDate: "",
    });
    setAddErrors({});
    setAttachmentName(null);
    setActiveView("list");
  };

  const priorityVariant = (
    p: Task["priority"]
  ): "danger" | "warning" | "purple" | "neutral" => {
    if (p === "Critical") return "danger";
    if (p === "High") return "warning";
    if (p === "Medium") return "purple";
    return "neutral";
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-slate-900 leading-tight">
            Tasks
          </h3>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Create, assign, and track tasks across the facility
          </p>
        </div>
        <Button
          onClick={() => setBulkUploadOpen(true)}
          className="h-9 text-[12px] gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg"
        >
          <Upload className="h-3.5 w-3.5" />
          Bulk Upload
        </Button>
      </div>

      <Tabs
        value={activeView}
        onValueChange={(v) => setActiveView((v as "list" | "add") ?? "list")}
      >
        <TabsList className="bg-slate-100/70 p-1 rounded-lg">
          <TabsTrigger
            value="list"
            className="text-[12px] gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3"
          >
            <ListTodo className="h-3.5 w-3.5" />
            View Tasks
          </TabsTrigger>
          <TabsTrigger
            value="add"
            className="text-[12px] gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-3"
          >
            <Plus className="h-3.5 w-3.5" />
            Add New Task
          </TabsTrigger>
        </TabsList>

        {/* LIST VIEW */}
        <TabsContent value="list" className="mt-4 space-y-3">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 h-9 text-[12px] rounded-lg"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => handleStatusFilterChange(v ?? "all")}
            >
              <SelectTrigger className="h-9 w-[140px] text-[12px] rounded-lg">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s} value={s} className="text-[12px]">
                    {s === "all" ? "All Status" : s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(v) => handlePriorityFilterChange(v ?? "all")}
            >
              <SelectTrigger className="h-9 w-[140px] text-[12px] rounded-lg">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_FILTERS.map((p) => (
                  <SelectItem key={p} value={p} className="text-[12px]">
                    {p === "all" ? "All Priority" : p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <Card className="rounded-xl">
              <CardContent className="py-12 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                <span className="ml-2 text-[13px] text-slate-500">
                  Loading tasks...
                </span>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-xl overflow-hidden p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
                      Task Title
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wide w-[120px]">
                      Status
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wide w-[180px]">
                      Assigned To
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wide w-[120px]">
                      Due Date
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wide w-[110px]">
                      Priority
                    </TableHead>
                    <TableHead className="text-[11px] font-medium text-slate-500 uppercase tracking-wide w-[80px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTasks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="py-10 text-center text-[12px] text-slate-400"
                      >
                        No tasks match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedTasks.map((task) => (
                      <TableRow
                        key={task._dbId ?? task.id}
                        className="hover:bg-slate-50/60"
                      >
                        <TableCell className="text-[13px] text-slate-800 font-medium max-w-[420px]">
                          <span className="line-clamp-2">{task.title}</span>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={task.status} />
                        </TableCell>
                        <TableCell className="text-[12px] text-slate-600">
                          {task.assignedTo === "Unassigned" ? (
                            <span className="text-slate-400 italic">
                              Unassigned
                            </span>
                          ) : (
                            task.assignedTo
                          )}
                        </TableCell>
                        <TableCell className="text-[12px] text-slate-600">
                          {task.dueDate}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={task.priority}
                            variant={priorityVariant(task.priority)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                              aria-label="Open actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-40"
                            >
                              <DropdownMenuItem
                                className="text-[12px] gap-2"
                                onClick={() => openView(task)}
                              >
                                <Eye className="h-3.5 w-3.5 text-teal-500" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-[12px] gap-2"
                                onClick={() => openAssign(task)}
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                                Assign
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-[12px] gap-2"
                                onClick={() => openEditDialog(task)}
                              >
                                <Pencil className="h-3.5 w-3.5 text-amber-600" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-[12px] gap-2"
                                onClick={() => handleDuplicate(task)}
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-[12px] gap-2 text-red-600 focus:text-red-600"
                                onClick={() => openDeleteDialog(task)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Pagination */}
          {!loading && totalTasks > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-[12px] text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-700">
                  {pageStart + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-700">
                  {Math.min(pageStart + pageSize, totalTasks)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-700">{totalTasks}</span>{" "}
                tasks
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="h-8 text-[11px] gap-1 rounded-lg"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Button>
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="h-8 w-8 text-[11px] rounded-lg"
                  >
                    {page}
                  </Button>
                ))}
                {totalPages > 5 && (
                  <span className="text-[11px] text-slate-400 px-1">...</span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="h-8 text-[11px] gap-1 rounded-lg"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ADD VIEW */}
        <TabsContent value="add" className="mt-4">
          <Card className="rounded-xl">
            <CardContent className="p-5">
              <h4 className="text-[14px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-teal-600" />
                Add New Task
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">
                      Task Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => {
                        setNewTask({ ...newTask, title: e.target.value });
                        setAddErrors((prev) => ({ ...prev, title: false }));
                      }}
                      className={`h-9 text-[13px] rounded-lg ${
                        addErrors.title
                          ? "border-red-400 ring-1 ring-red-200"
                          : ""
                      }`}
                      placeholder="e.g. Inspect fire panel"
                    />
                    {addErrors.title && (
                      <p className="text-[10px] text-red-500">
                        Title is required
                      </p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">
                      Due Date
                    </Label>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                      className="h-9 text-[13px] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] text-slate-600">
                    Description
                  </Label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Add any helpful detail..."
                    className="text-[13px] rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">
                      Department
                    </Label>
                    <Select
                      value={newTask.department}
                      onValueChange={(v) =>
                        setNewTask({ ...newTask, department: v ?? "" })
                      }
                    >
                      <SelectTrigger className="h-9 text-[13px] rounded-lg">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Operations",
                          "Maintenance",
                          "Housekeeping",
                          "Security",
                          "Electrical",
                        ].map((d) => (
                          <SelectItem
                            key={d}
                            value={d}
                            className="text-[12px]"
                          >
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">
                      Priority
                    </Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(v) =>
                        setNewTask({ ...newTask, priority: v ?? "Low" })
                      }
                    >
                      <SelectTrigger className="h-9 text-[13px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Low", "Medium", "High", "Critical"].map((p) => (
                          <SelectItem
                            key={p}
                            value={p}
                            className="text-[12px]"
                          >
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">Source</Label>
                    <Select
                      value={newTask.source}
                      onValueChange={(v) =>
                        setNewTask({
                          ...newTask,
                          source: v ?? "Routine Maintenance",
                        })
                      }
                    >
                      <SelectTrigger className="h-9 text-[13px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Routine Maintenance",
                          "Complaint",
                          "Inspection",
                          "Audit Finding",
                        ].map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-[12px]"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">
                      Responsibility
                    </Label>
                    <Select
                      value={newTask.responsibility}
                      onValueChange={(v) =>
                        setNewTask({
                          ...newTask,
                          responsibility: v ?? "Individual",
                        })
                      }
                    >
                      <SelectTrigger className="h-9 text-[13px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Individual", "Team", "Department"].map((r) => (
                          <SelectItem
                            key={r}
                            value={r}
                            className="text-[12px]"
                          >
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[12px] text-slate-600">
                      Eisenhower Matrix
                    </Label>
                    <Select
                      value={newTask.eisenhowerMatrix}
                      onValueChange={(v) =>
                        setNewTask({
                          ...newTask,
                          eisenhowerMatrix: v ?? "Urgent & Important",
                        })
                      }
                    >
                      <SelectTrigger className="h-9 text-[13px] rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Urgent & Important",
                          "Not Urgent & Important",
                          "Urgent & Not Important",
                          "Not Urgent & Not Important",
                        ].map((e) => (
                          <SelectItem
                            key={e}
                            value={e}
                            className="text-[12px]"
                          >
                            {e}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[12px] text-slate-600">
                    Attachments
                  </Label>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[12px] rounded-lg gap-1.5"
                      onClick={() =>
                        handleFileUpload(
                          ".jpg,.jpeg,.png,.pdf,.doc,.docx",
                          setAttachmentName
                        )
                      }
                    >
                      <Paperclip className="h-3.5 w-3.5" />
                      Choose files
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[12px] rounded-lg gap-1.5"
                      onClick={() =>
                        handleFileUpload("image/*", setAttachmentName)
                      }
                    >
                      <Camera className="h-3.5 w-3.5" />
                      Take Photo
                    </Button>
                    {attachmentName && (
                      <span className="text-[12px] text-slate-500 px-1">
                        {attachmentName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <Button
                    variant="outline"
                    onClick={() => setActiveView("list")}
                    className="h-9 text-[13px] rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddTask}
                    className="h-9 text-[13px] rounded-lg bg-teal-600 hover:bg-teal-700 text-white gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Task
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===== ASSIGN DIALOG ===== */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent
          className="sm:max-w-[420px] p-0 overflow-hidden"
          showCloseButton
        >
          <DialogHeader className="px-4 py-3 border-b border-slate-100">
            <DialogTitle className="text-[14px]">Assign Task</DialogTitle>
          </DialogHeader>
          <div className="px-4 pt-3 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <Input
                placeholder="Search employees..."
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                className="pl-9 h-9 text-[13px] rounded-lg"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-[320px] overflow-y-auto px-2 pb-3 space-y-0.5">
            {filteredEmployees.map((emp) => (
              <button
                key={emp}
                onClick={() => handleAssign(emp)}
                className="w-full text-left px-3 py-2 text-[13px] text-slate-700 hover:bg-teal-50 hover:text-teal-700 rounded-md transition-colors flex items-center gap-2"
              >
                <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-semibold shrink-0">
                  {emp[0]}
                </div>
                {emp}
              </button>
            ))}
            {filteredEmployees.length === 0 && (
              <p className="text-center text-[12px] text-slate-400 py-6">
                No employees found
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Task Details</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <div className="space-y-3 pt-1">
              <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 space-y-2">
                <Row label="Status">
                  <StatusBadge status={selectedTask.status} />
                </Row>
                <Row label="Priority">
                  <StatusBadge
                    status={selectedTask.priority}
                    variant={priorityVariant(selectedTask.priority)}
                  />
                </Row>
                <Row label="Assigned To">
                  <span className="text-[13px] text-slate-700">
                    {selectedTask.assignedTo}
                  </span>
                </Row>
                <Row label="Due Date">
                  <span className="text-[13px] text-slate-700">
                    {selectedTask.dueDate}
                  </span>
                </Row>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide mb-1">
                  Title
                </p>
                <p className="text-[13px] text-slate-800">
                  {selectedTask.title}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-600">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editForm.title}
                onChange={(e) => {
                  setEditForm({ ...editForm, title: e.target.value });
                  setEditErrors((prev) => ({ ...prev, title: false }));
                }}
                className={`h-9 text-[13px] rounded-lg ${
                  editErrors.title
                    ? "border-red-400 ring-1 ring-red-200"
                    : ""
                }`}
              />
              {editErrors.title && (
                <p className="text-[10px] text-red-500">Title is required</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[12px] text-slate-600">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, status: v ?? "" })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Pending", "In Progress", "Completed"].map((s) => (
                      <SelectItem key={s} value={s} className="text-[12px]">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[12px] text-slate-600">Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) =>
                    setEditForm({ ...editForm, priority: v ?? "" })
                  }
                >
                  <SelectTrigger className="h-9 text-[13px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Critical"].map((p) => (
                      <SelectItem key={p} value={p} className="text-[12px]">
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-600">Due Date</Label>
              <Input
                type="date"
                value={editForm.dueDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, dueDate: e.target.value })
                }
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditOpen(false);
                setEditErrors({});
              }}
              className="h-9 text-[13px] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              className="h-9 text-[13px] rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
            >
              Update Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Delete Task</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-slate-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-800">
              &ldquo;{selectedTask?.title}&rdquo;
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="h-9 text-[13px] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== BULK UPLOAD DIALOG ===== */}
      <Dialog open={bulkUploadOpen} onOpenChange={setBulkUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Bulk Upload Tasks</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg border border-blue-200 bg-teal-50 p-3">
              <p className="text-[12px] font-medium text-blue-800">
                Excel Format Required
              </p>
              <p className="text-[11px] text-teal-600 mt-0.5">
                Columns: Task Title, Description, Due Date, Department,
                Priority, Responsibility, Source
              </p>
              <Button
                variant="link"
                size="sm"
                className="text-teal-700 text-[11px] h-6 px-0 mt-1 gap-1"
                onClick={() => toast.success("Downloading template...")}
              >
                <Download className="h-3 w-3" />
                Download Template
              </Button>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] text-slate-600">
                Select Excel File
              </Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[12px] rounded-lg"
                  onClick={() =>
                    handleFileUpload(".xlsx,.xls,.csv", setBulkFileName)
                  }
                >
                  Choose file
                </Button>
                <span className="text-[12px] text-slate-500">
                  {bulkFileName || "No file chosen"}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setBulkUploadOpen(false);
                setBulkFileName(null);
              }}
              className="h-9 text-[13px] rounded-lg"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!bulkFileName) {
                  toast.error("Please select a file first");
                  return;
                }
                toast.success("Tasks uploaded successfully");
                setBulkUploadOpen(false);
                setBulkFileName(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-[13px] rounded-lg gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </div>
  );
}
