"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  UserCheck,
  Package,
  Settings,
  Bell,
  BarChart3,
  Bot,
  Users,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  Leaf,
  LogOut,
  Warehouse,
  CheckSquare,
  Briefcase,
  ClipboardList,
  ListTodo,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getDemoUser, demoLogout, type DemoUser } from "@/lib/auth";
import { Menu, X } from "lucide-react";

const navItems: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Task Management", href: "/tasks", Icon: ListTodo },
  { label: "Daily Update", href: "/daily-updates", Icon: CalendarDays },
  { label: "Attendance", href: "/attendance", Icon: UserCheck },
  { label: "Asset Management", href: "/asset-management", Icon: Package },
  { label: "Inventory", href: "/inventory", Icon: Warehouse },
  { label: "Approvals", href: "/approvals", Icon: CheckSquare },
  { label: "HR Module", href: "/hr", Icon: Briefcase },
  { label: "Work Logs", href: "/work-logs", Icon: ClipboardList },
  { label: "Facility Config", href: "/facility-config", Icon: Settings },
  { label: "Alerts", href: "/alerts", Icon: Bell },
  { label: "Reports", href: "/reports", Icon: BarChart3 },
  { label: "AI Agent", href: "/ai-agent", Icon: Bot },
  { label: "User Management", href: "/user-management", Icon: Users },
  { label: "Biometric Devices", href: "/biometric-devices", Icon: Fingerprint },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    setUser(getDemoUser());
  }, []);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  function handleLogout() {
    demoLogout();
    router.push("/");
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-2.5 left-2.5 z-50 md:hidden flex items-center justify-center h-8 w-8 rounded-md bg-teal-600 text-white shadow-md"
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen bg-white border-r border-slate-200 text-slate-700 transition-all duration-200 shrink-0",
          // Desktop
          "hidden md:flex",
          collapsed ? "w-[64px]" : "w-[232px]",
          // Mobile overlay
          mobileOpen && "!flex fixed inset-y-0 left-0 z-50 w-[232px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 shrink-0 shadow-sm">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-[14px] font-semibold tracking-tight text-slate-900 leading-tight block">
                  DSR Fortune
                </span>
                <p className="text-[10px] text-slate-400 tracking-wide -mt-0.5">
                  Facility Management
                </p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="md:hidden text-slate-400 hover:text-slate-700"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-teal-100 to-emerald-50 text-teal-800 shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                  )}
                  aria-hidden="true"
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section + Collapse */}
        <div className="border-t border-slate-100">
          {/* User info */}
          {user && (
            <div className={cn(
              "flex items-center gap-3 px-3 py-3",
              collapsed ? "justify-center" : ""
            )}>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-[11px] font-semibold shrink-0">
                {user.initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50/60 transition-colors",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="text-[12px] font-medium">Sign Out</span>}
          </button>

          {/* Collapse Toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 border-t border-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
