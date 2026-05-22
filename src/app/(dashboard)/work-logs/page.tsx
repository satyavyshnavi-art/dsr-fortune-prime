"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import {
  LogEntryForm,
  LogHistory,
  ScheduleBoard,
  VendorEvaluation,
  SnagList,
  PerformanceDashboard,
} from "@/components/modules/work-logs";
import {
  ClipboardEdit,
  History,
  CalendarClock,
  Star,
  AlertTriangle,
  BarChart3,
} from "lucide-react";

type TabId = "log_entry" | "log_history" | "schedules" | "vendor_eval" | "snags" | "performance";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "log_entry", label: "Log Entry", icon: ClipboardEdit },
  { id: "log_history", label: "Log History", icon: History },
  { id: "schedules", label: "Schedules", icon: CalendarClock },
  { id: "vendor_eval", label: "Vendor Evaluations", icon: Star },
  { id: "snags", label: "Snag List", icon: AlertTriangle },
  { id: "performance", label: "Performance", icon: BarChart3 },
];

export default function WorkLogsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("log_entry");

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Work Logs & Schedules" />

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
        {activeTab === "log_entry" && <LogEntryForm />}
        {activeTab === "log_history" && <LogHistory />}
        {activeTab === "schedules" && <ScheduleBoard />}
        {activeTab === "vendor_eval" && <VendorEvaluation />}
        {activeTab === "snags" && <SnagList />}
        {activeTab === "performance" && <PerformanceDashboard />}
      </div>
    </div>
  );
}
