"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { DeviceManager, ThresholdConfig } from "@/components/modules/iot";
import { Cpu, Gauge } from "lucide-react";

type TabId = "devices" | "thresholds";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "devices", label: "Devices", icon: Cpu },
  { id: "thresholds", label: "Thresholds", icon: Gauge },
];

export default function IoTPage() {
  const [activeTab, setActiveTab] = useState<TabId>("devices");

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="IoT Device Management" />

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
                  ? "border-violet-600 text-violet-600"
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
        {activeTab === "devices" && <DeviceManager />}
        {activeTab === "thresholds" && <ThresholdConfig />}
      </div>
    </div>
  );
}
