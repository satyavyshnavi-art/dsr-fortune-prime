"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { DevicesTab, EnrollmentsTab, UnmappedGuestsTab } from "@/components/modules/biometric";
import { Fingerprint, Link2, UserX } from "lucide-react";

type TabId = "devices" | "enrollments" | "unmapped";

const tabs = [
  { id: "devices" as TabId, label: "Devices", icon: Fingerprint },
  { id: "enrollments" as TabId, label: "Enrollments", icon: Link2 },
  { id: "unmapped" as TabId, label: "Unmapped Queue", icon: UserX },
];

export default function BiometricDevicesPage() {
  const [activeTab, setActiveTab] = useState<TabId>("devices");

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Biometric Devices"
        description="Register ZKTeco / eSSL units, link device users to employees, and review unmapped punches."
      />

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
        {activeTab === "devices" && <DevicesTab />}
        {activeTab === "enrollments" && <EnrollmentsTab />}
        {activeTab === "unmapped" && <UnmappedGuestsTab />}
      </div>
    </div>
  );
}
