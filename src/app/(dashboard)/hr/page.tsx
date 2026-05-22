"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import {
  RequirementsBoard,
  CandidatesTracker,
  InterviewForm,
  GoalsTab,
  LifecycleTimeline,
} from "@/components/modules/hr";
import {
  Briefcase,
  Users,
  ClipboardList,
  Target,
  History,
  Plus,
} from "lucide-react";

type TabId = "requirements" | "candidates" | "goals" | "lifecycle";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "requirements", label: "Job Requirements", icon: Briefcase },
  { id: "candidates", label: "Candidates", icon: Users },
  { id: "goals", label: "Goals & Evaluation", icon: Target },
  { id: "lifecycle", label: "Employee Lifecycle", icon: History },
];

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<TabId>("requirements");
  const [showInterview, setShowInterview] = useState(false);

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="HR Module"
        actions={
          activeTab === "candidates" ? (
            <Button
              className="h-7 text-[11px] px-2.5 gap-1 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => setShowInterview(true)}
            >
              <Plus className="h-3 w-3" />
              Record Interview
            </Button>
          ) : undefined
        }
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

      {/* Tab Content */}
      <div>
        {activeTab === "requirements" && <RequirementsBoard />}
        {activeTab === "candidates" && <CandidatesTracker />}
        {activeTab === "goals" && <GoalsTab />}
        {activeTab === "lifecycle" && <LifecycleTimeline />}
      </div>

      {/* Interview Form Dialog */}
      <InterviewForm open={showInterview} onOpenChange={setShowInterview} />
    </div>
  );
}
