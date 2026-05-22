"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { useApi } from "@/hooks/use-api";
import { Image as ImageIcon } from "lucide-react";

interface SnagItem {
  id: string;
  location: string | null;
  description: string | null;
  photoUrls: string[] | null;
  severity: string | null;
  status: string | null;
  reportedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export function SnagList() {
  const { data: apiResponse, loading, error } = useApi<{ data: SnagItem[] }>({
    url: "/api/v1/snags",
    initialData: { data: [] },
  });

  const snags = useMemo(() => apiResponse?.data ?? [], [apiResponse]);

  const columns: ColumnDef<SnagItem>[] = [
    {
      id: "photo",
      header: "",
      cell: ({ row }) => {
        const urls = row.original.photoUrls;
        if (!urls || urls.length === 0) {
          return (
            <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center">
              <ImageIcon className="h-3 w-3 text-slate-300" />
            </div>
          );
        }
        return (
          <img
            src={urls[0]}
            alt="Snag"
            className="h-8 w-8 rounded object-cover border"
          />
        );
      },
      size: 48,
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => (
        <span className="font-medium text-[12px] text-slate-900">
          {row.original.location ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600 line-clamp-1">
          {row.original.description ?? "—"}
        </span>
      ),
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => (
        <StatusBadge status={row.original.severity ?? "—"} />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status ?? "—"} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Reported",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-400">
          {new Date(row.original.createdAt).toLocaleDateString("en-IN")}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
            <span className="text-[11px] text-slate-400">Loading snag items...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={snags} searchKey="location" searchPlaceholder="Search snags..." pageSize={10} />
      )}

      {error && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable. {error}
        </p>
      )}
    </div>
  );
}
