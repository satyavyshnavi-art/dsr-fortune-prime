"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  UserPlus,
  ArrowUpCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "./mock-data";
import { DEPARTMENTS, STATUS_LABELS, PRIORITY_LABELS, EMPLOYEES } from "./mock-data";

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  apiError?: string | null;
  onViewDetail: (task: Task) => void;
  onEdit: (task: Task) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void | Promise<void>;
  onDelete?: (taskId: string) => void | Promise<void>;
  onRefetch?: () => void | Promise<void>;
  filterAssignee?: string;
}

const PRIORITY_BADGE_VARIANT: Record<TaskPriority, "neutral" | "purple" | "warning" | "danger"> = {
  low: "neutral",
  medium: "purple",
  high: "warning",
  critical: "danger",
};

export function TaskList({
  tasks,
  loading,
  apiError,
  onViewDetail,
  onEdit,
  onStatusChange,
  onDelete,
  onRefetch,
  filterAssignee,
}: TaskListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [reassignTask, setReassignTask] = useState<Task | null>(null);
  const [reassignTo, setReassignTo] = useState<string>("");
  const [reassignSaving, setReassignSaving] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const filtered = useMemo(() => {
    let result = tasks;
    if (filterAssignee) {
      result = result.filter((t) => t.assignedTo === filterAssignee);
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (priorityFilter !== "all") {
      result = result.filter((t) => t.priority === priorityFilter);
    }
    if (departmentFilter !== "all") {
      result = result.filter((t) => t.department === departmentFilter);
    }
    return result;
  }, [tasks, statusFilter, priorityFilter, departmentFilter, filterAssignee]);

  const openReassign = (task: Task) => {
    setReassignTask(task);
    setReassignTo(task.assignedTo || "");
  };

  const closeReassign = () => {
    setReassignTask(null);
    setReassignTo("");
  };

  const handleReassignSave = async () => {
    if (!reassignTask) return;
    if (!reassignTo) {
      toast.error("Please select an employee");
      return;
    }
    setReassignSaving(true);
    try {
      const res = await fetch(`/api/v1/tasks/${reassignTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: reassignTo }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err?.error?.message ||
          (typeof err?.error === "string" ? err.error : null) ||
          `Failed to reassign (${res.status})`;
        toast.error(typeof message === "string" ? message : "Failed to reassign");
        return;
      }
      toast.success(`Task reassigned to ${reassignTo}`);
      if (onRefetch) await onRefetch();
      closeReassign();
    } catch {
      toast.error("Network error — could not reach API");
    } finally {
      setReassignSaving(false);
    }
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <p className="font-medium text-[12px] text-slate-900 truncate max-w-[240px]">
            {row.original.title}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{row.original.department}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "assignedTo",
      header: "Assigned To",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">
          {row.original.assignedTo || "Unassigned"}
        </span>
      ),
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const isOverdue =
          row.original.dueDate < today &&
          row.original.status !== "completed" &&
          row.original.status !== "cancelled";
        return (
          <span className={`text-[12px] ${isOverdue ? "text-red-600 font-semibold" : "text-slate-500"}`}>
            {row.original.dueDate}
          </span>
        );
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.priority}
          variant={PRIORITY_BADGE_VARIANT[row.original.priority]}
        />
      ),
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const checklist = row.original.checklist ?? [];
        if (checklist.length === 0) {
          return <span className="text-[10px] text-slate-400">No checklist</span>;
        }
        const checked = checklist.filter((c) => c.isChecked).length;
        const total = checklist.length;
        const pct = Math.round((checked / total) * 100);
        return (
          <div className="min-w-[80px]">
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1.5 bg-slate-100 rounded-full">
                <div
                  className="h-1.5 bg-green-500 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 shrink-0">{checked}/{total}</span>
            </div>
          </div>
        );
      },
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
            onClick={() => onViewDetail(row.original)}
          >
            <Eye className="h-3 w-3 text-blue-500" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3 w-3 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                className="text-[12px] gap-2"
                onClick={() => onEdit(row.original)}
              >
                <Edit className="h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[12px] gap-2"
                onClick={() => openReassign(row.original)}
              >
                <UserPlus className="h-3 w-3" />
                Reassign
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[12px] gap-2"
                onClick={() => onStatusChange?.(row.original.id, "in_progress")}
              >
                <ArrowUpCircle className="h-3 w-3" />
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[12px] gap-2"
                onClick={() => onStatusChange?.(row.original.id, "completed")}
              >
                <ArrowUpCircle className="h-3 w-3 text-green-500" />
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[12px] gap-2 text-red-600"
                onClick={() => onDelete?.(row.original.id)}
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-8 w-[140px] text-[12px] rounded-lg">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Status</SelectItem>
            {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-[12px]">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-8 w-[130px] text-[12px] rounded-lg">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Priority</SelectItem>
            {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key} className="text-[12px]">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="h-8 w-[150px] text-[12px] rounded-lg">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d} className="text-[12px]">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <span className="text-[11px] text-slate-400">Loading tasks...</span>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchKey="title"
          searchPlaceholder="Search tasks..."
          pageSize={10}
        />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}

      {/* Reassign dialog */}
      <Dialog
        open={!!reassignTask}
        onOpenChange={(open) => {
          if (!open) closeReassign();
        }}
      >
        <DialogContent className="sm:max-w-[420px] p-5" showCloseButton>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-[14px] font-semibold text-slate-800">
              Reassign Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {reassignTask && (
              <div className="bg-slate-50 rounded-lg p-2.5">
                <p className="text-[12px] font-medium text-slate-800 truncate">
                  {reassignTask.title}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Currently assigned to:{" "}
                  <span className="font-medium">
                    {reassignTask.assignedTo || "Unassigned"}
                  </span>
                </p>
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Assign to <span className="text-red-500">*</span>
              </Label>
              <Select value={reassignTo} onValueChange={(v) => setReassignTo(v ?? "")}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((emp) => (
                    <SelectItem key={emp} value={emp} className="text-[12px]">
                      {emp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button
                variant="outline"
                className="h-8 text-[12px] px-3"
                onClick={closeReassign}
                disabled={reassignSaving}
              >
                Cancel
              </Button>
              <Button
                className="h-8 text-[12px] px-3 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleReassignSave}
                disabled={!reassignTo || reassignSaving}
              >
                {reassignSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
