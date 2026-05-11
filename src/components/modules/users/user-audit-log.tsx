"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge } from "@/components/shared";

// ---- Types ----
interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ipAddress: string;
}

const ACTION_LABELS: Record<string, string> = {
  create_user: "User Created",
  update_user: "User Updated",
  change_role: "Role Changed",
  delete_user: "User Deleted",
  login: "Login",
};

const ACTION_VARIANTS: Record<string, "success" | "info" | "purple" | "danger" | "neutral"> = {
  create_user: "success",
  update_user: "info",
  change_role: "purple",
  delete_user: "danger",
  login: "neutral",
};

// ---- Mock Data ----
const mockAuditData: AuditEntry[] = [
  { id: "m1", timestamp: "27 Apr 2026, 05:46 pm", user: "Demo User", action: "login", details: "User logged in via phone", ipAddress: "49.43.236.136" },
  { id: "m2", timestamp: "27 Apr 2026, 05:31 pm", user: "Demo User", action: "login", details: "User logged in via phone", ipAddress: "183.83.41.3" },
  { id: "m3", timestamp: "27 Apr 2026, 04:25 pm", user: "Praveen Kumar", action: "login", details: "User logged in via phone", ipAddress: "171.61.86.186" },
  { id: "m4", timestamp: "26 Apr 2026, 04:13 pm", user: "Prakash Narasamy", action: "login", details: "User logged in via phone", ipAddress: "175.26.46.120" },
  { id: "m5", timestamp: "04 Apr 2026, 03:09 pm", user: "Prakash Narasamy", action: "login", details: "User logged in via phone", ipAddress: "175.26.46.103" },
  { id: "m6", timestamp: "25 Apr 2026, 07:13 pm", user: "Prakash Narasamy", action: "login", details: "User logged in via phone", ipAddress: "49.206.211.48" },
  { id: "m7", timestamp: "04 Apr 2026, 08:30 pm", user: "Praveen Kumar", action: "login", details: "User logged in via phone", ipAddress: "1.6.42.136" },
];

function formatDetails(action: string, details: Record<string, unknown> | string | null): string {
  if (!details) return "-";
  if (typeof details === "string") return details;

  switch (action) {
    case "create_user":
      return `Created user "${details.displayName || ""}" as ${details.role || "user"}`;
    case "update_user": {
      const fields = Object.keys(details).join(", ");
      return `Updated: ${fields}`;
    }
    case "change_role":
      return `Changed role to ${details.role || "unknown"}`;
    case "delete_user":
      return `Deleted user "${details.displayName || ""}"`;
    default:
      return JSON.stringify(details);
  }
}

// ---- Columns ----
const columns: ColumnDef<AuditEntry, unknown>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-500 whitespace-nowrap">
        {row.original.timestamp}
      </span>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <span className="text-[12px] font-medium text-blue-600">{row.original.user}</span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const action = row.original.action;
      const variant = ACTION_VARIANTS[action] || "default";
      const label = ACTION_LABELS[action] || action;
      return <StatusBadge status={label} variant={variant} />;
    },
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="text-[12px] text-slate-500">{row.original.details}</span>
    ),
  },
  {
    accessorKey: "ipAddress",
    header: "IP Address",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-400 font-mono">{row.original.ipAddress}</span>
    ),
  },
];

// ---- Component ----
export function UserAuditLog() {
  const [data, setData] = useState<AuditEntry[]>(mockAuditData);

  useEffect(() => {
    fetch("/api/v1/audit-logs")
      .then((r) => r.json())
      .then((logs) => {
        if (Array.isArray(logs) && logs.length > 0) {
          const entries: AuditEntry[] = logs.map(
            (log: Record<string, unknown>) => ({
              id: log.id as string,
              timestamp: log.timestamp
                ? new Date(log.timestamp as string).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "-",
              user: (log.auth0UserId as string) || "System",
              action: (log.action as string) || "unknown",
              details: formatDetails(
                log.action as string,
                log.details as Record<string, unknown> | null
              ),
              ipAddress: (log.ipAddress as string) || "-",
            })
          );
          // Real entries first, then mock login data
          setData([...entries, ...mockAuditData]);
        }
      })
      .catch(() => {
        // API unavailable — keep mock data
      });
  }, []);

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="user"
      searchPlaceholder="Search by user name or action..."
      pageSize={10}
    />
  );
}
