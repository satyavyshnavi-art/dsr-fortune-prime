"use client";

import { useState, useEffect } from "react";
import { ChartCard, StatusBadge } from "@/components/shared";
import {
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  Bell,
  Inbox,
} from "lucide-react";

type TabId = "matrix" | "list";

export function TaskStatusWidget() {
  const [activeTab, setActiveTab] = useState<TabId>("matrix");
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((r) => r.json())
      .then((d) => { if (d && !d.error) setData(d); })
      .catch(() => {});
  }, []);

  const total = data?.tasks?.total ?? 0;
  const completed = data?.tasks?.completed ?? 0;
  const overdue = data?.tasks?.overdue ?? 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const eisenhower = data?.tasks?.eisenhower ?? {};
  const eisenhowerQuadrants = [
    {
      label: "Do First",
      key: "do_first",
      color: "bg-red-50 border-red-200",
      badgeColor: "bg-red-100 text-red-700",
      tasks: eisenhower["do_first"] ?? eisenhower["Do First"] ?? 0,
    },
    {
      label: "Schedule",
      key: "schedule",
      color: "bg-yellow-50 border-yellow-200",
      badgeColor: "bg-yellow-100 text-yellow-700",
      tasks: eisenhower["schedule"] ?? eisenhower["Schedule"] ?? 0,
    },
    {
      label: "Delegate",
      key: "delegate",
      color: "bg-blue-50 border-blue-200",
      badgeColor: "bg-blue-100 text-blue-700",
      tasks: eisenhower["delegate"] ?? eisenhower["Delegate"] ?? 0,
    },
    {
      label: "Eliminate",
      key: "eliminate",
      color: "bg-slate-50 border-slate-200",
      badgeColor: "bg-slate-100 text-slate-600",
      tasks: eisenhower["eliminate"] ?? eisenhower["Eliminate"] ?? 0,
    },
  ];

  // If all quadrants are 0 but there are tasks, put unclassified tasks count
  const unclassified = eisenhower["unclassified"] ?? eisenhower["null"] ?? 0;

  const recentTasks = data?.tasks?.recentTasks ?? [];

  return (
    <ChartCard title="Task Status">
      <div className="space-y-2">
        {/* Tabs */}
        <div className="flex gap-0 border-b border-slate-100">
          <button
            onClick={() => setActiveTab("matrix")}
            className={`px-2.5 py-1 text-[10px] font-medium border-b-2 transition-colors ${
              activeTab === "matrix"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Eisenhower Matrix
          </button>
          <button
            onClick={() => setActiveTab("list")}
            className={`px-2.5 py-1 text-[10px] font-medium border-b-2 transition-colors ${
              activeTab === "list"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Task List
          </button>
        </div>

        {/* Eisenhower Matrix View */}
        {activeTab === "matrix" && (
          <div>
            <p className="text-[10px] text-slate-500 font-medium mb-1.5">
              Task Classification & Progress Summary
              {unclassified > 0 && (
                <span className="text-slate-400 ml-1">
                  ({unclassified} unclassified)
                </span>
              )}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {eisenhowerQuadrants.map((q) => (
                <div
                  key={q.label}
                  className={`rounded-md border p-2 text-center ${q.color}`}
                >
                  <span
                    className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded ${q.badgeColor}`}
                  >
                    {q.label}
                  </span>
                  <p className="text-[11px] text-slate-600 mt-1">
                    {q.tasks > 0 ? `${q.tasks} tasks` : "No tasks"}
                  </p>
                  {q.tasks === 0 && (
                    <Inbox className="h-4 w-4 text-slate-300 mx-auto mt-0.5" />
                  )}
                  {q.tasks === 0 && (
                    <p className="text-[9px] text-slate-300">No data</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Task List View */}
        {activeTab === "list" && (
          <div className="rounded-md border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80">
                  <th className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                    Task
                  </th>
                  <th className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                    Priority
                  </th>
                  <th className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider px-2.5 py-1">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.length > 0 ? (
                  recentTasks.map((task: any) => (
                    <tr
                      key={task.id}
                      className="border-t border-slate-100 hover:bg-slate-50/50"
                    >
                      <td className="text-[10px] text-slate-700 px-2.5 py-1 max-w-[180px] truncate">
                        {task.title}
                      </td>
                      <td className="px-2.5 py-1">
                        <StatusBadge
                          status={
                            task.priority
                              ? task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)
                              : "Low"
                          }
                        />
                      </td>
                      <td className="px-2.5 py-1">
                        <StatusBadge
                          status={
                            task.status
                              ? task.status
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c: string) => c.toUpperCase())
                              : "Pending"
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center text-[10px] text-slate-400 py-4"
                    >
                      No tasks found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Stats */}
        <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-slate-100">
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 text-slate-500">
              <CalendarDays className="h-2.5 w-2.5" />
              <span className="text-[12px] font-bold">{total}</span>
            </div>
            <p className="text-[9px] text-slate-400">Total Tasks</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 text-green-600">
              <CheckCircle2 className="h-2.5 w-2.5" />
              <span className="text-[12px] font-bold">{completed}</span>
            </div>
            <p className="text-[9px] text-slate-400">Completed</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 text-blue-500">
              <TrendingUp className="h-2.5 w-2.5" />
              <span className="text-[12px] font-bold">{completionRate}%</span>
            </div>
            <p className="text-[9px] text-slate-400">Rate</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-0.5 text-red-500">
              <Bell className="h-2.5 w-2.5" />
              <span className="text-[12px] font-bold">{overdue}</span>
            </div>
            <p className="text-[9px] text-slate-400">Overdue</p>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}
