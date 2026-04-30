"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  BarChart3,
  LineChart,
  FileText,
  RefreshCw,
} from "lucide-react";
import { KPITrafficLight } from "@/components/modules/reports/kpi-traffic-light";
import { AnalyticsTab } from "@/components/modules/reports/analytics-tab";
import { ReportsTab } from "@/components/modules/reports/reports-tab";

type TabId = "dashboard" | "analytics" | "reports";

const tabs = [
  { id: "dashboard" as TabId, label: "Dashboard", icon: BarChart3 },
  { id: "analytics" as TabId, label: "Analytics", icon: LineChart },
  { id: "reports" as TabId, label: "Reports", icon: FileText },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [dateFrom] = useState("29-Mar-26");
  const [dateTo] = useState("27-Apr-26");

  const dateRange = `2026-03-29 \u2192 2026-04-27`;

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Reports"
        actions={
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        }
      />

      {/* Date Range Display */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-medium">{dateFrom}</span>
        <span className="text-slate-300">&rarr;</span>
        <span className="font-medium">{dateTo}</span>
      </div>

      {/* Tabs */}
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
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === "dashboard" && (
          <KPITrafficLight dateRange={dateRange} />
        )}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "reports" && <ReportsTab />}
      </div>
    </div>
  );
}
