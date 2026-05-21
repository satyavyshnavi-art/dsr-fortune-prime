"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import type { JobRequirement } from "./mock-data";
import { MOCK_REQUIREMENTS, DEPARTMENTS } from "./mock-data";

export function RequirementsBoard() {
  const {
    data: apiResponse,
    loading,
    error: apiError,
  } = useApi<any>({
    url: "/api/v1/hr/requirements",
    initialData: [],
  });

  const requirements: JobRequirement[] = useMemo(() => {
    const apiReqs: any[] = Array.isArray(apiResponse)
      ? apiResponse
      : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];
    if (apiError || apiReqs.length === 0) return MOCK_REQUIREMENTS;
    return apiReqs.map((r: any) => ({
      id: r.id,
      title: r.title ?? "",
      department: r.department ?? "",
      positions: r.positions ?? 0,
      filled: r.filled ?? 0,
      status: r.status ?? "open",
      postedAt: r.postedAt ?? "",
    }));
  }, [apiResponse, apiError]);

  const [deptFilter, setDeptFilter] = useState("all");

  const filtered = requirements.filter(
    (r) => deptFilter === "all" || r.department === deptFilter
  );

  const columns: ColumnDef<JobRequirement>[] = [
    {
      accessorKey: "title",
      header: "Position",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "department",
      header: "Department",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.department}</span>
      ),
    },
    {
      accessorKey: "positions",
      header: "Positions",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-700">
          {row.original.filled}/{row.original.positions}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        const variant =
          s === "filled" ? "success" : s === "in_progress" ? "info" : s === "cancelled" ? "danger" : "warning";
        return <StatusBadge status={s} variant={variant} />;
      },
    },
    {
      accessorKey: "postedAt",
      header: "Posted",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">{row.original.postedAt}</span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? "all")}>
          <SelectTrigger className="w-[180px] h-8 text-[12px]">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Departments</SelectItem>
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d} className="text-[12px]">{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-slate-400">{filtered.length} requirements</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <span className="text-[11px] text-slate-400">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filtered} searchKey="title" searchPlaceholder="Search positions..." pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}
    </div>
  );
}
