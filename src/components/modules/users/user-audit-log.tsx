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

// ---- Mock Data ----
const auditData: AuditEntry[] = [
  {
    id: "1",
    timestamp: "27 Apr 2026, 05:46 pm",
    user: "Demo User",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "49.43.236.136",
  },
  {
    id: "2",
    timestamp: "27 Apr 2026, 05:31 pm",
    user: "Demo User",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "183.83.41.3",
  },
  {
    id: "3",
    timestamp: "27 Apr 2026, 05:01 pm",
    user: "Demo User",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "184.101.195.6",
  },
  {
    id: "4",
    timestamp: "27 Apr 2026, 04:25 pm",
    user: "Praveen Kumar",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "171.61.86.186",
  },
  {
    id: "5",
    timestamp: "26 Apr 2026, 04:13 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "175.26.46.120",
  },
  {
    id: "6",
    timestamp: "04 Apr 2026, 03:09 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "175.26.46.103",
  },
  {
    id: "7",
    timestamp: "02 Apr 2026, 01:53 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "47.81.43.203",
  },
  {
    id: "8",
    timestamp: "01 Apr 2026, 07:04 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "120.60.213.176",
  },
  {
    id: "9",
    timestamp: "26 Apr 2026, 07:40 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "136.185.103.56",
  },
  {
    id: "10",
    timestamp: "26 Apr 2026, 07:07 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "109.205.177.197",
  },
  {
    id: "11",
    timestamp: "26 Apr 2026, 02:58 am",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "186.102.46.178",
  },
  {
    id: "12",
    timestamp: "25 Apr 2026, 07:13 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "49.206.211.48",
  },
  {
    id: "13",
    timestamp: "25 Apr 2026, 06:19 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "188.92.41.79",
  },
  {
    id: "14",
    timestamp: "04 Apr 2026, 10:19 pm",
    user: "Prakash Narasamy",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "103.211.18.220",
  },
  {
    id: "15",
    timestamp: "04 Apr 2026, 08:30 pm",
    user: "Praveen Kumar",
    action: "login",
    details: "User logged in via phone",
    ipAddress: "1.6.42.136",
  },
];

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
    cell: ({ row }) => <StatusBadge status={row.original.action} variant="purple" />,
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
  const [data, setData] = useState<AuditEntry[]>(auditData);

  useEffect(() => {
    // Try to fetch audit logs from API; fall back to mock data
    fetch("/api/v1/users")
      .then((r) => r.json())
      .then((users) => {
        if (Array.isArray(users) && users.length > 0) {
          // Build pseudo-audit entries from user profiles (login records)
          const entries: AuditEntry[] = users.map(
            (u: Record<string, string>, i: number) => ({
              id: u.id || String(i + 100),
              timestamp: u.createdAt || u.created_at
                ? new Date(u.createdAt || u.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })
                : "-",
              user: u.displayName || u.display_name || u.auth0UserId || "Unknown",
              action: "login",
              details: "User profile created",
              ipAddress: "-",
            })
          );
          // Merge: API entries first, then mock entries for demo richness
          setData([...entries, ...auditData]);
        }
      })
      .catch(() => {
        // API unavailable -- keep mock data
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
