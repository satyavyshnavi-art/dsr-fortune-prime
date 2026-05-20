"use client";

import { DataTable, StatusBadge } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface ScheduledReport {
  id: string;
  templateId: string;
  templateName?: string;
  frequency: string;
  recipients: string[];
  nextRunAt: string;
  enabled: boolean;
}

const mockSchedules: ScheduledReport[] = [
  { id: "1", templateId: "t1", templateName: "Monthly Attendance Summary", frequency: "monthly", recipients: ["admin@spotworks.in", "hr@spotworks.in"], nextRunAt: "2026-06-01T06:00:00Z", enabled: true },
  { id: "2", templateId: "t2", templateName: "Weekly Task Report", frequency: "weekly", recipients: ["ops@spotworks.in"], nextRunAt: "2026-05-26T06:00:00Z", enabled: true },
  { id: "3", templateId: "t3", templateName: "Daily Complaint Summary", frequency: "daily", recipients: ["manager@spotworks.in"], nextRunAt: "2026-05-21T06:00:00Z", enabled: false },
];

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

export function ScheduleManager() {
  const { data, update } = useApi<ScheduledReport[]>({
    url: "/api/v1/reports/schedule",
    initialData: mockSchedules,
  });

  const schedules = data ?? mockSchedules;

  const toggleEnabled = async (schedule: ScheduledReport) => {
    try {
      await update(schedule.id, { enabled: !schedule.enabled });
      toast.success(`Schedule ${schedule.enabled ? "disabled" : "enabled"}`);
    } catch {
      toast.error("Failed to update schedule");
    }
  };

  const columns: ColumnDef<ScheduledReport, any>[] = [
    {
      accessorKey: "templateName",
      header: "Report",
      cell: ({ row }) => (
        <span className="text-[12px] font-medium text-slate-700">
          {row.original.templateName ?? row.original.templateId}
        </span>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.frequency.charAt(0).toUpperCase() + row.original.frequency.slice(1)}
          variant="info"
        />
      ),
    },
    {
      accessorKey: "recipients",
      header: "Recipients",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.recipients.map((r) => (
            <span
              key={r}
              className="inline-block text-[10px] text-slate-500 bg-slate-50 rounded px-1.5 py-0.5 border border-slate-100"
            >
              {r}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "nextRunAt",
      header: "Next Run",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-500">
          {formatDate(row.original.nextRunAt)}
        </span>
      ),
    },
    {
      accessorKey: "enabled",
      header: "Status",
      cell: ({ row }) => {
        const enabled = row.original.enabled;
        return (
          <button
            onClick={() => toggleEnabled(row.original)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              enabled ? "bg-green-500" : "bg-slate-200"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-4.5" : "translate-x-0.5"
              }`}
            />
          </button>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={schedules}
      searchKey="templateName"
      searchPlaceholder="Search schedules..."
      pageSize={10}
    />
  );
}
