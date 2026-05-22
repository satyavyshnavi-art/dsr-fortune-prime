"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/shared/kpi-card";
import { useApi } from "@/hooks/use-api";
import {
  CheckCircle,
  XCircle,
  ClipboardList,
  TrendingUp,
  Search,
} from "lucide-react";

interface PerformanceRecord {
  id: string;
  period: string | null;
  tasksAssigned: number | null;
  tasksCompleted: number | null;
  tasksMissed: number | null;
  score: string | null;
  createdAt: string;
}

interface PerformanceResponse {
  data: PerformanceRecord[];
  meta: {
    total: number;
    userId: string;
    summary?: {
      tasksAssigned: number;
      tasksCompleted: number;
      tasksMissed: number;
      averageScore: number;
      completionRate: number;
    };
  };
}

export function PerformanceDashboard() {
  const [userId, setUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const { data, loading, error } = useApi<PerformanceResponse>({
    url: `/api/v1/performance/${searchId}`,
    autoFetch: !!searchId,
    initialData: { data: [], meta: { total: 0, userId: "" } },
  });

  const summary = data?.meta?.summary;
  const records = data?.data ?? [];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (userId.trim()) {
      setSearchId(userId.trim());
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md">
        <Input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter Employee User ID"
          className="h-8 text-[12px]"
        />
        <Button type="submit" className="h-8 text-[12px] gap-1.5" disabled={!userId.trim()}>
          <Search className="h-3 w-3" />
          Search
        </Button>
      </form>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600" />
            <span className="text-[11px] text-slate-400">Loading performance...</span>
          </div>
        </div>
      )}

      {summary && !loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <KPICard
              title="Tasks Assigned"
              value={summary.tasksAssigned}
              icon={ClipboardList}
              color="blue"
            />
            <KPICard
              title="Tasks Completed"
              value={summary.tasksCompleted}
              icon={CheckCircle}
              color="green"
            />
            <KPICard
              title="Tasks Missed"
              value={summary.tasksMissed}
              icon={XCircle}
              color="red"
            />
            <KPICard
              title="Completion Rate"
              value={`${summary.completionRate}%`}
              icon={TrendingUp}
              color="green"
              subtitle={`Avg Score: ${summary.averageScore}`}
            />
          </div>

          {/* Period breakdown */}
          <div>
            <p className="text-[12px] font-semibold text-slate-700 mb-2">
              Period Breakdown ({records.length})
            </p>
            {records.length === 0 ? (
              <p className="text-[11px] text-slate-400 py-4">No performance records found.</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-[12px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-slate-500">Period</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-500">Assigned</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-500">Completed</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-500">Missed</th>
                      <th className="text-right px-3 py-2 font-medium text-slate-500">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-700">
                          {r.period ?? "—"}
                        </td>
                        <td className="px-3 py-2 text-right text-slate-600">
                          {r.tasksAssigned ?? 0}
                        </td>
                        <td className="px-3 py-2 text-right text-teal-600">
                          {r.tasksCompleted ?? 0}
                        </td>
                        <td className="px-3 py-2 text-right text-red-600">
                          {r.tasksMissed ?? 0}
                        </td>
                        <td className="px-3 py-2 text-right font-mono text-slate-700">
                          {r.score ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {!searchId && !loading && (
        <p className="text-[11px] text-slate-400 py-8 text-center">
          Enter an employee User ID to view performance data.
        </p>
      )}

      {error && searchId && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable. {error}
        </p>
      )}
    </div>
  );
}
