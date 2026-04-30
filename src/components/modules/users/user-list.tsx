"use client";

import { useState } from "react";
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
import { Plus, Pencil, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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

// ---- Mock Data ----
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Demo User",
    phone: "+919894198941",
    email: "\u2014",
    role: "Facility Manager",
    status: "Active",
    createdAt: "22 Mar 2026",
    avatarColor: "bg-blue-600",
  },
  {
    id: "2",
    name: "Greenview Demo",
    phone: "+919842198421",
    email: "\u2014",
    role: "Facility Manager",
    status: "Active",
    createdAt: "21 Mar 2026",
    avatarColor: "bg-teal-600",
  },
  {
    id: "3",
    name: "Prakash Narasamy",
    phone: "+919994711888",
    email: "nprakash2002@gmail.com",
    role: "Super Admin",
    status: "Active",
    createdAt: "28 Feb 2026",
    avatarColor: "bg-violet-600",
  },
  {
    id: "4",
    name: "Praveen Kumar",
    phone: "+919901158900",
    email: "manager@greenviewdemo.com",
    role: "Super Admin",
    status: "Active",
    createdAt: "28 Feb 2026",
    avatarColor: "bg-pink-600",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ---- Create User Dialog ----
function CreateUserDialog() {
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function handleSubmit(e: React.FormEvent) {
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
    toast.success("User created successfully");
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setErrors({});
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <DialogTitle className="text-[13px]">Create New User</DialogTitle>
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
                className={`h-8 text-[12px] ${errors.firstName ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {errors.firstName && <p className="text-[10px] text-red-500 mt-0.5">First name is required</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-[11px] text-slate-500">Last Name <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => { setLastName(e.target.value); setErrors((prev) => ({ ...prev, lastName: false })); }}
                className={`h-8 text-[12px] ${errors.lastName ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {errors.lastName && <p className="text-[10px] text-red-500 mt-0.5">Last name is required</p>}
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
              className={`h-8 text-[12px] ${errors.email ? 'border-red-400 ring-1 ring-red-200' : ''}`}
            />
            {errors.email && <p className="text-[10px] text-red-500 mt-0.5">Email is required</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-[11px] text-slate-500">Phone</Label>
            <Input id="phone" placeholder="+91 XXXXX XXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-8 text-[12px]" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="role" className="text-[11px] text-slate-500">Role</Label>
            <Select defaultValue="facility_manager">
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-[11px]"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
            >
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---- Columns ----
const columns: ColumnDef<User, unknown>[] = [
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
      <div className="flex items-center gap-1">
        <span className="text-blue-600 font-medium text-[12px]">{row.original.role}</span>
        <Pencil className="h-2.5 w-2.5 text-blue-400" />
      </div>
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
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="icon-xs" className="h-6 w-6">
              <MoreVertical className="h-3.5 w-3.5 text-slate-400" />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-[12px]" onSelect={() => toast.info("Edit user coming soon")}>Edit User</DropdownMenuItem>
          <DropdownMenuItem className="text-[12px]" onSelect={() => toast.success("Permissions updated")}>Change Role</DropdownMenuItem>
          <DropdownMenuItem className="text-[12px] text-red-600" onSelect={() => { if (window.confirm("Are you sure you want to deactivate this user?")) toast.success("User deactivated"); }}>Deactivate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// ---- User List Component ----
export function UserList() {
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-slate-400">{filteredUsers.length} users total</p>
        <div className="flex items-center gap-2">
          <Select value={roleFilter} onValueChange={(v) => v && setRoleFilter(v)}>
            <SelectTrigger className="w-[120px] h-7 text-[11px]">
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
          <CreateUserDialog />
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
    </div>
  );
}
