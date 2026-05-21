"use client";

import { KPICard } from "@/components/shared/kpi-card";
import {
  ListChecks,
  Clock,
  PlayCircle,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import type { Task } from "./mock-data";

interface TaskDashboardProps {
  tasks: Task[];
}

export function TaskDashboard({ tasks }: TaskDashboardProps) {
  const today = new Date().toISOString().split("T")[0];

  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "unassigned").length;
  const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = tasks.filter(
    (t) => t.dueDate < today && t.status !== "completed" && t.status !== "cancelled"
  ).length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
      <KPICard
        title="Total Tasks"
        value={totalCount}
        icon={ListChecks}
        color="slate"
      />
      <KPICard
        title="Pending"
        value={pendingCount}
        icon={Clock}
        color="yellow"
      />
      <KPICard
        title="In Progress"
        value={inProgressCount}
        icon={PlayCircle}
        color="blue"
      />
      <KPICard
        title="Completed"
        value={completedCount}
        subtitle={`${completionPct}% completion rate`}
        icon={CheckCircle2}
        color="green"
      />
      <KPICard
        title="Overdue"
        value={overdueCount}
        icon={AlertTriangle}
        color="red"
      />
    </div>
  );
}
