"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

const navItems: { label: string; href: string; Icon: LucideIcon }[] = [
  { label: "Dashboard", href: "/dashboard", Icon: LayoutDashboard },
  { label: "Daily Update", href: "/daily-updates", Icon: CalendarDays },
  { label: "Attendance", href: "/attendance", Icon: UserCheck },
  { label: "Asset Management", href: "/asset-management", Icon: Package },
  { label: "Facility Config", href: "/facility-config", Icon: Settings },
  { label: "Alerts", href: "/alerts", Icon: Bell },
  { label: "Reports", href: "/reports", Icon: BarChart3 },
  { label: "AI Agent", href: "/ai-agent", Icon: Bot },
  { label: "User Management", href: "/user-management", Icon: Users },
  { label: "Biometric Devices", href: "/biometric-devices", Icon: Fingerprint },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-gradient-to-b from-[#1a2f2a] to-[#0f241c] text-white transition-all duration-200 shrink-0",
        collapsed ? "w-[52px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-3 py-4 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] shrink-0">
          <Leaf className="h-4 w-4 text-white" />
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

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 px-1.5 space-y-0.5">
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
              <item.Icon className="h-[16px] w-[16px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-2.5 border-t border-white/10 text-white/30 hover:text-white/60 transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
