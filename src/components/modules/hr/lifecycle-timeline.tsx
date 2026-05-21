"use client";

import { useMemo } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import {
  UserPlus,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { LifecycleEvent, EventType } from "./mock-data";
import { MOCK_LIFECYCLE_EVENTS } from "./mock-data";

const eventConfig: Record<
  EventType,
  { icon: React.ElementType; color: string; lineColor: string; variant: "success" | "info" | "purple" | "warning" | "danger" }
> = {
  joining: { icon: UserPlus, color: "text-emerald-500", lineColor: "bg-emerald-200", variant: "success" },
  confirmation: { icon: CheckCircle2, color: "text-blue-500", lineColor: "bg-blue-200", variant: "info" },
  promotion: { icon: TrendingUp, color: "text-purple-500", lineColor: "bg-purple-200", variant: "purple" },
  warning: { icon: AlertTriangle, color: "text-amber-500", lineColor: "bg-amber-200", variant: "warning" },
  separation: { icon: LogOut, color: "text-red-500", lineColor: "bg-red-200", variant: "danger" },
};

export function LifecycleTimeline() {
  const {
    data: apiResponse,
    loading,
    error: apiError,
  } = useApi<any>({
    url: "/api/v1/hr/lifecycle",
    initialData: [],
  });

  const events: LifecycleEvent[] = useMemo(() => {
    const apiEvents: any[] = Array.isArray(apiResponse)
      ? apiResponse
      : Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];
    if (apiError || apiEvents.length === 0) return MOCK_LIFECYCLE_EVENTS;
    return apiEvents.map((r: any) => ({
      id: r.id,
      employeeId: r.employeeId ?? "",
      employeeName: r.employeeName ?? "",
      empId: r.empId ?? "",
      type: r.type ?? "joining",
      date: r.date ?? "",
      description: r.description ?? "",
    }));
  }, [apiResponse, apiError]);

  // Group by employee
  const grouped = useMemo(() => {
    const map = new Map<string, LifecycleEvent[]>();
    for (const ev of events) {
      const key = ev.employeeId;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    // Sort events within each group by date
    for (const [, evts] of map) {
      evts.sort((a, b) => a.date.localeCompare(b.date));
    }
    return Array.from(map.entries());
  }, [events]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          <span className="text-[11px] text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {grouped.map(([empId, empEvents]) => {
        const first = empEvents[0];
        return (
          <div key={empId} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[13px] font-semibold text-slate-800">
                {first.employeeName}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {first.empId}
              </span>
            </div>

            <div className="space-y-0">
              {empEvents.map((ev, idx) => {
                const config = eventConfig[ev.type];
                const Icon = config.icon;
                const isLast = idx === empEvents.length - 1;

                return (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="shrink-0">
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 min-h-[20px] ${config.lineColor}`} />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ev.type} variant={config.variant} />
                        <span className="text-[11px] text-slate-400">{ev.date}</span>
                      </div>
                      <p className="text-[12px] text-slate-600 mt-0.5">
                        {ev.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}
    </div>
  );
}
