"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { AlertsList } from "@/components/modules/alerts/alerts-list";
import { AlertConfiguration } from "@/components/modules/alerts/alert-configuration";
import { Bell, Settings } from "lucide-react";

type TabId = "alerts" | "configuration";

const tabs = [
  { id: "alerts" as TabId, label: "Alerts", icon: Bell },
  { id: "configuration" as TabId, label: "Configuration", icon: Settings },
];

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("alerts");

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Alerts" />

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
        {activeTab === "alerts" && <AlertsList />}
        {activeTab === "configuration" && <AlertConfiguration />}
      </div>
    </div>
  );
}
