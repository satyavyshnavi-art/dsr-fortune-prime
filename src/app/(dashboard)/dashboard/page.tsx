"use client";

import { useState, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { KPICard } from "@/components/shared";
import {
  Users,
  Droplets,
  SprayCan,
  Zap,
  MessageSquare,
  ListChecks,
  Calendar,
  Search,
  CheckCircle2,
} from "lucide-react";
import {
  AttendanceWidget,
  HygieneWidget,
  PowerWidget,
  WaterManagementWidget,
  AssetSummaryWidget,
  WaterQualityWidget,
  ComplaintWidget,
  TaskStatusWidget,
  VendorTicketsWidget,
} from "@/components/modules/dashboard";
import { DashboardProvider, useDashboard } from "@/hooks/use-dashboard";

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
}

function getDaysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

function DashboardContent() {
  const [startDate, setStartDate] = useState("2026-03-31");
  const [endDate, setEndDate] = useState("2026-04-29");
  const [appliedRange, setAppliedRange] = useState({ start: "2026-03-31", end: "2026-04-29" });
  const [showApplied, setShowApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: dashboardData } = useDashboard();

  const hasUnappliedChanges =
    startDate !== appliedRange.start || endDate !== appliedRange.end;

  const handleGo = useCallback(() => {
    if (startDate > endDate) {
      alert("Start date must be before end date");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setAppliedRange({ start: startDate, end: endDate });
      setIsLoading(false);
      setShowApplied(true);
      setTimeout(() => setShowApplied(false), 2000);
    }, 400);
  }, [startDate, endDate]);

  // Build KPI cards from real data
  const kpiCards = dashboardData
    ? [
        {
          title: "Employees",
          value: `${dashboardData.employees.total}`,
          subtitle: `${dashboardData.employees.present} present / ${dashboardData.employees.absent} absent`,
          icon: Users,
          color: "green" as const,
        },
        {
          title: "Water Consumption",
          value: `${Math.round(dashboardData.waterReadings.totalLiters / 1000)} KL`,
          subtitle: `${dashboardData.waterReadings.activeSources} sources`,
          icon: Droplets,
          color: "blue" as const,
        },
        {
          title: "Hygiene & Satisfaction",
          value: "--",
          subtitle: "No data yet",
          icon: SprayCan,
          color: "yellow" as const,
        },
        {
          title: "Power Consumption",
          value: `${dashboardData.powerReadings.totalKwh.toFixed(1)} kWh`,
          subtitle: `${dashboardData.powerReadings.activeMeters} meters`,
          icon: Zap,
          color: "slate" as const,
        },
        {
          title: "Complaints",
          value: `${dashboardData.complaints.total}`,
          subtitle: `${dashboardData.complaints.open} open / ${dashboardData.complaints.resolved + dashboardData.complaints.closed} resolved`,
          icon: MessageSquare,
          color: "red" as const,
        },
        {
          title: "Tasks",
          value: `${dashboardData.tasks.total}`,
          subtitle: `${dashboardData.tasks.completed} done / ${dashboardData.tasks.overdue} overdue`,
          icon: ListChecks,
          color: "blue" as const,
        },
      ]
    : [
        { title: "Employees", value: "--", subtitle: "Loading...", icon: Users, color: "green" as const },
        { title: "Water Consumption", value: "--", subtitle: "Loading...", icon: Droplets, color: "blue" as const },
        { title: "Hygiene & Satisfaction", value: "--", subtitle: "Loading...", icon: SprayCan, color: "yellow" as const },
        { title: "Power Consumption", value: "--", subtitle: "Loading...", icon: Zap, color: "slate" as const },
        { title: "Complaints", value: "--", subtitle: "Loading...", icon: MessageSquare, color: "red" as const },
        { title: "Tasks", value: "--", subtitle: "Loading...", icon: ListChecks, color: "blue" as const },
      ];

  const days = getDaysBetween(appliedRange.start, appliedRange.end);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-3">
          {/* Date Range Picker */}
          <div className="flex items-center justify-end gap-3">
            {showApplied && (
              <div className="flex items-center gap-1.5 text-[12px] text-green-600 font-medium animate-in fade-in slide-in-from-right-2 duration-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Updated for {formatDateLabel(appliedRange.start)} – {formatDateLabel(appliedRange.end)}
              </div>
            )}

            <div
              className={`inline-flex items-center bg-white border rounded-full shadow-sm px-4 h-10 transition-colors ${
                hasUnappliedChanges ? "border-[#10b981]/40 ring-1 ring-[#10b981]/10" : "border-slate-200"
              }`}
            >
              <Calendar className="h-4 w-4 text-[#10b981] mr-2 shrink-0" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-[13px] text-slate-700 font-medium focus:outline-none cursor-pointer border-none p-0 m-0 h-full"
              />
              <span className="text-[14px] text-slate-400 mx-2 select-none">→</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-[13px] text-slate-700 font-medium focus:outline-none cursor-pointer border-none p-0 m-0 h-full"
              />
            </div>

            <button
              onClick={handleGo}
              disabled={isLoading}
              className={`flex items-center gap-1.5 h-10 px-5 rounded-full text-[13px] font-semibold transition-all shadow-sm ${
                isLoading
                  ? "bg-[#34d399] text-white cursor-wait"
                  : hasUnappliedChanges
                  ? "bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857] ring-2 ring-[#10b981]/20"
                  : "bg-[#10b981] text-white hover:bg-[#059669] active:bg-[#047857]"
              }`}
            >
              {isLoading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              {isLoading ? "Loading..." : "Go"}
            </button>
          </div>

          {/* Applied range info bar */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-slate-400">
              Showing data for <span className="font-medium text-slate-600">{formatDateLabel(appliedRange.start)}</span>
              {" → "}
              <span className="font-medium text-slate-600">{formatDateLabel(appliedRange.end)}</span>
              <span className="ml-1.5 text-slate-300">({days} days)</span>
            </p>
          </div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {kpiCards.map((kpi) => (
              <KPICard
                key={kpi.title}
                title={kpi.title}
                value={kpi.value}
                subtitle={kpi.subtitle}
                icon={kpi.icon}
                color={kpi.color}
              />
            ))}
          </div>

          {/* Row 2: Attendance, Hygiene, Power */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <AttendanceWidget />
            <HygieneWidget />
            <PowerWidget />
          </div>

          {/* Row 3: Water Management, Asset Summary, Water Quality */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <WaterManagementWidget />
            <AssetSummaryWidget />
            <WaterQualityWidget />
          </div>

          {/* Row 4: Complaint, Task Status, Vendor Tickets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <ComplaintWidget />
            <TaskStatusWidget />
            <VendorTicketsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
