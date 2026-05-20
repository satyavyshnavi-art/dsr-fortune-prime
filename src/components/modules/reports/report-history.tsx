"use client";

import { DataTable, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { useApi } from "@/hooks/use-api";

interface GeneratedReport {
  id: string;
  templateName: string | null;
  format: string;
  fileUrl: string;
  generatedAt: string;
}

const mockHistory: GeneratedReport[] = [
  { id: "1", templateName: "Monthly Attendance Summary", format: "pdf", fileUrl: "/reports/attendance-2026-04.pdf", generatedAt: "2026-04-29T10:30:00Z" },
  { id: "2", templateName: "Task Completion Report", format: "xlsx", fileUrl: "/reports/tasks-2026-04.xlsx", generatedAt: "2026-04-28T14:15:00Z" },
  { id: "3", templateName: "Asset Maintenance Log", format: "csv", fileUrl: "/reports/assets-2026-04.csv", generatedAt: "2026-04-27T09:00:00Z" },
  { id: "4", templateName: "Complaint Analysis", format: "pdf", fileUrl: "/reports/complaints-2026-04.pdf", generatedAt: "2026-04-25T16:45:00Z" },
  { id: "5", templateName: "Inventory Status", format: "xlsx", fileUrl: "/reports/inventory-2026-04.xlsx", generatedAt: "2026-04-20T11:20:00Z" },
];

const formatBadgeVariant: Record<string, "info" | "success" | "neutral"> = {
  pdf: "info",
  xlsx: "success",
  csv: "neutral",
};

function formatDate(ts: string): string {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const columns: ColumnDef<GeneratedReport, any>[] = [
  {
    accessorKey: "templateName",
    header: "Report Name",
    cell: ({ row }) => (
      <span className="text-[12px] font-medium text-slate-700">
        {row.original.templateName ?? "Untitled"}
      </span>
    ),
  },
  {
    accessorKey: "format",
    header: "Format",
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.format.toUpperCase()}
        variant={formatBadgeVariant[row.original.format] ?? "neutral"}
      />
    ),
  },
  {
    accessorKey: "generatedAt",
    header: "Generated",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-500">
        {formatDate(row.original.generatedAt)}
      </span>
    ),
  },
  {
    id: "download",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        onClick={() => window.open(row.original.fileUrl, "_blank")}
      >
        <Download className="h-3 w-3" />
      </Button>
    ),
  },
];

export function ReportHistory() {
  const { data, loading } = useApi<GeneratedReport[]>({
    url: "/api/v1/reports/history",
    initialData: mockHistory,
  });

  const reports = data ?? mockHistory;

  return (
    <DataTable
      columns={columns}
      data={reports}
      searchKey="templateName"
      searchPlaceholder="Search reports..."
      pageSize={10}
    />
  );
}
