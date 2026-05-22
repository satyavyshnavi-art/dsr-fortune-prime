"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";

interface WorkLog {
  id: string;
  assetCategory: string | null;
  logDate: string | null;
  shift: string | null;
  readings: Record<string, unknown> | null;
  loggedBy: string | null;
  createdAt: string;
}

const CATEGORIES = ["eb", "water", "solar", "fire", "hvac", "lifts"];

export function LogHistory() {
  const { data: apiResponse, loading, error } = useApi<{ data: WorkLog[] }>({
    url: "/api/v1/work-logs",
    initialData: { data: [] },
  });

  const logs = useMemo(() => apiResponse?.data ?? [], [apiResponse]);

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (categoryFilter !== "all" && log.assetCategory !== categoryFilter) return false;
      if (dateFrom && log.logDate && log.logDate < dateFrom) return false;
      if (dateTo && log.logDate && log.logDate > dateTo) return false;
      return true;
    });
  }, [logs, categoryFilter, dateFrom, dateTo]);

  const columns: ColumnDef<WorkLog>[] = [
    {
      accessorKey: "logDate",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-[12px] font-mono text-slate-700">
          {row.original.logDate ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "assetCategory",
      header: "Category",
      cell: ({ row }) => (
        <StatusBadge status={row.original.assetCategory ?? "unknown"} variant="info" />
      ),
    },
    {
      accessorKey: "shift",
      header: "Shift",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">
          {row.original.shift ? `Shift ${row.original.shift}` : "—"}
        </span>
      ),
    },
    {
      id: "readingsCount",
      header: "Readings",
      cell: ({ row }) => {
        const count = row.original.readings ? Object.keys(row.original.readings).length : 0;
        return (
          <span className="text-[12px] text-slate-500">
            {count} {count === 1 ? "field" : "fields"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-400">
          {new Date(row.original.createdAt).toLocaleString("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px] h-8 text-[12px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="text-[12px]">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c} className="text-[12px]">
                {c.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-[140px] h-8 text-[12px]"
          placeholder="From"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-[140px] h-8 text-[12px]"
          placeholder="To"
        />
        <span className="text-[11px] text-slate-400">{filteredLogs.length} logs</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600" />
            <span className="text-[11px] text-slate-400">Loading logs...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredLogs} searchKey="assetCategory" searchPlaceholder="Search logs..." pageSize={10} />
      )}

      {error && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable. {error}
        </p>
      )}
    </div>
  );
}
