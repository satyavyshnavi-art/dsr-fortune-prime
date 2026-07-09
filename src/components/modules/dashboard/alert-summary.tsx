"use client";

import { ChartCard } from "@/components/shared";
import { AlertTriangle, AlertCircle, Info, Bell } from "lucide-react";

interface AlertCount {
  severity: string;
  count: number;
  color: string;
  bgColor: string;
  icon: React.ElementType;
}

const mockAlerts: AlertCount[] = [
  { severity: "Critical", count: 3, color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: AlertTriangle },
  { severity: "High", count: 7, color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", icon: AlertCircle },
  { severity: "Medium", count: 12, color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: Bell },
  { severity: "Low", count: 5, color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: Info },
];

interface AlertSummaryProps {
  data?: any;
}

export function AlertSummary({ data }: AlertSummaryProps) {
  const alertData = data?.alerts;

  const alerts: AlertCount[] = alertData && typeof alertData.critical === "number"
    ? [
        { severity: "Critical", count: alertData.critical ?? 0, color: "text-red-700", bgColor: "bg-red-50 border-red-200", icon: AlertTriangle },
        { severity: "High", count: alertData.high ?? 0, color: "text-orange-700", bgColor: "bg-orange-50 border-orange-200", icon: AlertCircle },
        { severity: "Medium", count: alertData.medium ?? 0, color: "text-yellow-700", bgColor: "bg-yellow-50 border-yellow-200", icon: Bell },
        { severity: "Low", count: alertData.low ?? 0, color: "text-blue-700", bgColor: "bg-blue-50 border-blue-200", icon: Info },
      ]
    : mockAlerts;

  const totalOpen = alerts.reduce((sum, a) => sum + a.count, 0);

  return (
    <ChartCard
      title="Open Alerts"
      subtitle={`${totalOpen} alerts require attention`}
    >
      <div className="space-y-2">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div
              key={alert.severity}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${alert.bgColor}`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-3.5 w-3.5 ${alert.color}`} aria-hidden="true" />
                <span className={`text-[12px] font-medium ${alert.color}`}>
                  {alert.severity}
                </span>
              </div>
              <span className={`text-[14px] font-bold ${alert.color}`}>
                {alert.count}
              </span>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
