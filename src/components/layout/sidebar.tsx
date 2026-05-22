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
        {/* Logo — Newsreader italic wordmark */}
        <div className="flex items-center justify-between px-5 py-6 border-b border-[var(--ink)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center shrink-0 border border-[var(--ink)] bg-[var(--parchment)]">
              <Leaf className="h-4 w-4 text-[var(--ink)]" aria-hidden="true" strokeWidth={1.5} />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-none">
                <span
                  className="text-[22px] font-medium tracking-tight text-[var(--ink)] block leading-none italic"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  DSR Fortune
                </span>
                <p
                  className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)] mt-2 font-semibold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Facility &nbsp;/&nbsp; Spec
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

        {/* Navigation — numbered, spec-sheet TOC */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-4 px-3 space-y-0">
          {navItems.map((item, idx) => {
            const isActive = pathname.startsWith(item.href);
            const num = String(idx + 1).padStart(2, "0");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 px-2 py-2 text-[13px] font-medium transition-colors uppercase tracking-[0.04em] border-b border-transparent",
                  isActive
                    ? "text-[var(--ink)] border-b-[var(--ink)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
                title={collapsed ? item.label : undefined}
              >
                {!collapsed && (
                  <span
                    className={cn(
                      "text-[11px] shrink-0 w-5",
                      isActive ? "text-[var(--ink)]" : "text-[var(--ink-faint)]"
                    )}
                  >
                    {num}
                  </span>
                )}
                <item.Icon
                  className={cn(
                    "h-[15px] w-[15px] shrink-0 transition-colors",
                    isActive ? "text-[var(--ink)]" : "text-[var(--ink-faint)] group-hover:text-[var(--ink-muted)]"
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
              <div
                className="flex h-9 w-9 items-center justify-center border border-[var(--ink)] text-[var(--ink)] text-[10px] font-semibold shrink-0 tracking-[0.05em] bg-[var(--parchment)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {user.initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-semibold text-[var(--ink)] truncate uppercase tracking-[0.04em]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {user.name}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)] truncate mt-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full px-4 py-3 text-[var(--ink-faint)] hover:text-[var(--redline)] hover:bg-[var(--redline-soft)]/40 transition-colors text-[12px] uppercase tracking-[0.1em] font-medium",
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
