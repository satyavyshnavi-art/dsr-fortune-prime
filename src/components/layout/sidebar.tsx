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
        className="fixed top-2.5 left-2.5 z-50 md:hidden flex items-center justify-center h-8 w-8 rounded bg-[var(--mark)] text-white shadow-md"
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen bg-[var(--parchment)] border-r border-[var(--rule)] text-[var(--ink-muted)] transition-all duration-200 shrink-0",
          // Desktop
          "hidden md:flex",
          collapsed ? "w-[68px]" : "w-[240px]",
          // Mobile overlay
          mobileOpen && "!flex fixed inset-y-0 left-0 z-50 w-[240px]"
        )}
      >
        {/* Logo — editorial serif */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-[var(--rule)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded shrink-0 bg-[var(--mark)]">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-none">
                <span
                  className="text-[20px] font-medium tracking-tight text-[var(--ink)] block leading-none"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  DSR Fortune
                </span>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[var(--ink-faint)] mt-1.5">
                  Facility Management
                </p>
              </div>
            )}
          </div>
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="md:hidden text-[var(--ink-faint)] hover:text-[var(--ink)]"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded px-3 py-[7px] text-[12.5px] font-medium transition-colors",
                  isActive
                    ? "text-[var(--ink)] bg-[var(--vellum)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)] hover:bg-[var(--vellum)]/60"
                )}
                title={collapsed ? item.label : undefined}
              >
                {/* Active rule — single line on the left, signature mark */}
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[2px] bg-[var(--mark)]"
                    aria-hidden="true"
                  />
                )}
                <item.Icon
                  className={cn(
                    "h-[16px] w-[16px] shrink-0 transition-colors",
                    isActive ? "text-[var(--mark)]" : "text-[var(--ink-faint)] group-hover:text-[var(--ink-muted)]"
                  )}
                  aria-hidden="true"
                  strokeWidth={1.5}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section + Collapse */}
        <div className="border-t border-[var(--rule)]">
          {user && (
            <div className={cn(
              "flex items-center gap-3 px-4 py-3",
              collapsed ? "justify-center" : ""
            )}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--mark)] text-white text-[10px] font-semibold shrink-0 tracking-wide">
                {user.initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[var(--ink)] truncate">{user.name}</p>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[var(--ink-faint)] truncate mt-0.5">{user.role}</p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2.5 text-[var(--ink-faint)] hover:text-[var(--redline)] hover:bg-[var(--redline-soft)]/40 transition-colors text-[11px] uppercase tracking-[0.1em] font-medium",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
            {!collapsed && <span>Sign Out</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 border-t border-[var(--rule)] text-[var(--ink-faint)] hover:text-[var(--ink-muted)] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
