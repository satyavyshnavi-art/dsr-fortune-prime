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
        className="fixed top-2.5 left-2.5 z-50 md:hidden flex items-center justify-center h-8 w-8 rounded-md bg-[#1a2f2a] text-white shadow-md"
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
          "flex flex-col h-screen bg-gradient-to-b from-[#1a2f2a] to-[#0f241c] text-white transition-all duration-200 shrink-0",
          // Desktop
          "hidden md:flex",
          collapsed ? "w-[52px]" : "w-[220px]",
          // Mobile overlay
          mobileOpen && "!flex fixed inset-y-0 left-0 z-50 w-[220px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] shrink-0">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="text-[13px] font-semibold tracking-tight text-white/95 leading-tight block">
                  DSR Fortune Prime
                </span>
                <p className="text-[9px] text-white/40 tracking-wider -mt-0.5">
                  Facility Management Portal
                </p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="md:hidden text-white/50 hover:text-white/80"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[#10b981]/20 text-[#34d399]"
                    : "text-white/50 hover:bg-white/8 hover:text-white/80"
                )}
              >
                <item.Icon className="h-[16px] w-[16px] shrink-0" aria-hidden="true" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section + Collapse */}
        <div className="border-t border-white/10">
          {/* User info */}
          {user && (
            <div className={cn(
              "flex items-center gap-2.5 px-3 py-2.5",
              collapsed ? "justify-center" : ""
            )}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10b981]/20 text-[#34d399] text-[10px] font-semibold shrink-0">
                {user.initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white/80 truncate">{user.name}</p>
                  <p className="text-[10px] text-white/40 truncate">{user.role}</p>
                </div>
              )}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2 text-white/40 hover:text-red-400 hover:bg-white/5 transition-colors",
              collapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {!collapsed && <span className="text-[12px]">Sign Out</span>}
          </button>

          {/* Collapse Toggle — desktop only */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex items-center justify-center w-full py-2 border-t border-white/10 text-white/30 hover:text-white/60 transition-colors"
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
