"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge } from "@/components/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, MoreVertical, UserCog, Pencil, Trash2, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// ---- Types ----
export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt: string;
  avatarColor: string;
}

const AVATAR_COLORS = [
  "bg-blue-600", "bg-teal-600", "bg-violet-600", "bg-pink-600",
  "bg-emerald-600", "bg-amber-600", "bg-indigo-600", "bg-rose-600",
];

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  facility_manager: "Facility Manager",
  manager: "Manager",
  supervisor: "Supervisor",
  user: "User",
};

function getRoleLabel(role: string): string {
  return ROLE_LABELS[role] || role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function mapUserFromApi(u: Record<string, string>, i: number): User {
  return {
    id: u.id,
    name: u.displayName || u.display_name || u.auth0UserId || "Unknown",
    phone: u.phone || "-",
    email: u.email || "-",
    role: getRoleLabel(u.role || u.user_status || "facility_manager"),
    status: (u.status === "inactive" || u.user_status === "inactive") ? "Inactive" : "Active",
    createdAt: u.createdAt || u.created_at
      ? new Date(u.createdAt || u.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "-",
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
  };
}

// ---- Create User Dialog ----
function CreateUserDialog({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("facility_manager");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function resetForm() {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("facility_manager");
    setErrors({});
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!firstName.trim()) errs.firstName = true;
    if (!lastName.trim()) errs.lastName = true;
    if (!email.trim()) errs.email = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: `${firstName.trim()} ${lastName.trim()}`,
          email: email.trim(),
          phone: phone.trim() || null,
          role,
        }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success("User created successfully");
      resetForm();
      setOpen(false);
      onCreated?.();
    } catch {
      toast.error("Failed to create user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger
        render={
          <Button size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-3 w-3 mr-1" />
            Create User
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Create New User</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-[11px] text-slate-500">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value); setErrors((prev) => ({ ...prev, firstName: false })); }}
                className={`h-8 text-[12px] ${errors.firstName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-[11px] text-slate-500">Last Name <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setErrors((prev) => ({ ...prev, lastName: false })); }}
                className={`h-8 text-[12px] ${errors.lastName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="email" className="text-[11px] text-slate-500">Email <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: false })); }}
              className={`h-8 text-[12px] ${errors.email ? "border-red-400 ring-1 ring-red-200" : ""}`}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-[11px] text-slate-500">Phone</Label>
            <Input id="phone" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role" className="text-[11px] text-slate-500">Role</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger className="w-full h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin" className="text-[12px]">Super Admin</SelectItem>
                <SelectItem value="admin" className="text-[12px]">Admin</SelectItem>
                <SelectItem value="facility_manager" className="text-[12px]">Facility Manager</SelectItem>
                <SelectItem value="manager" className="text-[12px]">Manager</SelectItem>
                <SelectItem value="supervisor" className="text-[12px]">Supervisor</SelectItem>
                <SelectItem value="user" className="text-[12px]">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Edit User Dialog ----
function EditUserDialog({
  user,
  open,
  onOpenChange,
  onUpdated,
}: {
  user: User;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: () => void;
}) {
  const nameParts = user.name.split(" ");
  const [displayName, setDisplayName] = useState(user.name);
  const [email, setEmail] = useState(user.email === "-" ? "" : user.email);
  const [phone, setPhone] = useState(user.phone === "-" ? "" : user.phone);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success("User updated successfully");
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Edit User</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Display Name <span className="text-red-500">*</span></Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-8 text-[12px]" placeholder="email@example.com" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-[12px]" placeholder="+91 XXXXX XXXXX" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Change Role Dialog ----
function ChangeRoleDialog({
  user,
  open,
  onOpenChange,
  onUpdated,
}: {
  user: User;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onUpdated: () => void;
}) {
  // Find the key from the label
  const currentRoleKey = Object.entries(ROLE_LABELS).find(
    ([, label]) => label === user.role
  )?.[0] || "facility_manager";

  const [role, setRole] = useState(currentRoleKey);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success(`Role updated to ${getRoleLabel(role)}`);
      onOpenChange(false);
      onUpdated();
    } catch {
      toast.error("Failed to update role");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Change Role — {user.name}</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">New Role</Label>
            <Select value={role} onValueChange={(v) => v && setRole(v)}>
              <SelectTrigger className="w-full h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin" className="text-[12px]">Super Admin</SelectItem>
                <SelectItem value="admin" className="text-[12px]">Admin</SelectItem>
                <SelectItem value="facility_manager" className="text-[12px]">Facility Manager</SelectItem>
                <SelectItem value="manager" className="text-[12px]">Manager</SelectItem>
                <SelectItem value="supervisor" className="text-[12px]">Supervisor</SelectItem>
                <SelectItem value="user" className="text-[12px]">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- User List Component ----
export function UserList() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [editUser, setEditUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch("/api/v1/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data.map(mapUserFromApi));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = useCallback(
    async (id: string) => {
      try {
        const res = await fetch(`/api/v1/users/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("API error");
        toast.success("User deleted");
        fetchUsers();
      } catch {
        toast.error("Failed to delete user");
      }
    },
    [fetchUsers]
  );

  const handleToggleStatus = useCallback(
    async (user: User) => {
      const newStatus = user.status === "Active" ? "inactive" : "active";
      try {
        const res = await fetch(`/api/v1/users/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) throw new Error("API error");
        toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"}`);
        fetchUsers();
      } catch {
        toast.error("Failed to update status");
      }
    },
    [fetchUsers]
  );

  const columns = useMemo(
    (): ColumnDef<User, unknown>[] => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className={`${user.avatarColor} text-white text-[10px] font-semibold`}>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-[12px] text-slate-900">{user.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-[12px] text-slate-500">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <button
            onClick={() => setRoleUser(row.original)}
            className="flex items-center gap-1 text-blue-600 font-medium text-[12px] hover:text-blue-800 cursor-pointer"
          >
            {row.original.role}
            <Pencil className="h-2.5 w-2.5 text-blue-400" />
          </button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-[12px] text-slate-400">{row.original.createdAt}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-xs" className="h-6 w-6">
                  <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-[12px]"
                onClick={() => setEditUser(row.original)}
              >
                <Pencil className="h-3 w-3 mr-1.5" />
                Edit User
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[12px]"
                onClick={() => setRoleUser(row.original)}
              >
                <Shield className="h-3 w-3 mr-1.5" />
                Change Role
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[12px]"
                onClick={() => handleToggleStatus(row.original)}
              >
                <UserCog className="h-3 w-3 mr-1.5" />
                {row.original.status === "Active" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-[12px] text-red-600"
                onClick={() => handleDeleteUser(row.original.id)}
              >
                <Trash2 className="h-3 w-3 mr-1.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [handleDeleteUser, handleToggleStatus]
  );

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">
          {loading ? "Loading..." : `${filteredUsers.length} users total`}
        </p>
        <div className="flex items-center gap-2">
          <Select value={roleFilter} onValueChange={(v) => v && setRoleFilter(v)}>
            <SelectTrigger className="w-[140px] h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[11px]">All Roles</SelectItem>
              <SelectItem value="Super Admin" className="text-[11px]">Super Admin</SelectItem>
              <SelectItem value="Facility Manager" className="text-[11px]">Facility Manager</SelectItem>
              <SelectItem value="Manager" className="text-[11px]">Manager</SelectItem>
              <SelectItem value="Supervisor" className="text-[11px]">Supervisor</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
            <SelectTrigger className="w-[120px] h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[11px]">All Statuses</SelectItem>
              <SelectItem value="Active" className="text-[11px]">Active</SelectItem>
              <SelectItem value="Inactive" className="text-[11px]">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <CreateUserDialog onCreated={fetchUsers} />
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredUsers}
        searchKey="name"
        searchPlaceholder="Search by name, email, or phone..."
        pageSize={10}
      />

      {/* Edit User Dialog */}
      {editUser && (
        <EditUserDialog
          user={editUser}
          open={!!editUser}
          onOpenChange={(v) => { if (!v) setEditUser(null); }}
          onUpdated={fetchUsers}
        />
      )}

      {/* Change Role Dialog */}
      {roleUser && (
        <ChangeRoleDialog
          user={roleUser}
          open={!!roleUser}
          onOpenChange={(v) => { if (!v) setRoleUser(null); }}
          onUpdated={fetchUsers}
        />
      )}
    </div>
  );
}
