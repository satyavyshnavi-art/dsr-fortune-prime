"use client";

import { useState } from "react";
import { PageHeader, EmptyState } from "@/components/shared";
import { FacilityDetailsForm } from "@/components/modules/facility-config/facility-details-form";
import { DailyUpdateConfig } from "@/components/modules/facility-config/daily-update-config";
import { Settings, CalendarDays, Users, Truck } from "lucide-react";

type TabId = "config" | "daily-update" | "employee" | "service-provider";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "config", label: "Facility Config", icon: Settings },
  { id: "daily-update", label: "Daily Update", icon: CalendarDays },
  { id: "employee", label: "Employee", icon: Users },
  { id: "service-provider", label: "Service Provider", icon: Truck },
];

export default function FacilityConfigPage() {
  const [activeTab, setActiveTab] = useState<TabId>("config");

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Facility Config" />

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
        {activeTab === "config" && <FacilityDetailsForm />}
        {activeTab === "daily-update" && <DailyUpdateConfig />}
        {activeTab === "employee" && (
          <EmptyState icon={Users} title="Employee Configuration" description="Employee management settings will be configured here." />
        )}
        {activeTab === "service-provider" && (
          <EmptyState icon={Truck} title="Service Provider Configuration" description="Manage your facility service providers and vendor contacts here." />
        )}
      </div>
    </div>
  );
}
