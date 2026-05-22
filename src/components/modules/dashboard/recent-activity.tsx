"use client";

import { ChartCard } from "@/components/shared";
import {
  CheckCircle2,
  UserPlus,
  AlertTriangle,
  FileText,
  Wrench,
  Clock,
} from "lucide-react";

interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: "task" | "attendance" | "alert" | "report" | "maintenance" | "general";
}

const mockData: ActivityItem[] = [
  { id: "1", action: "Completed daily floor inspection", user: "Rajesh K.", timestamp: "10 min ago", type: "task" },
  { id: "2", action: "Marked attendance for Block C team", user: "Priya M.", timestamp: "25 min ago", type: "attendance" },
  { id: "3", action: "Raised critical water pressure alert", user: "System", timestamp: "1 hr ago", type: "alert" },
  { id: "4", action: "Generated monthly attendance report", user: "Admin", timestamp: "2 hr ago", type: "report" },
  { id: "5", action: "Completed AC maintenance in Floor 3", user: "Suresh R.", timestamp: "3 hr ago", type: "maintenance" },
  { id: "6", action: "Updated inventory stock levels", user: "Meena S.", timestamp: "4 hr ago", type: "general" },
];

const typeIconMap: Record<ActivityItem["type"], React.ElementType> = {
  task: CheckCircle2,
  attendance: UserPlus,
  alert: AlertTriangle,
  report: FileText,
  maintenance: Wrench,
  general: Clock,
};

const typeColorMap: Record<ActivityItem["type"], string> = {
  task: "text-teal-500 bg-teal-50",
  attendance: "text-blue-500 bg-blue-50",
  alert: "text-rose-500 bg-rose-50",
  report: "text-indigo-500 bg-indigo-50",
  maintenance: "text-amber-500 bg-amber-50",
  general: "text-slate-400 bg-slate-50",
};

interface RecentActivityProps {
  data?: any;
}

export function RecentActivity({ data }: RecentActivityProps) {
  const activities: ActivityItem[] = data?.recentActivity ?? mockData;

  return (
    <ChartCard
      title="Recent Activity"
      subtitle="Latest actions across the facility"
    >
      <div className="space-y-0">
        {activities.map((activity, idx) => {
          const Icon = typeIconMap[activity.type] ?? Clock;
          const colorClass = typeColorMap[activity.type] ?? typeColorMap.general;

          return (
            <div key={activity.id} className="flex items-start gap-2.5 py-2 border-b border-slate-100/60 last:border-b-0">
              <div className={`rounded-lg p-1.5 shrink-0 ${colorClass}`}>
                <Icon className="h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-slate-600 leading-snug">
                  {activity.action}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-medium text-slate-500">{activity.user}</span>
                  <span className="text-[10px] text-slate-300">&middot;</span>
                  <span className="text-[10px] text-slate-400">{activity.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
