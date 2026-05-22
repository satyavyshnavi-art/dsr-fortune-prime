"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApi } from "@/hooks/use-api";
import type { Candidate } from "./mock-data";
import { MOCK_CANDIDATES } from "./mock-data";

const statusVariantMap: Record<string, "info" | "warning" | "purple" | "success" | "danger"> = {
  applied: "info",
  interviewed: "warning",
  offered: "purple",
  joined: "success",
  rejected: "danger",
};

export function CandidatesTracker() {
  const {
    data: apiResponse,
    loading,
    error: apiError,
  } = useApi<any>({
    url: "/api/v1/hr/candidates",
    initialData: [],
  });

  const candidates: Candidate[] = useMemo(() => {
    const apiCandidates: any[] = Array.isArray(apiResponse)
      ? apiResponse
      : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];
    if (apiError || apiCandidates.length === 0) return MOCK_CANDIDATES;
    return apiCandidates.map((r: any) => ({
      id: r.id,
      name: r.name ?? "",
      email: r.email ?? "",
      phone: r.phone ?? "",
      requirementId: r.requirementId ?? "",
      requirementTitle: r.requirementTitle ?? "",
      status: r.status ?? "applied",
      appliedAt: r.appliedAt ?? "",
      interviewDate: r.interviewDate ?? null,
      interviewScore: r.interviewScore ?? null,
      recommendation: r.recommendation ?? null,
    }));
  }, [apiResponse, apiError]);

  const columns: ColumnDef<Candidate>[] = [
    {
      accessorKey: "name",
      header: "Candidate",
      cell: ({ row }) => (
        <div>
          <span className="font-medium text-[12px] text-slate-900">{row.original.name}</span>
          <p className="text-[10px] text-slate-400">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "requirementTitle",
      header: "Position",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.requirementTitle}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          variant={statusVariantMap[row.original.status] ?? "neutral"}
        />
      ),
    },
    {
      accessorKey: "appliedAt",
      header: "Applied",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">{row.original.appliedAt}</span>
      ),
    },
    {
      accessorKey: "interviewDate",
      header: "Interview",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">
          {row.original.interviewDate ?? "-"}
        </span>
      ),
    },
    {
      accessorKey: "interviewScore",
      header: "Score",
      cell: ({ row }) => {
        const score = row.original.interviewScore;
        if (score === null) return <span className="text-[12px] text-slate-300">-</span>;
        const color = score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-600" : "text-red-600";
        return <span className={`text-[12px] font-mono ${color}`}>{score}</span>;
      },
    },
    {
      accessorKey: "recommendation",
      header: "Rec.",
      cell: ({ row }) => {
        const rec = row.original.recommendation;
        if (!rec) return <span className="text-[12px] text-slate-300">-</span>;
        const labels: Record<string, string> = {
          strong_yes: "Strong Yes",
          yes: "Yes",
          maybe: "Maybe",
          no: "No",
        };
        const variants: Record<string, "success" | "warning" | "danger" | "info"> = {
          strong_yes: "success",
          yes: "success",
          maybe: "warning",
          no: "danger",
        };
        return <StatusBadge status={labels[rec] ?? rec} variant={variants[rec] ?? "neutral"} />;
      },
    },
  ];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
            <span className="text-[11px] text-slate-400">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={candidates} searchKey="name" searchPlaceholder="Search candidates..." pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}
    </div>
  );
}
