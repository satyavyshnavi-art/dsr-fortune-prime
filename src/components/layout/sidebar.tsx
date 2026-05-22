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
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { getDemoUser, demoLogout, type DemoUser } from "@/lib/auth";

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
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 md:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-md"
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" aria-hidden="true" />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex flex-col h-screen bg-white border-r border-slate-100 transition-[width] duration-200 shrink-0",
          "hidden md:flex",
          collapsed ? "w-[64px]" : "w-[232px]",
          mobileOpen && "!flex fixed inset-y-0 left-0 z-50 w-[232px] shadow-xl"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 h-[60px] border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 items-center justify-center shrink-0 rounded-lg bg-gradient-to-br from-emerald-700 to-emerald-900">
              <Leaf className="h-4 w-4 text-white" aria-hidden="true" strokeWidth={2} />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-none">
                <span className="text-[13.5px] font-bold tracking-tight text-slate-900 block">
                  DSR Fortune
                </span>
                <p className="text-[10px] text-slate-400 mt-px font-medium">
                  Facility Management
                </p>
              </div>
            )}
          </div>
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="md:hidden text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav aria-label="Main navigation" className="flex-1 overflow-y-auto py-2 px-2.5">
          <div className="space-y-px">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[12.5px] font-medium transition-colors",
                    isActive
                      ? "text-emerald-800 bg-emerald-50/80"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2.5px] rounded-r-full bg-emerald-700"
                      aria-hidden="true"
                    />
                  )}
                  <item.Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive ? "text-emerald-700" : "text-slate-400 group-hover:text-slate-600"
                    )}
                    aria-hidden="true"
                    strokeWidth={1.75}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-100 shrink-0">
          {user && (
            <div className={cn(
              "flex items-center gap-2.5 px-3.5 py-3",
              collapsed ? "justify-center" : ""
            )}>
              <div className="flex h-7 w-7 items-center justify-center text-white text-[10px] font-semibold shrink-0 rounded-full bg-gradient-to-br from-emerald-700 to-emerald-800">
                {user.initials}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-slate-800 truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center border-t border-slate-100">
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-2 flex-1 px-3.5 py-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/60 transition-colors text-[11.5px] font-medium",
                collapsed ? "justify-center" : ""
              )}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" aria-hidden="true" strokeWidth={1.5} />
              {!collapsed && <span>Sign Out</span>}
            </button>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden md:flex items-center justify-center h-full px-3 py-2.5 border-l border-slate-100 text-slate-300 hover:text-slate-500 transition-colors"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
