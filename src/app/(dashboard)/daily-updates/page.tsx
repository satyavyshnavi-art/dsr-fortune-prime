"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { UpdateTab } from "@/components/modules/daily-updates/update-tab";
import { HygieneTab } from "@/components/modules/daily-updates/hygiene-tab";
import { PowerTab } from "@/components/modules/daily-updates/power-tab";
import { WaterTab } from "@/components/modules/daily-updates/water-tab";
import { ComplaintsTab } from "@/components/modules/daily-updates/complaints-tab";
import { TasksTab } from "@/components/modules/daily-updates/tasks-tab";
import { ProjectsTab } from "@/components/modules/daily-updates/projects-tab";
import { VendorTab } from "@/components/modules/daily-updates/vendor-tab";
import {
  RefreshCw,
  ClipboardList,
  Zap,
  Droplets,
  MessageSquareWarning,
  ListTodo,
  FolderKanban,
  Ticket,
  CalendarDays,
} from "lucide-react";

type TabKey =
  | "update"
  | "hygiene"
  | "power"
  | "water"
  | "complaints"
  | "tasks"
  | "projects"
  | "vendor";

const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "update", label: "Update", icon: RefreshCw },
  { key: "hygiene", label: "Hygiene", icon: ClipboardList },
  { key: "power", label: "Power", icon: Zap },
  { key: "water", label: "Water", icon: Droplets },
  { key: "complaints", label: "Complaints", icon: MessageSquareWarning },
  { key: "tasks", label: "Tasks", icon: ListTodo },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "vendor", label: "Vendor", icon: Ticket },
];

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);
  return `${day}-${month}-${year}`;
}

export default function DailyUpdatesPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("update");
  const today = formatDate(new Date());

  return (
    <div className="p-5 space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <PageHeader title="Daily Updates" />
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" />
          {today}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-0.5 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? "border-blue-600 text-blue-600 bg-blue-50/60 rounded-t-md"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-md"
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
        {activeTab === "update" && <UpdateTab />}
        {activeTab === "hygiene" && <HygieneTab />}
        {activeTab === "power" && <PowerTab />}
        {activeTab === "water" && <WaterTab />}
        {activeTab === "complaints" && <ComplaintsTab />}
        {activeTab === "tasks" && <TasksTab />}
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "vendor" && <VendorTab />}
      </div>
    </div>
  );
}
