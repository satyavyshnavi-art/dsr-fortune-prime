"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  Users,
  Search,
  AlertTriangle,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

// ---- Types ----
interface Permission {
  read: boolean;
  write: boolean;
  approve: boolean;
  delete: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
  permissions: Record<string, Permission>;
}

/** Shape returned by GET /api/v1/roles */
interface ApiRole {
  id: string;
  orgId: string;
  name: string;
  permissions: Record<string, Permission> | null;
  createdAt: string;
}

// ---- Constants ----
const MODULES = [
  "Tasks",
  "Assets",
  "Attendance",
  "Inventory",
  "Approvals",
  "HR",
  "Reports",
  "Config",
] as const;

const ACTIONS = ["read", "write", "approve", "delete"] as const;

type ModuleName = (typeof MODULES)[number];
type ActionName = (typeof ACTIONS)[number];

// ---- Default / Mock Roles ----
function makePermissions(
  granted: Partial<Record<ModuleName, ActionName[]>>
): Record<string, Permission> {
  const perms: Record<string, Permission> = {};
  for (const mod of MODULES) {
    const actions = granted[mod] || [];
    perms[mod] = {
      read: actions.includes("read"),
      write: actions.includes("write"),
      approve: actions.includes("approve"),
      delete: actions.includes("delete"),
    };
  }
  return perms;
}

const allActions: ActionName[] = ["read", "write", "approve", "delete"];
const readWrite: ActionName[] = ["read", "write"];
const readOnly: ActionName[] = ["read"];

const MOCK_ROLES: Role[] = [
  {
    id: "role-1",
    name: "Management",
    description: "Full access to all modules",
    userCount: 3,
    isSystem: true,
    permissions: makePermissions({
      Tasks: allActions,
      Assets: allActions,
      Attendance: allActions,
      Inventory: allActions,
      Approvals: allActions,
      HR: allActions,
      Reports: allActions,
      Config: allActions,
    }),
  },
  {
    id: "role-2",
    name: "Operations Head",
    description: "Operational oversight with approval powers",
    userCount: 2,
    isSystem: true,
    permissions: makePermissions({
      Tasks: allActions,
      Assets: readWrite,
      Attendance: [...readWrite, "approve"],
      Inventory: [...readWrite, "approve"],
      Approvals: allActions,
      HR: readWrite,
      Reports: readOnly,
      Config: readOnly,
    }),
  },
  {
    id: "role-3",
    name: "Site Manager",
    description: "Day-to-day site management",
    userCount: 4,
    isSystem: true,
    permissions: makePermissions({
      Tasks: readWrite,
      Assets: readWrite,
      Attendance: readWrite,
      Inventory: readWrite,
      Approvals: ["read", "approve"],
      HR: readOnly,
      Reports: readOnly,
      Config: readOnly,
    }),
  },
  {
    id: "role-4",
    name: "Executive",
    description: "Executive-level read and write access",
    userCount: 5,
    isSystem: false,
    permissions: makePermissions({
      Tasks: readWrite,
      Assets: readOnly,
      Attendance: readWrite,
      Inventory: readOnly,
      Approvals: readOnly,
      HR: readOnly,
      Reports: readOnly,
      Config: [],
    }),
  },
  {
    id: "role-5",
    name: "Supervisor",
    description: "Team supervision and task management",
    userCount: 8,
    isSystem: false,
    permissions: makePermissions({
      Tasks: readWrite,
      Assets: readOnly,
      Attendance: readWrite,
      Inventory: readOnly,
      Approvals: readOnly,
      HR: [],
      Reports: readOnly,
      Config: [],
    }),
  },
  {
    id: "role-6",
    name: "Accounts",
    description: "Financial approvals and reporting",
    userCount: 2,
    isSystem: false,
    permissions: makePermissions({
      Tasks: readOnly,
      Assets: readOnly,
      Attendance: readOnly,
      Inventory: readOnly,
      Approvals: [...readOnly, "approve"],
      HR: readOnly,
      Reports: readWrite,
      Config: [],
    }),
  },
  {
    id: "role-7",
    name: "HR",
    description: "Human resources management",
    userCount: 2,
    isSystem: false,
    permissions: makePermissions({
      Tasks: readOnly,
      Assets: [],
      Attendance: readWrite,
      Inventory: [],
      Approvals: ["read", "approve"],
      HR: allActions,
      Reports: readOnly,
      Config: readOnly,
    }),
  },
  {
    id: "role-8",
    name: "Payroll",
    description: "Payroll processing and attendance",
    userCount: 1,
    isSystem: false,
    permissions: makePermissions({
      Tasks: readOnly,
      Assets: [],
      Attendance: readWrite,
      Inventory: [],
      Approvals: readOnly,
      HR: readWrite,
      Reports: readWrite,
      Config: [],
    }),
  },
  {
    id: "role-9",
    name: "Admin",
    description: "System administration and configuration",
    userCount: 1,
    isSystem: true,
    permissions: makePermissions({
      Tasks: allActions,
      Assets: allActions,
      Attendance: allActions,
      Inventory: allActions,
      Approvals: allActions,
      HR: allActions,
      Reports: allActions,
      Config: allActions,
    }),
  },
];

// ---- Component ----
export function RolesPermissions() {
  const {
    data: apiRoles,
    loading,
    error: apiError,
    create,
    remove,
    fetchData,
  } = useApi<any[]>({
    url: "/api/v1/roles",
    initialData: [],
  });

  // System role names that cannot be deleted
  const SYSTEM_ROLE_NAMES = new Set(["Management", "Admin", "Operations Head", "Site Manager"]);

  const roles: Role[] = useMemo(() => {
    if (apiError || !apiRoles || apiRoles.length === 0) {
      return apiError ? MOCK_ROLES : (apiRoles ?? []).length === 0 ? MOCK_ROLES : [];
    }
    return (apiRoles as ApiRole[]).map((r) => ({
      id: r.id,
      name: r.name,
      description: "", // API doesn't carry description; UI shows name only
      userCount: 0, // no count from this endpoint
      isSystem: SYSTEM_ROLE_NAMES.has(r.name),
      permissions: (r.permissions as Record<string, Permission>) ?? makePermissions({}),
    }));
  }, [apiRoles, apiError]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showMatrixDialog, setShowMatrixDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const filteredRoles = roles.filter(
    (r) =>
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setShowEditDialog(true);
  };

  const handleDelete = (role: Role) => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted");
      return;
    }
    setSelectedRole(role);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedRole) return;
    try {
      await remove(selectedRole.id);
      toast.success("Role deleted successfully");
    } catch {
      toast.error("Failed to delete role");
    }
    setShowDeleteDialog(false);
    setSelectedRole(null);
  };

  const handleViewMatrix = (role: Role) => {
    setSelectedRole(role);
    setShowMatrixDialog(true);
  };

  const columns: ColumnDef<Role>[] = [
    {
      accessorKey: "name",
      header: "Role Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-blue-50 flex items-center justify-center">
            <Shield className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <span className="font-medium text-[12px] text-slate-900">
              {row.original.name}
            </span>
            {row.original.isSystem && (
              <Badge
                variant="outline"
                className="ml-1.5 bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0 h-[16px]"
              >
                system
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-500">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: "userCount",
      header: "Users",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-3 w-3 text-slate-400" />
          <span className="text-[12px] text-slate-600">
            {row.original.userCount}
          </span>
        </div>
      ),
    },
    {
      id: "permissions",
      header: "Permissions",
      cell: ({ row }) => {
        const perms = row.original.permissions;
        const total = MODULES.length * ACTIONS.length;
        let granted = 0;
        for (const mod of MODULES) {
          for (const act of ACTIONS) {
            if (perms[mod]?.[act]) granted++;
          }
        }
        return (
          <button
            onClick={() => handleViewMatrix(row.original)}
            className="text-[11px] text-blue-600 hover:text-blue-700 hover:underline"
          >
            {granted}/{total} permissions
          </button>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleEdit(row.original)}
          >
            <Pencil className="h-3 w-3 text-slate-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => handleDelete(row.original)}
            disabled={row.original.isSystem}
          >
            <Trash2
              className={`h-3 w-3 ${
                row.original.isSystem ? "text-slate-200" : "text-red-400"
              }`}
            />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800">
            Roles & Permissions
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manage roles and their module-level permissions
          </p>
        </div>
        <Button
          className="h-7 text-[11px] px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowCreateDialog(true)}
        >
          <Plus className="h-3 w-3" />
          Create Role
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-[220px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Search roles..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-[12px]"
        />
      </div>

      {/* Roles Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            <span className="text-[11px] text-slate-400">Loading roles...</span>
          </div>
        </div>
      ) : (
        <DataTable columns={columns} data={filteredRoles} pageSize={10} />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing default roles. {apiError}
        </p>
      )}

      {/* Permission Matrix — Full Grid */}
      <div className="space-y-2">
        <h4 className="text-[12px] font-semibold text-slate-700">
          Permission Matrix
        </h4>
        <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-slate-50/80">
                <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 min-w-[140px]">
                  Module
                </th>
                {ACTIONS.map((action) => (
                  <th
                    key={action}
                    className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2 min-w-[70px]"
                  >
                    {action}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((mod) => (
                <tr
                  key={mod}
                  className="border-b last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-3 py-1.5">
                    <span className="text-[11px] font-medium text-slate-800">
                      {mod}
                    </span>
                  </td>
                  {ACTIONS.map((action) => {
                    // Show aggregate: how many roles have this permission
                    const count = roles.filter(
                      (r) => r.permissions[mod]?.[action]
                    ).length;
                    return (
                      <td key={action} className="text-center px-2 py-1.5">
                        <span
                          className={`text-[10px] font-medium ${
                            count > 0 ? "text-teal-600" : "text-slate-300"
                          }`}
                        >
                          {count}/{roles.length}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] px-1.5 py-0 h-[16px]"
          >
            system
          </Badge>
          <span className="text-slate-500">
            Built-in role (cannot be deleted)
          </span>
        </div>
      </div>

      {/* Create Role Dialog */}
      <RoleFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={async (data) => {
          try {
            await create({
              name: data.name,
              permissions: data.permissions,
            });
            setShowCreateDialog(false);
            toast.success("Role created successfully");
          } catch {
            toast.error("Failed to create role (API unavailable)");
            setShowCreateDialog(false);
          }
        }}
        title="Create Role"
        submitLabel="Create Role"
      />

      {/* Edit Role Dialog */}
      <RoleFormDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        role={selectedRole}
        onSubmit={async (data) => {
          if (!selectedRole) return;
          try {
            // API uses PATCH, not PUT
            const res = await fetch(`/api/v1/roles/${selectedRole.id}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: data.name,
                permissions: data.permissions,
              }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await fetchData();
            setShowEditDialog(false);
            setSelectedRole(null);
            toast.success("Role updated successfully");
          } catch {
            toast.error("Failed to update role (API unavailable)");
            setShowEditDialog(false);
          }
        }}
        title={`Edit Role — ${selectedRole?.name ?? ""}`}
        submitLabel="Update Role"
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[400px] p-5" showCloseButton>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-[14px] font-semibold text-slate-800">
              Delete Role
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-[12px] text-slate-700">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedRole?.name}</span>?
                </p>
                {(selectedRole?.userCount ?? 0) > 0 && (
                  <p className="text-[11px] text-red-600 mt-1">
                    {selectedRole?.userCount} user(s) are assigned to this role.
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="h-7 text-[11px] px-3"
                onClick={() => setShowDeleteDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="h-7 text-[11px] px-3 bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Permission Matrix for Role */}
      <Dialog open={showMatrixDialog} onOpenChange={setShowMatrixDialog}>
        <DialogContent className="sm:max-w-[560px] p-5" showCloseButton>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-[14px] font-semibold text-slate-800">
              Permissions — {selectedRole?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="rounded-md border border-slate-200 bg-white overflow-x-auto mt-2">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50/80">
                    <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                      Module
                    </th>
                    {ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2"
                      >
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod) => (
                    <tr
                      key={mod}
                      className="border-b last:border-b-0 hover:bg-slate-50/50"
                    >
                      <td className="px-3 py-1.5">
                        <span className="text-[11px] font-medium text-slate-800">
                          {mod}
                        </span>
                      </td>
                      {ACTIONS.map((action) => (
                        <td key={action} className="text-center px-2 py-1.5">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={
                                selectedRole.permissions[mod]?.[action] ?? false
                              }
                              disabled
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---- Create / Edit Role Dialog ----
function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSubmit,
  title,
  submitLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role | null;
  onSubmit: (data: {
    name: string;
    description: string;
    permissions: Record<string, Permission>;
  }) => void | Promise<void>;
  title: string;
  submitLabel: string;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState<Record<string, Permission>>(
    () => makePermissions({})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync form when role changes
  const [prevId, setPrevId] = useState<string | null>(null);
  const roleId = role?.id ?? null;
  if (roleId !== prevId) {
    setPrevId(roleId);
    if (role) {
      setName(role.name);
      setDescription(role.description);
      setPermissions({ ...role.permissions });
    } else {
      setName("");
      setDescription("");
      setPermissions(makePermissions({}));
    }
    setErrors({});
  }

  const togglePermission = (mod: string, action: ActionName) => {
    setPermissions((prev) => ({
      ...prev,
      [mod]: {
        ...prev[mod],
        [action]: !prev[mod]?.[action],
      },
    }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Role name is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit({ name, description, permissions });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-5 max-h-[85vh] overflow-y-auto" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800">
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 pt-1">
          {/* Name */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Role Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g. Site Manager"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name)
                  setErrors((prev) => {
                    const n = { ...prev };
                    delete n.name;
                    return n;
                  });
              }}
              className={`h-9 text-[13px] rounded-lg ${
                errors.name ? "border-red-400 ring-1 ring-red-200" : ""
              }`}
            />
            {errors.name && (
              <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Description</Label>
            <Input
              placeholder="Brief description of this role"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-9 text-[13px] rounded-lg"
            />
          </div>

          {/* Permission Matrix */}
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-500">Permissions</Label>
            <div className="rounded-md border border-slate-200 bg-white overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50/80">
                    <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 min-w-[120px]">
                      Module
                    </th>
                    {ACTIONS.map((action) => (
                      <th
                        key={action}
                        className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2 min-w-[60px]"
                      >
                        {action}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MODULES.map((mod) => (
                    <tr
                      key={mod}
                      className="border-b last:border-b-0 hover:bg-slate-50/50"
                    >
                      <td className="px-3 py-1.5">
                        <span className="text-[11px] font-medium text-slate-800">
                          {mod}
                        </span>
                      </td>
                      {ACTIONS.map((action) => (
                        <td key={action} className="text-center px-2 py-1.5">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={permissions[mod]?.[action] ?? false}
                              onCheckedChange={() =>
                                togglePermission(mod, action)
                              }
                            />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              className="h-7 text-[11px] px-3"
              onClick={() => {
                onOpenChange(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-7 text-[11px] px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleSubmit}
            >
              <Shield className="h-3 w-3" />
              {submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
