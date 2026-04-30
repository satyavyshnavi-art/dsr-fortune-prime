"use client";

import { Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ---- Types ----
interface RolePermission {
  role: string;
  userCount?: number;
  isLocked?: boolean;
  permissions: Record<string, boolean>;
}

const PERMISSIONS = [
  "Manage Users",
  "Manage Facilities",
  "Manage Services",
  "Manage IoT",
  "View Reports",
  "Manage Settings",
  "Manage Billing",
  "Audit Logs",
  "Manage Employees",
] as const;

// ---- Mock Data ----
const rolesData: RolePermission[] = [
  {
    role: "Admin",
    isLocked: true,
    permissions: {
      "Manage Users": true,
      "Manage Facilities": true,
      "Manage Services": true,
      "Manage IoT": true,
      "View Reports": true,
      "Manage Settings": true,
      "Manage Billing": true,
      "Audit Logs": true,
      "Manage Employees": true,
    },
  },
  {
    role: "Client",
    userCount: 2,
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
  {
    role: "Demo User",
    userCount: 1,
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
  {
    role: "Facility Manager",
    permissions: {
      "Manage Users": true,
      "Manage Facilities": false,
      "Manage Services": true,
      "Manage IoT": false,
      "View Reports": true,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": true,
    },
  },
  {
    role: "Guest",
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
  {
    role: "Manager",
    userCount: 2,
    permissions: {
      "Manage Users": true,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": true,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
  {
    role: "Service Provider",
    userCount: 2,
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": true,
      "Manage IoT": false,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
  {
    role: "Soft Services Supervisor",
    userCount: 3,
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": true,
    },
  },
  {
    role: "Supervisor",
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": true,
      "Manage Employees": true,
    },
  },
  {
    role: "Technical Supervisor",
    userCount: 3,
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": true,
      "View Reports": false,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
  {
    role: "User",
    permissions: {
      "Manage Users": false,
      "Manage Facilities": false,
      "Manage Services": false,
      "Manage IoT": false,
      "View Reports": true,
      "Manage Settings": false,
      "Manage Billing": false,
      "Audit Logs": false,
      "Manage Employees": false,
    },
  },
];

// ---- Component ----
export function RolesPermissions() {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[13px] font-semibold text-slate-800">Roles & Permissions</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">
          View the access permissions for each user role.
        </p>
      </div>

      {/* Matrix Table */}
      <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50/80">
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 min-w-[160px]">
                Role
              </th>
              {PERMISSIONS.map((perm) => (
                <th
                  key={perm}
                  className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2 min-w-[90px]"
                >
                  {perm}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rolesData.map((roleRow) => (
              <tr
                key={roleRow.role}
                className="border-b last:border-b-0 hover:bg-slate-50/50"
              >
                <td className="px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-800">
                      {roleRow.role}
                    </span>
                    {roleRow.userCount && (
                      <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-blue-100 text-blue-700 text-[9px] font-medium">
                        +{roleRow.userCount}
                      </span>
                    )}
                  </div>
                </td>
                {PERMISSIONS.map((perm) => (
                  <td key={perm} className="text-center px-2 py-1.5">
                    {roleRow.permissions[perm] ? (
                      <div className="flex justify-center">
                        <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
                          <X className="h-3 w-3 text-slate-400" />
                        </div>
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-2.5 w-2.5 text-green-600" />
          </div>
          <span className="text-slate-500">Granted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center">
            <X className="h-2.5 w-2.5 text-slate-400" />
          </div>
          <span className="text-slate-500">Denied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-[9px] px-1.5 py-0 h-[16px]">
            locked
          </Badge>
          <span className="text-slate-500">Cannot be modified (Super Admin)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-[9px] px-1.5 py-0 h-[16px]">
            custom
          </Badge>
          <span className="text-slate-500">User-created role (can be deleted)</span>
        </div>
      </div>
    </div>
  );
}
