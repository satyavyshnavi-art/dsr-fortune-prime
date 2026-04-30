"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState, DataTable, StatusBadge } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { UserX, UserPlus } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";

interface UnmappedPunch {
  id: string;
  deviceUserId: string;
  deviceName: string;
  punchTime: string;
  direction: "in" | "out" | "unknown";
}

const unmappedColumns: ColumnDef<UnmappedPunch, unknown>[] = [
  {
    accessorKey: "deviceUserId",
    header: "Device User ID",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-slate-500">{row.getValue("deviceUserId")}</span>
    ),
  },
  {
    accessorKey: "deviceName",
    header: "Device",
  },
  {
    accessorKey: "punchTime",
    header: "Punch Time",
    cell: ({ row }) => {
      const date = new Date(row.getValue("punchTime") as string);
      return (
        <span className="text-[11px] text-slate-500">
          {date.toLocaleString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      );
    },
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => {
      const dir = row.getValue("direction") as string;
      const variant = dir === "in" ? "success" : dir === "out" ? "info" : "neutral";
      return <StatusBadge status={dir} variant={variant} />;
    },
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <Button variant="outline" className="h-6 text-[10px] gap-1">
        <UserPlus className="h-3 w-3" />
        Map
      </Button>
    ),
  },
];

export function UnmappedGuestsTab() {
  const [unmappedPunches] = useState<UnmappedPunch[]>([]);

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800">Unmapped Queue</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {unmappedPunches.length} unrecognized punch{unmappedPunches.length !== 1 ? "es" : ""}
          </p>
        </div>
      </div>

      {/* Unmapped punches list or empty state */}
      <Card className="shadow-none border-slate-200 p-0">
        {unmappedPunches.length === 0 ? (
          <EmptyState
            icon={UserX}
            title="No unmapped punches"
            description="All biometric punches have been mapped to employees. Unrecognized punches will appear here."
          />
        ) : (
          <div className="p-3">
            <DataTable
              columns={unmappedColumns}
              data={unmappedPunches}
              searchKey="deviceUserId"
              searchPlaceholder="Search by device user ID..."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
