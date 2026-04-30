"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCard, type AlertItem, type AlertCategory, type AlertSeverity, type AlertStatus } from "./alert-card";
import { Search, RefreshCw, Filter } from "lucide-react";

// ---- Mock data matching the screenshots ----
const now = new Date();
function hoursAgo(h: number) {
  return new Date(now.getTime() - h * 3600000).toISOString();
}

const MOCK_ALERTS: AlertItem[] = [
  // Attendance & Staffing
  {
    id: "a1",
    category: "attendance",
    severity: "critical",
    title: "Attendance Shortage: Morning",
    message:
      "Morning shift understaffed. Only 6 out of 9 required staff present. Critical services may be affected.",
    status: "unacknowledged",
    createdAt: hoursAgo(1),
    source: "Shift: Morning",
  },
  {
    id: "a2",
    category: "attendance",
    severity: "high",
    title: "Supervisor Absent",
    message:
      "Senior User (facility_manager) not reported for duty. No backup supervisor assigned.",
    status: "unacknowledged",
    createdAt: hoursAgo(3),
  },
  {
    id: "a3",
    category: "attendance",
    severity: "high",
    title: "Supervisor Absent",
    message:
      "GreenView Demo facility_manager not reported for duty. No backup supervisor assigned.",
    status: "unacknowledged",
    createdAt: hoursAgo(5),
  },
  {
    id: "a4",
    category: "attendance",
    severity: "medium",
    title: "Attendance Shortage: Morning Shift (8 hrs)",
    message:
      "Morning Shift (8 hrs) with understaffed. Only 8 out of 14 required staff present. Critical services may be affected.",
    status: "unacknowledged",
    createdAt: hoursAgo(6),
  },
  // Asset Maintenance
  {
    id: "b1",
    category: "asset_maintenance",
    severity: "critical",
    title: "10 missed asset audits - lifts",
    message:
      '10 assets were not scanned during the audit period 01/01/26 - 03/31/26 for category "lifts" at GreenView Demo Park. Missing: Lift 1, Lift 2, Lift 3, Lift 4, Lift 5, and 5 more.',
    status: "unacknowledged",
    createdAt: hoursAgo(2),
  },
  {
    id: "b2",
    category: "asset_maintenance",
    severity: "critical",
    title: "39 missed asset audits - fire_safety",
    message:
      '39 assets were not scanned during the audit period 01/01/26 - 03/31/26 for category "fire_safety" at GreenView Demo Park. Missing: Hose1, Hose2, Nozzle1, Nozzle2, and 34 more.',
    status: "unacknowledged",
    createdAt: hoursAgo(4),
  },
  {
    id: "b3",
    category: "asset_maintenance",
    severity: "high",
    title: "8 missed asset audits - earthing_pits",
    message:
      '8 assets were not scanned during the audit period 01/01/26 - 03/31/26 for category "earthing_pits" at GreenView Demo Park. Missing: Earth Pit 1, Earth Pit 2, Earth Pit 3, and 5 more.',
    status: "unacknowledged",
    createdAt: hoursAgo(6),
  },
  {
    id: "b4",
    category: "asset_maintenance",
    severity: "medium",
    title: "Audit deadline in 1 day - fire_safety",
    message:
      '34 of 60 assets still need to be scanned for "fire_safety" at GreenView Demo Park. The monthly audit ends on 01/31/26.',
    status: "unacknowledged",
    createdAt: hoursAgo(8),
  },
  // Water Management
  {
    id: "c1",
    category: "water_management",
    severity: "high",
    title: "STP MLSS Level Critical",
    message:
      "STP MLSS reading at 1800 mg/L is below the minimum normal threshold of 2000 mg/L. Immediate attention required.",
    status: "unacknowledged",
    createdAt: hoursAgo(3),
  },
  {
    id: "c2",
    category: "water_management",
    severity: "medium",
    title: "Water Tank Level Low",
    message:
      "Underground tank #2 is at 22% capacity. Consider scheduling a tanker delivery.",
    status: "acknowledged",
    createdAt: hoursAgo(12),
  },
  // General
  {
    id: "d1",
    category: "general",
    severity: "low",
    title: "Weekly Hygiene Report Pending",
    message:
      "The weekly hygiene report for Week 17 has not been submitted. Deadline was 2 days ago.",
    status: "unacknowledged",
    createdAt: hoursAgo(48),
  },
];

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "attendance", label: "Attendance & Staffing" },
  { value: "asset_maintenance", label: "Asset Maintenance" },
  { value: "water_management", label: "Water Management" },
  { value: "power_management", label: "Power Management" },
  { value: "critical_systems", label: "Critical Systems" },
  { value: "hygiene", label: "Hygiene" },
  { value: "complaints", label: "Complaints" },
  { value: "general", label: "General" },
];

const PRIORITY_OPTIONS = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "unacknowledged", label: "Unacknowledged" },
  { value: "acknowledged", label: "Acknowledged" },
  { value: "dismissed", label: "Dismissed" },
  { value: "resolved", label: "Resolved" },
];

const CATEGORY_LABELS: Record<string, string> = {
  attendance: "Attendance & Staffing",
  asset_maintenance: "Asset Maintenance",
  water_management: "Water Management",
  power_management: "Power Management",
  hygiene: "Hygiene",
  complaints: "Complaints",
  critical_systems: "Critical Systems",
  general: "General",
};

export function AlertsList() {
  const [alerts, setAlerts] = useState<AlertItem[]>(MOCK_ALERTS);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return alerts.filter((a) => {
      if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.message.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (categoryFilter !== "all" && a.category !== categoryFilter) return false;
      if (priorityFilter !== "all" && a.severity !== priorityFilter) return false;
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      return true;
    });
  }, [alerts, search, categoryFilter, priorityFilter, statusFilter]);

  const unacknowledgedCount = alerts.filter((a) => a.status === "unacknowledged").length;
  const totalCount = alerts.length;

  // Group alerts by category for 2-column layout
  const grouped = useMemo(() => {
    const groups: Record<string, AlertItem[]> = {};
    for (const a of filtered) {
      const cat = a.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(a);
    }
    return groups;
  }, [filtered]);

  const groupEntries = Object.entries(grouped);

  function handleAcknowledge(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" as AlertStatus } : a))
    );
  }

  function handleDismiss(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "dismissed" as AlertStatus } : a))
    );
  }

  function handleResolve(id: string) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "resolved" as AlertStatus } : a))
    );
  }

  function clearFilters() {
    setSearch("");
    setCategoryFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="space-y-3">
      {/* Summary line */}
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-slate-500">
          <span className="font-semibold text-slate-800">{unacknowledgedCount} unacknowledged alerts</span>
          {" "}out of {filtered.length} filtered / {totalCount} total
        </p>
        <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh & Generate
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[160px] max-w-[220px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
          <Input
            placeholder="Search alerts..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-7 h-7 text-[11px]"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Category</span>
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
            <SelectTrigger className="w-[140px] h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Priority</span>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v ?? "all")}>
            <SelectTrigger className="w-[100px] h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium">Status</span>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[120px] h-7 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-[11px]">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-[11px] text-slate-400 hover:text-slate-600 px-2"
          onClick={clearFilters}
        >
          <Filter className="h-3 w-3 mr-1" />
          Clear Filters
        </Button>
      </div>

      {/* Alert cards in 2-column grouped layout */}
      {groupEntries.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="text-[12px]">No alerts match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groupEntries.map(([category, categoryAlerts]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[13px] text-slate-800">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <Badge
                  variant="outline"
                  className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0 h-[16px] leading-[16px] rounded border-slate-200"
                >
                  {categoryAlerts.length}
                </Badge>
              </div>
              <div className="space-y-1.5">
                {categoryAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onAcknowledge={handleAcknowledge}
                    onDismiss={handleDismiss}
                    onResolve={handleResolve}
                    onReschedule={handleResolve}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
