"use client";

import { useState, useMemo, Fragment } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import type { EmployeeGoal } from "./mock-data";
import { MOCK_GOALS, EVAL_LEVEL_LABELS } from "./mock-data";

export function GoalsTab() {
  const {
    data: apiGoals,
    loading,
    error: apiError,
  } = useApi<any[]>({
    url: "/api/v1/hr/goals",
    initialData: [],
  });

  const goals: EmployeeGoal[] = useMemo(() => {
    if (apiError || !apiGoals || apiGoals.length === 0) {
      return apiError ? MOCK_GOALS : (apiGoals ?? []).length === 0 ? MOCK_GOALS : [];
    }
    return apiGoals.map((r: any) => ({
      id: r.id,
      employeeId: r.employeeId ?? "",
      employeeName: r.employeeName ?? "",
      empId: r.empId ?? "",
      goalTitle: r.goalTitle ?? "",
      targetDate: r.targetDate ?? "",
      status: r.status ?? "in_progress",
      evaluations: r.evaluations ?? [],
    }));
  }, [apiGoals, apiError]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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
    <div className="space-y-3">
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 py-2 w-8" />
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2">
                Employee
              </th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2">
                Goal
              </th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2">
                Target
              </th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2">
                Status
              </th>
              <th className="text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 py-2">
                Evaluations
              </th>
            </tr>
          </thead>
          <tbody>
            {goals.map((goal) => {
              const isExpanded = expanded.has(goal.id);
              const statusVariant =
                goal.status === "completed"
                  ? "success"
                  : goal.status === "overdue"
                  ? "danger"
                  : "info";

              return (
                <Fragment key={goal.id}>
                  <tr className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-3 py-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => toggle(goal.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                        )}
                      </Button>
                    </td>
                    <td className="px-2 py-2">
                      <div>
                        <span className="text-[12px] font-medium text-slate-900">
                          {goal.employeeName}
                        </span>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {goal.empId}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className="text-[12px] text-slate-700">
                        {goal.goalTitle}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className="text-[12px] text-slate-500">
                        {goal.targetDate}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <StatusBadge status={goal.status} variant={statusVariant} />
                    </td>
                    <td className="px-2 py-2">
                      <span className="text-[11px] text-slate-500">
                        {goal.evaluations.length} eval(s)
                      </span>
                    </td>
                  </tr>

                  {/* Expanded evaluations */}
                  {isExpanded &&
                    goal.evaluations.map((ev, idx) => (
                      <tr
                        key={`${goal.id}-${ev.level}`}
                        className="bg-slate-50/30 border-t border-slate-50"
                      >
                        <td />
                        <td className="px-2 py-1.5" colSpan={2}>
                          <div className="flex items-center gap-2 pl-4">
                            <StatusBadge
                              status={EVAL_LEVEL_LABELS[ev.level]}
                              variant={
                                ev.level === "management"
                                  ? "purple"
                                  : ev.level === "hr"
                                  ? "info"
                                  : ev.level === "ops_head"
                                  ? "warning"
                                  : "neutral"
                              }
                            />
                            <span className="text-[11px] text-slate-500 italic">
                              &ldquo;{ev.comments}&rdquo;
                            </span>
                          </div>
                        </td>
                        <td />
                        <td />
                        <td className="px-2 py-1.5">
                          <span
                            className={`text-[12px] font-mono ${
                              ev.score >= 80
                                ? "text-teal-600"
                                : ev.score >= 60
                                ? "text-amber-600"
                                : "text-red-600"
                            }`}
                          >
                            {ev.score}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}
    </div>
  );
}
