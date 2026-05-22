"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApi } from "@/hooks/use-api";
import type { UniformIssue } from "./mock-data";
import { MOCK_UNIFORM_ISSUES } from "./mock-data";

export function UniformTracker() {
  const {
    data: apiIssues,
    loading,
    error: apiError,
  } = useApi<any[]>({
    url: "/api/v1/inventory/uniforms",
    initialData: [],
  });

  const issues: UniformIssue[] = useMemo(() => {
    if (apiError || !apiIssues || apiIssues.length === 0) {
      return apiError ? MOCK_UNIFORM_ISSUES : (apiIssues ?? []).length === 0 ? MOCK_UNIFORM_ISSUES : [];
    }
    return apiIssues.map((r: any) => ({
      id: r.id,
      employeeId: r.employeeId ?? "",
      employeeName: r.employeeName ?? "",
      empId: r.empId ?? "",
      itemName: r.itemName ?? "",
      quantity: r.quantity ?? 0,
      issueDate: r.issueDate ?? "",
      deductionAmount: r.deductionAmount ?? 0,
      deductionStatus: r.deductionStatus ?? "pending",
    }));
  }, [apiIssues, apiError]);

  const columns: ColumnDef<UniformIssue>[] = [
    {
      accessorKey: "empId",
      header: "Emp ID",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-600">{row.original.empId}</span>
      ),
    },
    {
      accessorKey: "employeeName",
      header: "Employee",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900">{row.original.employeeName}</span>
      ),
    },
    {
      accessorKey: "itemName",
      header: "Uniform Item",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.itemName}</span>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-700">{row.original.quantity}</span>
      ),
    },
    {
      accessorKey: "issueDate",
      header: "Issue Date",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">{row.original.issueDate}</span>
      ),
    },
    {
      accessorKey: "deductionAmount",
      header: "Deduction",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-700">
          ₹{row.original.deductionAmount.toLocaleString("en-IN")}
        </span>
      ),
    },
    {
      accessorKey: "deductionStatus",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.deductionStatus;
        return (
          <StatusBadge
            status={s === "deducted" ? "Deducted" : "Pending"}
            variant={s === "deducted" ? "success" : "warning"}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-[13px] font-semibold text-slate-800">Uniform Issues</h4>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Track uniform issues and salary deductions
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
            <span className="text-[11px] text-slate-400">Loading...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={issues} searchKey="employeeName" searchPlaceholder="Search employee..." pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}
    </div>
  );
}
