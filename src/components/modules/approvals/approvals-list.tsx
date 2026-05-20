"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import {
  ApprovalRequest,
  MOCK_REQUESTS,
  REQUEST_TYPE_LABELS,
} from "./mock-data";

type FilterTab = "all" | "pending" | "approved" | "rejected";

interface ApprovalsListProps {
  onViewDetail: (request: ApprovalRequest) => void;
}

export function ApprovalsList({ onViewDetail }: ApprovalsListProps) {
  const {
    data: apiRequests,
    loading,
    error: apiError,
  } = useApi<any[]>({
    url: "/api/v1/approvals",
    initialData: [],
  });

  const requests: ApprovalRequest[] = useMemo(() => {
    if (apiError || !apiRequests || apiRequests.length === 0) {
      return apiError
        ? MOCK_REQUESTS
        : (apiRequests ?? []).length === 0
        ? MOCK_REQUESTS
        : [];
    }
    return apiRequests.map((r: any) => ({
      id: r.id,
      type: r.type ?? "advance",
      title: r.title ?? "",
      description: r.description ?? "",
      amount: r.amount ?? 0,
      requestedBy: r.requestedBy ?? "",
      requestedAt: r.requestedAt ?? "",
      status: r.status ?? "pending",
      currentStep: r.currentStep ?? 0,
      steps: r.steps ?? [],
    }));
  }, [apiRequests, apiError]);

  const [activeTab, setActiveTab] = useState<FilterTab>("all");

  const filtered = requests.filter(
    (r) => activeTab === "all" || r.status === activeTab
  );

  const tabCounts = {
    all: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  const filterTabs: { id: FilterTab; label: string }[] = [
    { id: "all", label: `All (${tabCounts.all})` },
    { id: "pending", label: `Pending (${tabCounts.pending})` },
    { id: "approved", label: `Approved (${tabCounts.approved})` },
    { id: "rejected", label: `Rejected (${tabCounts.rejected})` },
  ];

  const columns: ColumnDef<ApprovalRequest>[] = [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <StatusBadge
          status={REQUEST_TYPE_LABELS[row.original.type] ?? row.original.type}
          variant="info"
        />
      ),
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900 truncate max-w-[200px] block">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-700">
          ₹{row.original.amount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "requestedBy",
      header: "Requested By",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.requestedBy}</span>
      ),
    },
    {
      accessorKey: "requestedAt",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">{row.original.requestedAt}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <StatusBadge
            status={s}
            variant={
              s === "approved" ? "success" : s === "rejected" ? "danger" : "warning"
            }
          />
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onViewDetail(row.original)}
        >
          <Eye className="h-3 w-3 text-blue-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b overflow-x-auto pb-px">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <span className="text-[11px] text-slate-400">Loading approvals...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} searchKey="title" searchPlaceholder="Search requests..." pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}
    </div>
  );
}
