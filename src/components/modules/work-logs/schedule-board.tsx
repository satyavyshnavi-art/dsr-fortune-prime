"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApi } from "@/hooks/use-api";

interface Schedule {
  id: string;
  title: string;
  frequency: string | null;
  startDate: string | null;
  endDate: string | null;
  assignedTo: string | null;
  createdAt: string;
}

const FREQUENCY_ORDER = ["daily", "weekly", "fortnightly", "monthly", "quarterly", "half_yearly", "annual"];

export function ScheduleBoard() {
  const { data: apiResponse, loading, error } = useApi<{ data: Schedule[] }>({
    url: "/api/v1/schedules",
    initialData: { data: [] },
  });

  const schedules = useMemo(() => {
    const items = apiResponse?.data ?? [];
    return [...items].sort((a, b) => {
      const ai = FREQUENCY_ORDER.indexOf(a.frequency ?? "");
      const bi = FREQUENCY_ORDER.indexOf(b.frequency ?? "");
      return ai - bi;
    });
  }, [apiResponse]);

  const columns: ColumnDef<Schedule>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => (
        <StatusBadge status={row.original.frequency ?? "unknown"} variant="info" />
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-600">
          {row.original.startDate ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "endDate",
      header: "End",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-600">
          {row.original.endDate ?? "—"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const now = new Date().toISOString().split("T")[0];
        const end = row.original.endDate;
        if (end && end < now) return <StatusBadge status="completed" />;
        const start = row.original.startDate;
        if (start && start > now) return <StatusBadge status="pending" />;
        return <StatusBadge status="active" variant="success" />;
      },
    },
  ];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
            <span className="text-[11px] text-slate-400">Loading schedules...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={schedules} searchKey="title" searchPlaceholder="Search schedules..." pageSize={10} />
      )}

      {error && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable. {error}
        </p>
      )}
    </div>
  );
}
