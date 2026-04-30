"use client";

import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import { housekeepingTasks, weeklyTasks, monthlyTasks } from "./mock-data";

const TASKS_PER_PAGE = 10;

type ViewMode = "Daily" | "Weekly" | "Monthly";

// Rating cycle: empty → complete → incomplete → not_done → empty
type Rating = "" | "complete" | "incomplete" | "not_done";
const RATING_CYCLE: Rating[] = ["", "complete", "incomplete", "not_done"];

const RATING_STYLES: Record<Rating, { bg: string; border: string }> = {
  "":           { bg: "bg-white",     border: "border-slate-300" },
  complete:     { bg: "bg-green-500", border: "border-green-500" },
  incomplete:   { bg: "bg-blue-500",  border: "border-blue-500" },
  not_done:     { bg: "bg-red-500",   border: "border-red-500" },
};

function RatingCell({ rating, onClick }: { rating: Rating; onClick: () => void }) {
  const style = RATING_STYLES[rating];
  return (
    <button
      onClick={onClick}
      className={`h-[16px] w-[16px] rounded-[3px] border-[1.5px] ${style.border} ${style.bg} transition-colors duration-100 flex items-center justify-center hover:opacity-80`}
      title={rating || "Not filled"}
    >
      {rating === "complete" && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {rating === "incomplete" && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <rect x="2.5" y="4.5" width="5" height="1.2" rx="0.6" fill="white" />
        </svg>
      )}
      {rating === "not_done" && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}

const MODE_CONFIG: Record<ViewMode, {
  tasks: string[];
  days: number;
  title: string;
  frequency: string;
  version: string;
  checklist: string;
}> = {
  Daily: {
    tasks: housekeepingTasks,
    days: 23,
    title: "Housekeeping Daily Tasks",
    frequency: "Daily Frequency",
    version: "Version: 3",
    checklist: "HOUSEKEEPING CHECKLIST",
  },
  Weekly: {
    tasks: weeklyTasks,
    days: 28,
    title: "Housekeeping Weekly Tasks",
    frequency: "Weekly Frequency",
    version: "Version: 1",
    checklist: "HOUSEKEEPING_Weekly_Template.xlsx",
  },
  Monthly: {
    tasks: monthlyTasks,
    days: 28,
    title: "Housekeeping Monthly Tasks",
    frequency: "Monthly Frequency",
    version: "Version: 1",
    checklist: "HOUSEKEEPING_Monthly_Template.xlsx",
  },
};

const LEGEND = [
  { color: "bg-green-500", icon: "check", label: "Complete" },
  { color: "bg-blue-500", icon: "dash", label: "Incomplete" },
  { color: "bg-red-500", icon: "x", label: "Not Done" },
  { color: "bg-slate-300", icon: "dash", label: "Not Filled" },
] as const;

export function HygieneTab() {
  const [category, setCategory] = useState("Housekeeping");
  const [viewMode, setViewMode] = useState<ViewMode>("Daily");
  const [currentPage, setCurrentPage] = useState(1);
  const [ratings, setRatings] = useState<Record<string, Rating>>({});

  const config = MODE_CONFIG[viewMode];
  const days = useMemo(() => Array.from({ length: config.days }, (_, i) => i + 1), [config.days]);

  const cycleRating = useCallback((taskIdx: number, day: number) => {
    const key = `${viewMode}-${taskIdx}-${day}`;
    setRatings((prev) => {
      const current = prev[key] || "";
      const nextIdx = (RATING_CYCLE.indexOf(current) + 1) % RATING_CYCLE.length;
      return { ...prev, [key]: RATING_CYCLE[nextIdx] };
    });
  }, [viewMode]);

  const totalPages = Math.ceil(config.tasks.length / TASKS_PER_PAGE);
  const startIdx = (currentPage - 1) * TASKS_PER_PAGE;
  const visibleTasks = config.tasks.slice(startIdx, startIdx + TASKS_PER_PAGE);

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-blue-600" />
          <h3 className="text-[15px] font-semibold text-slate-900">Daily Hygiene Calendar</h3>
        </div>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-8 text-[12px] px-4 rounded-lg">
          <FileText className="h-3.5 w-3.5 mr-1.5" />
          Export Report
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Month</label>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[13px] font-medium text-slate-700 px-2 min-w-[70px] text-center">Apr 2026</span>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Section</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[12px] min-w-[130px]"
          >
            <option>Housekeeping</option>
            <option>Pest Control</option>
            <option>Gardening</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Version</label>
          <select className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[12px] min-w-[100px]">
            <option>V1 (Active)</option>
            <option>V2</option>
            <option>V3</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="text-[11px] text-slate-400 mb-1 block">Checklist</label>
          <select className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[12px] w-full max-w-[400px]">
            <option>{config.checklist}</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 mb-1 block">Frequency</label>
          <div className="flex rounded-lg border border-slate-200 overflow-hidden">
            {(["Daily", "Weekly", "Monthly"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleModeChange(mode)}
                className={`px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-50 p-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold text-slate-900">{config.title}</h4>
              <p className="text-[11px] text-slate-400">
                Site: GreenView Demo Park &middot; Month: April 2026 &middot; {config.version} &middot; {config.frequency}
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="border border-slate-200 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 font-medium mb-1.5">Status Icons:</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className={`h-[14px] w-[14px] rounded-[3px] ${l.color} flex items-center justify-center`}>
                    {l.icon === "check" && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5L4.5 7.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    )}
                    {l.icon === "dash" && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><rect x="2.5" y="4.5" width="5" height="1.2" rx="0.6" fill="white" /></svg>
                    )}
                    {l.icon === "x" && (
                      <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M3 3L7 7M7 3L3 7" stroke="white" strokeWidth="1.3" strokeLinecap="round" /></svg>
                    )}
                  </span>
                  <span className="text-[11px] text-slate-600">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 pl-6 pr-1 text-[11px] font-medium text-slate-400 w-6">#</th>
                <th className="text-left py-3 px-2 text-[11px] font-medium text-slate-400 uppercase min-w-[280px]">Description</th>
                {days.map((day) => (
                  <th key={day} className="text-center py-3 px-0 text-[11px] font-medium text-slate-400 w-7">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visibleTasks.map((task, idx) => {
                const globalIdx = startIdx + idx;
                return (
                  <tr key={globalIdx} className="hover:bg-slate-50/40">
                    <td className="py-3.5 pl-6 pr-1 text-[12px] text-slate-400 font-semibold">
                      {globalIdx + 1}
                    </td>
                    <td className="py-3.5 px-2 text-[13px] text-slate-700">{task}</td>
                    {days.map((day) => (
                      <td key={day} className="py-3.5 px-0">
                        <div className="flex justify-center">
                          <RatingCell
                            rating={ratings[`${viewMode}-${globalIdx}-${day}`] || ""}
                            onClick={() => cycleRating(globalIdx, day)}
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/30">
          <p className="text-[12px] text-slate-400">
            Showing {startIdx + 1}&ndash;{Math.min(startIdx + TASKS_PER_PAGE, config.tasks.length)} of {config.tasks.length} tasks
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 text-[12px] px-3 rounded-lg"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Prev
            </Button>
            <span className="text-[12px] text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 text-[12px] px-3 rounded-lg"
            >
              Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
