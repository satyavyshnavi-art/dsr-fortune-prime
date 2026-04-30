"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import {
  AssetDashboard,
  AssetCategories,
  AssetChecklists,
  AMCContracts,
  BreakdownService,
  GatePassManagement,
  PPMSchedule,
  AssetAudit,
} from "@/components/modules/assets";
import {
  LayoutGrid,
  CheckSquare,
  BarChart3,
  FileText,
  Wrench,
  ArrowRightLeft,
  Calendar,
  ClipboardCheck,
} from "lucide-react";

type TabId =
  | "categories"
  | "checklists"
  | "dashboard"
  | "amc"
  | "breakdown"
  | "gate-pass"
  | "ppm"
  | "audit";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "categories", label: "Asset Categories", icon: LayoutGrid },
  { id: "checklists", label: "Checklists", icon: CheckSquare },
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "amc", label: "AMC Contracts", icon: FileText },
  { id: "breakdown", label: "Breakdown", icon: Wrench },
  { id: "gate-pass", label: "Gate Pass", icon: ArrowRightLeft },
  { id: "ppm", label: "52 Week PPM", icon: Calendar },
  { id: "audit", label: "Asset Audit", icon: ClipboardCheck },
];

export default function AssetManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>("categories");

  return (
    <div className="p-5 space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Asset Management"
      />

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

      {/* Tab Content */}
      <div>
        {activeTab === "categories" && <AssetCategories />}
        {activeTab === "checklists" && <AssetChecklists />}
        {activeTab === "dashboard" && <AssetDashboard />}
        {activeTab === "amc" && <AMCContracts />}
        {activeTab === "breakdown" && <BreakdownService />}
        {activeTab === "gate-pass" && <GatePassManagement />}
        {activeTab === "ppm" && <PPMSchedule />}
        {activeTab === "audit" && <AssetAudit />}
      </div>
    </div>
  );
}
