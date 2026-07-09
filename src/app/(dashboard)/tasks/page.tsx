"use client";

import { useState, useMemo, useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { DataTable } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import {
  TaskDashboard,
  TaskList,
  TaskDetail,
  TaskForm,
  TaskTemplates,
} from "@/components/modules/tasks";
import { MOCK_TASKS, type Task, type TaskStatus } from "@/components/modules/tasks/mock-data";
import {
  ListChecks,
  User,
  LayoutTemplate,
  AlertTriangle,
  PlusCircle,
} from "lucide-react";

type TabId = "all" | "my" | "templates" | "escalations";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "all", label: "All Tasks", icon: ListChecks },
  { id: "my", label: "My Tasks", icon: User },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "escalations", label: "Escalations", icon: AlertTriangle },
];

// Mock current user for "My Tasks" tab
const CURRENT_USER = "Priya Sharma";

export default function TaskManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);

  const {
    data: apiTasks,
    loading,
    error: apiError,
    fetchData: refetchTasks,
    create: createTask,
    update: updateTask,
    remove: removeTask,
  } = useApi<Task[]>({
    url: "/api/v1/tasks",
    initialData: [],
  });

  // Single source of truth for tasks across all tabs.
  // API responses don't include the related arrays (checklist/comments/
  // escalations live in separate tables); normalize so the UI can rely
  // on them existing.
  const tasks: Task[] = useMemo(() => {
    const source =
      apiError || !apiTasks || apiTasks.length === 0 ? MOCK_TASKS : apiTasks;
    return source.map((t) => ({
      ...t,
      checklist: t.checklist ?? [],
      comments: t.comments ?? [],
      escalations: t.escalations ?? [],
      attachments: t.attachments ?? [],
    }));
  }, [apiTasks, apiError]);

  // Fetch first facility once for create POSTs that require a facilityId UUID.
  useEffect(() => {
    fetch("/api/v1/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFacilityId(data[0].id);
          setOrgId(data[0].orgId ?? null);
        }
      })
      .catch(() => {});
  }, []);

  const escalatedTasks = useMemo(
    () => tasks.filter((t) => t.escalations?.length > 0),
    [tasks]
  );

  const escalationColumns: ColumnDef<Task>[] = [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-[12px] text-slate-900 truncate max-w-[200px]">
            {row.original.title}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{row.original.department}</p>
        </div>
      ),
    },
    {
      id: "escalationReason",
      header: "Reason",
      cell: ({ row }) => {
        const latest = row.original.escalations[row.original.escalations.length - 1];
        return (
          <span className="text-[12px] text-slate-600 truncate max-w-[200px] block">
            {latest?.reason ?? "-"}
          </span>
        );
      },
    },
    {
      id: "escalatedTo",
      header: "Escalated To",
      cell: ({ row }) => {
        const latest = row.original.escalations[row.original.escalations.length - 1];
        return (
          <span className="text-[12px] text-slate-600">
            {latest?.escalatedToName ?? "-"}
          </span>
        );
      },
    },
    {
      id: "escalatedAt",
      header: "Escalated At",
      cell: ({ row }) => {
        const latest = row.original.escalations[row.original.escalations.length - 1];
        return (
          <span className="text-[12px] text-slate-500">
            {latest ? new Date(latest.escalatedAt).toLocaleDateString() : "-"}
          </span>
        );
      },
    },
    {
      id: "resolution",
      header: "Resolution",
      cell: ({ row }) => {
        const latest = row.original.escalations[row.original.escalations.length - 1];
        return (
          <StatusBadge
            status={latest?.resolvedAt ? "Resolved" : "Open"}
            variant={latest?.resolvedAt ? "success" : "warning"}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header: "Task Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
  ];

  const handleViewDetail = (task: Task) => {
    setSelectedTask(task);
    setShowDetail(true);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleNewTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    toast.success(`Task marked ${newStatus.replace(/_/g, " ")}`);
    updateTask(taskId, { status: newStatus }).catch(() => {
      toast.error("Failed to update status");
      refetchTasks();
    });
  };

  const handleReassign = (taskId: string, assignedTo: string) =>
    updateTask(taskId, { assignedTo });

  const handleDelete = async (taskId: string) => {
    try {
      await removeTask(taskId);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    }
  };

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Task Management"
        description="Create, assign, and track tasks across all sites"
        actions={
          <Button
            className="h-8 text-[12px] px-3 gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white"
            onClick={handleNewTask}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Task
          </Button>
        }
      />

      {/* KPI Cards */}
      <TaskDashboard tasks={tasks} />

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "all" && (
          <TaskList
            tasks={tasks}
            loading={loading}
            apiError={apiError}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReassign={handleReassign}
            onRefetch={refetchTasks}
          />
        )}
        {activeTab === "my" && (
          <TaskList
            tasks={tasks}
            loading={loading}
            apiError={apiError}
            onViewDetail={handleViewDetail}
            onEdit={handleEdit}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onReassign={handleReassign}
            onRefetch={refetchTasks}
            filterAssignee={CURRENT_USER}
          />
        )}
        {activeTab === "templates" && (
          <TaskTemplates facilityId={facilityId} orgId={orgId} />
        )}
        {activeTab === "escalations" && (
          <div className="space-y-3">
            <p className="text-[12px] text-slate-500">
              {escalatedTasks.length} tasks with escalation history
            </p>
            <DataTable
              columns={escalationColumns}
              data={escalatedTasks}
              searchKey="title"
              searchPlaceholder="Search escalated tasks..."
              pageSize={10}
            />
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <TaskDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        task={selectedTask}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onRefresh={refetchTasks}
      />

      {/* Create/Edit Form Dialog */}
      <TaskForm
        open={showForm}
        onOpenChange={setShowForm}
        task={editingTask}
        facilityId={facilityId}
        onCreate={createTask}
        onUpdate={updateTask}
      />
    </div>
  );
}
