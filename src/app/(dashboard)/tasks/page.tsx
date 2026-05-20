"use client";

import { PageHeader } from "@/components/shared/page-header";
import { TasksTab } from "@/components/modules/daily-updates/tasks-tab";

export default function TaskManagementPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="Task Management"
        description="Create, assign, and track tasks across all sites"
      />
      <TasksTab />
    </div>
  );
}
