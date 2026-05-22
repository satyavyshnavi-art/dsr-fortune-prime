"use client";

import { useState, useCallback, useEffect } from "react";
import { TopBar } from "@/components/layout/top-bar";
import { KPICard, HeroBanner, HeroBadge, HeroButton } from "@/components/shared";
import {
  Users,
  Droplets,
  SprayCan,
  Zap,
  MessageSquare,
  ListChecks,
  Calendar,
  Search,
  LayoutDashboard,
  Download,
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
  TaskCompletionChart,
  AttendanceOverview,
  AlertSummary,
  ApprovalPipeline,
  InventoryAlerts,
  RecentActivity,
} from "@/components/modules/dashboard";

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function getDaysBetween(start: string, end: string): number {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.max(0, Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function DashboardPage() {
  const [startDate, setStartDate] = useState("2026-03-31");
  const [endDate, setEndDate] = useState("2026-04-29");
  const [appliedRange, setAppliedRange] = useState({ start: "2026-03-31", end: "2026-04-29" });
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/dashboard/summary")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) setDashboardData(d);
      })
      .catch(() => {});
  }, []);

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
    }, 400);
  }, [startDate, endDate]);

  const kpiCards = dashboardData
    ? [
        {
          title: "Employees",
          value: `${dashboardData.employees.total}`,
          subtitle: `${dashboardData.employees.present} present / ${dashboardData.employees.absent} absent`,
          icon: Users,
        },
        {
          title: "Water Usage",
          value: `${Math.round(dashboardData.waterReadings.totalLiters / 1000)} KL`,
          subtitle: `${dashboardData.waterReadings.activeSources} active sources`,
          icon: Droplets,
        },
        {
          title: "Hygiene Score",
          value: "--",
          subtitle: "No data yet",
          icon: SprayCan,
        },
        {
          title: "Power",
          value: `${dashboardData.powerReadings.totalKwh.toFixed(1)} kWh`,
          subtitle: `${dashboardData.powerReadings.activeMeters} meters active`,
          icon: Zap,
        },
        {
          title: "Complaints",
          value: `${dashboardData.complaints.total}`,
          subtitle: `${dashboardData.complaints.open} open / ${dashboardData.complaints.resolved + dashboardData.complaints.closed} resolved`,
          icon: MessageSquare,
        },
        {
          title: "Tasks",
          value: `${dashboardData.tasks.total}`,
          subtitle: `${dashboardData.tasks.completed} done / ${dashboardData.tasks.overdue} overdue`,
          icon: ListChecks,
        },
      ]
    : [
        { title: "Employees", value: "--", subtitle: "Loading...", icon: Users },
        { title: "Water Usage", value: "--", subtitle: "Loading...", icon: Droplets },
        { title: "Hygiene Score", value: "--", subtitle: "Loading...", icon: SprayCan },
        { title: "Power", value: "--", subtitle: "Loading...", icon: Zap },
        { title: "Complaints", value: "--", subtitle: "Loading...", icon: MessageSquare },
        { title: "Tasks", value: "--", subtitle: "Loading...", icon: ListChecks },
      ];

  const days = getDaysBetween(appliedRange.start, appliedRange.end);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />

      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">
          {/* Hero banner */}
          <HeroBanner
            icon={LayoutDashboard}
            tone="violet"
            title="Facility Overview"
            subtitle={
              <>
                {formatDateLabel(appliedRange.start)} – {formatDateLabel(appliedRange.end)}
                <span className="ml-1.5 text-white/50">({days} days)</span>
              </>
            }
            badge={<HeroBadge>Live</HeroBadge>}
            actions={
              <HeroButton icon={Download} variant="solid">
                Export Report
              </HeroButton>
            }
          />

          {/* Date Range Picker */}
          <div className="flex items-center justify-end gap-2">
            <div
              className={`inline-flex items-center bg-white border rounded-xl px-3.5 h-9 transition-colors ${
                hasUnappliedChanges ? "border-violet-300 ring-1 ring-violet-100" : "border-slate-200"
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-violet-500 mr-2 shrink-0" aria-hidden="true" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                aria-label="Start date"
                className="bg-transparent text-[12px] text-slate-600 font-medium focus:outline-none cursor-pointer border-none p-0 m-0 h-full"
              />
              <span className="text-[12px] text-slate-300 mx-2 select-none" aria-hidden="true">–</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                aria-label="End date"
                className="bg-transparent text-[12px] text-slate-600 font-medium focus:outline-none cursor-pointer border-none p-0 m-0 h-full"
              />
            </div>

            <button
              onClick={handleGo}
              disabled={isLoading}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-xl text-[12px] font-semibold transition-all ${
                isLoading
                  ? "bg-violet-400 text-white cursor-wait"
                  : "bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800"
              }`}
            >
              {isLoading ? (
                <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isLoading ? "Loading..." : "Apply"}
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
            {kpiCards.map((kpi, idx) => {
              const tones = ["violet", "emerald", "orange", "sky", "rose", "amber"] as const;
              return (
                <KPICard
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  subtitle={kpi.subtitle}
                  icon={kpi.icon}
                  tone={tones[idx % tones.length]}
                />
              );
            })}
          </div>

          {/* Row: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <TaskCompletionChart data={dashboardData} />
            <AttendanceOverview data={dashboardData} />
            <AlertSummary data={dashboardData} />
          </div>

          {/* Row: Pipeline */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <ApprovalPipeline data={dashboardData} />
            <InventoryAlerts data={dashboardData} />
            <RecentActivity data={dashboardData} />
          </div>

          {/* Row: Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <AttendanceWidget data={dashboardData} />
            <HygieneWidget />
            <PowerWidget data={dashboardData} />
          </div>

          {/* Row: Infrastructure */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <WaterManagementWidget data={dashboardData} />
            <AssetSummaryWidget data={dashboardData} />
            <WaterQualityWidget data={dashboardData} />
          </div>

          {/* Row: Service */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            <ComplaintWidget data={dashboardData} />
            <TaskStatusWidget data={dashboardData} />
            <VendorTicketsWidget data={dashboardData} />
          </div>
        </div>
      </div>
    </div>
  );
}
