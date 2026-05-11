"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Wrench,
  Droplets,
  Eye,
  CalendarClock,
} from "lucide-react";

export type AlertSeverity = "critical" | "high" | "medium" | "low";
export type AlertStatus = "unacknowledged" | "acknowledged" | "dismissed" | "resolved";
export type AlertCategory =
  | "attendance"
  | "asset_maintenance"
  | "water_management"
  | "power_management"
  | "hygiene"
  | "complaints"
  | "critical_systems"
  | "general";

export interface AlertItem {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  message: string;
  status: AlertStatus;
  createdAt: string;
  source?: string;
}

const severityConfig: Record<
  AlertSeverity,
  { bg: string; border: string; badge: string; badgeText: string; icon: string }
> = {
  critical: {
    bg: "bg-red-50/60",
    border: "border-l-[3px] border-l-red-600",
    badge: "bg-red-600 text-white",
    badgeText: "Critical",
    icon: "text-red-600",
  },
  high: {
    bg: "bg-orange-50/60",
    border: "border-l-[3px] border-l-orange-500",
    badge: "bg-orange-500 text-white",
    badgeText: "High Priority",
    icon: "text-orange-500",
  },
  medium: {
    bg: "bg-yellow-50/60",
    border: "border-l-[3px] border-l-yellow-500",
    badge: "bg-yellow-500 text-white",
    badgeText: "Medium",
    icon: "text-yellow-500",
  },
  low: {
    bg: "bg-blue-50/60",
    border: "border-l-[3px] border-l-blue-400",
    badge: "bg-blue-400 text-white",
    badgeText: "Low",
    icon: "text-blue-400",
  },
};

const categoryIcons: Record<string, React.ElementType> = {
  attendance: Users,
  asset_maintenance: Wrench,
  water_management: Droplets,
  power_management: AlertTriangle,
  hygiene: Eye,
  complaints: AlertTriangle,
  critical_systems: XCircle,
  general: AlertTriangle,
  // DB seed uses short category names
  maintenance: Wrench,
  security: XCircle,
  water: Droplets,
  power: AlertTriangle,
  fire_safety: AlertTriangle,
};

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge: (id: string) => void;
  onDismiss: (id: string) => void;
  onResolve?: (id: string) => void;
  onReschedule?: (id: string) => void;
}

export function AlertCard({
  alert,
  onAcknowledge,
  onDismiss,
  onResolve,
  onReschedule,
}: AlertCardProps) {
  const config = severityConfig[alert.severity] || severityConfig.medium;
  const CategoryIcon = categoryIcons[alert.category] || AlertTriangle;
  const timeAgo = getTimeAgo(alert.createdAt);

  return (
    <div
      className={cn(
        "rounded-md p-3",
        config.bg,
        config.border,
        "transition-all hover:shadow-sm"
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className={cn("mt-px shrink-0", config.icon)}>
          <CategoryIcon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Badge
              className={cn(
                "text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0 h-[16px] leading-[16px] rounded-sm shrink-0",
                config.badge
              )}
            >
              {config.badgeText}
            </Badge>
            <h4 className="font-semibold text-[12px] text-slate-900 truncate leading-tight">
              {alert.title}
            </h4>
          </div>
          <p className="text-[11px] text-slate-600 leading-[1.4] mb-1.5 line-clamp-2">
            {alert.message}
          </p>
          <div className="flex items-center gap-3 text-[10px] text-slate-400 mb-2">
            <span className="flex items-center gap-0.5">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo}
            </span>
            {alert.source && <span>{alert.source}</span>}
          </div>
          <div className="flex items-center gap-1.5">
            {alert.status === "unacknowledged" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                  Acknowledge
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-[10px] px-2 bg-white hover:bg-slate-100 border-slate-200 text-slate-600"
                  onClick={() => onDismiss(alert.id)}
                >
                  <XCircle className="h-2.5 w-2.5 mr-0.5" />
                  Dismiss
                </Button>
              </>
            )}
            {alert.status === "acknowledged" && (
              <>
                {onResolve && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2 bg-white hover:bg-green-50 border-green-200 text-green-700"
                    onClick={() => onResolve(alert.id)}
                  >
                    <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                    Resolve
                  </Button>
                )}
                {onReschedule && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] px-2 bg-white hover:bg-amber-50 border-amber-200 text-amber-700"
                    onClick={() => onReschedule(alert.id)}
                  >
                    <CalendarClock className="h-2.5 w-2.5 mr-0.5" />
                    Reschedule
                  </Button>
                )}
              </>
            )}
            {alert.status === "resolved" && (
              <Badge className="bg-green-100 text-green-700 text-[9px] h-[16px] px-1.5">
                <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                Resolved
              </Badge>
            )}
            {alert.status === "dismissed" && (
              <Badge className="bg-slate-100 text-slate-500 text-[9px] h-[16px] px-1.5">
                Dismissed
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
