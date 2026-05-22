"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { KPICard } from "@/components/shared/kpi-card";
import {
  ApprovalsList,
  SubmitRequest,
  RequestDetail,
} from "@/components/modules/approvals";
import { MOCK_REQUESTS, type ApprovalRequest } from "@/components/modules/approvals/mock-data";
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  BarChart3,
  ListChecks,
  PlusCircle,
} from "lucide-react";

type TabId = "requests" | "submit";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "requests", label: "Approval Requests", icon: ListChecks },
  { id: "submit", label: "Submit Request", icon: PlusCircle },
];

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("requests");
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // KPI calculations
  const pendingCount = MOCK_REQUESTS.filter((r) => r.status === "pending").length;
  const approvedCount = MOCK_REQUESTS.filter((r) => r.status === "approved").length;
  const totalCount = MOCK_REQUESTS.length;
  const approvalRate =
    totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
  // Average turnaround mock: 1.5 days
  const avgTurnaround = "1.5 days";

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Approval Workflows" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Pending Count"
          value={pendingCount}
          icon={Clock}
          color="yellow"
        />
        <KPICard
          title="Avg Turnaround"
          value={avgTurnaround}
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="Approval Rate"
          value={`${approvalRate}%`}
          icon={CheckCircle2}
          color="green"
        />
        <KPICard
          title="This Month Total"
          value={totalCount}
          icon={BarChart3}
          color="slate"
        />
      </div>

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
        {activeTab === "requests" && (
          <ApprovalsList
            onViewDetail={(req) => {
              setSelectedRequest(req);
              setShowDetail(true);
            }}
          />
        )}
        {activeTab === "submit" && <SubmitRequest />}
      </div>

      {/* Detail Modal */}
      <RequestDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        request={selectedRequest}
      />
    </div>
  );
}
