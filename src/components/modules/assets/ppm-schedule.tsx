"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockPPMTasks, mockCategories, type PPMTask } from "./mock-data";
import { Plus, RefreshCw, Calendar, LayoutGrid, List, CheckCircle } from "lucide-react";
import { toast } from "sonner";

type ViewType = "week" | "month" | "day" | "year";

const statusColors: Record<string, string> = {
  completed: "bg-green-500 text-white",
  overdue: "bg-red-500 text-white",
  in_progress: "bg-yellow-400 text-slate-900",
  scheduled: "bg-blue-500 text-white",
};

const statusDotColors: Record<string, string> = {
  completed: "bg-green-500",
  overdue: "bg-red-500",
  in_progress: "bg-yellow-400",
  scheduled: "bg-blue-500",
};

export function PPMSchedule() {
  const [tasks, setTasks] = useState<PPMTask[]>([...mockPPMTasks]);
  const [viewType, setViewType] = useState<ViewType>("week");
  const [year, setYear] = useState("2026");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);

  // Add PPM form state
  const [newAsset, setNewAsset] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newWeek, setNewWeek] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const overdueTasks = tasks.filter((t) => t.status === "overdue").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
  const scheduledTasks = tasks.filter((t) => t.status === "scheduled").length;

  // Filter tasks
  const filteredTasks =
    categoryFilter === "all"
      ? tasks
      : tasks.filter((t) => t.categoryName === categoryFilter);

  // Group tasks by week
  const weekGroups: Record<number, PPMTask[]> = {};
  filteredTasks.forEach((task) => {
    if (!weekGroups[task.weekNumber]) {
      weekGroups[task.weekNumber] = [];
    }
    weekGroups[task.weekNumber].push(task);
  });

  // Calculate weeks to show based on view type
  const getWeeksToShow = () => {
    switch (viewType) {
      case "day":
        return Array.from({ length: 4 }, (_, i) => i + 1);
      case "week":
        return Array.from({ length: 12 }, (_, i) => i + 1);
      case "month":
        return Array.from({ length: 24 }, (_, i) => i + 1);
      case "year":
        return Array.from({ length: 52 }, (_, i) => i + 1);
      default:
        return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  };

  const weeksToShow = getWeeksToShow();

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Toggle task status
  const handleToggleComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        if (t.status === "completed") {
          toast.success("Task marked as scheduled");
          return { ...t, status: "scheduled" as const };
        }
        toast.success("Task marked as completed");
        return { ...t, status: "completed" as const };
      })
    );
  };

  const handleAddPPM = () => {
    const errs: Record<string, string> = {};
    if (!newAsset.trim()) errs.newAsset = "Asset name is required";
    if (!newCategory) errs.newCategory = "Category is required";
    if (!newWeek) errs.newWeek = "Week number is required";
    else {
      const weekNum = parseInt(newWeek);
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) errs.newWeek = "Week must be 1-52";
    }
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const weekNum = parseInt(newWeek);
    const newTask: PPMTask = {
      id: `ppm-${Date.now()}`,
      assetName: newAsset,
      categoryName: newCategory,
      weekNumber: weekNum,
      status: "scheduled",
      scheduledDate: `${year}-01-01`,
    };
    setTasks((prev) => [...prev, newTask]);
    setNewAsset("");
    setNewCategory("");
    setNewWeek("");
    setErrors({});
    setAddOpen(false);
    toast.success("PPM task added successfully");
  };

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">View Type:</span>
          {(["week", "month", "day", "year"] as ViewType[]).map((vt) => (
            <Button
              key={vt}
              variant={viewType === vt ? "default" : "outline"}
              size="sm"
              className={`text-[10px] h-6 px-2 ${
                viewType === vt ? "bg-slate-800 text-white hover:bg-slate-700" : ""
              }`}
              onClick={() => setViewType(vt)}
            >
              {vt === "week" ? (
                <LayoutGrid className="h-3 w-3 mr-0.5" />
              ) : vt === "month" ? (
                <Calendar className="h-3 w-3 mr-0.5" />
              ) : vt === "day" ? (
                <List className="h-3 w-3 mr-0.5" />
              ) : (
                <Calendar className="h-3 w-3 mr-0.5" />
              )}
              {vt.charAt(0).toUpperCase() + vt.slice(1)} View
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Filter:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="flex h-7 w-32 rounded-lg border border-input bg-transparent px-2 text-[11px]"
          >
            <option value="all">All Categories</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>

          <span className="text-[10px] text-slate-400 font-medium">Year:</span>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="flex h-7 w-[72px] rounded-lg border border-input bg-transparent px-2 text-[11px]"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>

          <Button
            size="sm"
            className="h-7 text-[11px] px-2.5 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              setNewAsset("");
              setNewCategory("");
              setNewWeek("");
              setErrors({});
              setAddOpen(true);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Create PPM
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5"
            onClick={() => { setTasks([...mockPPMTasks]); toast.success("Refreshed"); }}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-3 text-[11px]">
        <span className="text-slate-400">
          Total Tasks: <span className="font-bold text-blue-600">{totalTasks}</span>
        </span>
        <span className="text-slate-400">
          Completed: <span className="font-bold text-green-600">{completedTasks}</span>
        </span>
        <span className="text-slate-400">
          Overdue: <span className="font-bold text-red-600">{overdueTasks}</span>
        </span>
        <span className="text-slate-400">
          In Progress: <span className="font-bold text-yellow-600">{inProgressTasks}</span>
        </span>
        <span className="text-slate-400">
          Scheduled: <span className="font-bold text-blue-400">{scheduledTasks}</span>
        </span>
      </div>

      {/* Title */}
      <h2 className="text-[13px] font-bold text-blue-600 text-center">
        52 Weeks PPM Schedule ({year})
      </h2>

      {/* PPM Gantt Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {weeksToShow.map((week) => {
          const weekTasks = weekGroups[week] || [];
          return (
            <Card key={week} className="shadow-none border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50/80 border-b border-slate-100">
                <span className="text-[11px] font-semibold text-slate-600">Week {week}</span>
                <span className="text-[10px] text-slate-400">
                  {weekTasks.length} task{weekTasks.length !== 1 ? "s" : ""}
                </span>
              </div>
              <CardContent className="p-1.5 space-y-1 min-h-[60px]">
                {weekTasks.length === 0 ? (
                  <p className="text-[10px] text-slate-300 text-center py-4">No tasks</p>
                ) : (
                  weekTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => handleToggleComplete(task.id)}
                      className={`w-full text-left text-[9px] leading-tight px-1.5 py-1 rounded cursor-pointer transition-all hover:opacity-80 ${statusColors[task.status]}`}
                      title={
                        task.status === "completed"
                          ? "Click to mark as scheduled"
                          : "Click to mark as completed"
                      }
                    >
                      <div className="flex items-center gap-1">
                        {task.status === "completed" && (
                          <CheckCircle className="h-2.5 w-2.5 shrink-0" />
                        )}
                        <p className="font-medium truncate">{task.assetName}</p>
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4">
        {[
          { label: "Completed", status: "completed" },
          { label: "Overdue", status: "overdue" },
          { label: "In Progress", status: "in_progress" },
          { label: "Scheduled", status: "scheduled" },
        ].map((item) => (
          <div key={item.status} className="flex items-center gap-1">
            <div className={`w-2.5 h-2.5 rounded ${statusDotColors[item.status]}`} />
            <span className="text-[10px] text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* ===== ADD PPM DIALOG ===== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add PPM Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Asset Name *</Label>
              <Input
                value={newAsset}
                onChange={(e) => { setNewAsset(e.target.value); clearError("newAsset"); }}
                placeholder="Enter asset name"
                className={`h-9 text-[13px] rounded-lg ${errors.newAsset ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.newAsset && <p className="text-[10px] text-red-500 mt-0.5">{errors.newAsset}</p>}
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Category *</Label>
              <select
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); clearError("newCategory"); }}
                className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${errors.newCategory ? "border-red-400 ring-1 ring-red-200" : ""}`}
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              {errors.newCategory && <p className="text-[10px] text-red-500 mt-0.5">{errors.newCategory}</p>}
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Week Number * (1-52)</Label>
              <Input
                type="number"
                min={1}
                max={52}
                value={newWeek}
                onChange={(e) => { setNewWeek(e.target.value); clearError("newWeek"); }}
                placeholder="Enter week number"
                className={`h-9 text-[13px] rounded-lg ${errors.newWeek ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.newWeek && <p className="text-[10px] text-red-500 mt-0.5">{errors.newWeek}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleAddPPM}
                className="h-9 text-[13px] rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Task
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
