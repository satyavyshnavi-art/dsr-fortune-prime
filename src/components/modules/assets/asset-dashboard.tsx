"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard, StatusBadge } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  dashboardSummary,
  mockCategories,
  mockPPMTasks,
  mockAssets,
  type PPMTask,
} from "./mock-data";
import { exportPDF } from "@/lib/export";
import {
  LayoutGrid,
  XCircle,
  ArrowRightLeft,
  IndianRupee,
  CheckCircle2,
  TrendingUp,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  CalendarClock,
  FileText,
} from "lucide-react";

export function AssetDashboard() {
  const data = dashboardSummary;

  // Dialog states
  const [criticalDialogOpen, setCriticalDialogOpen] = useState(false);
  const [observationDialogOpen, setObservationDialogOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<
    (typeof data.majorObservations)[0] | null
  >(null);
  const [ppmDialogOpen, setPpmDialogOpen] = useState(false);

  // Derive overdue PPM tasks
  const overdueTasks = mockPPMTasks.filter((t) => t.status === "overdue");
  const completedTasks = mockPPMTasks.filter((t) => t.status === "completed");
  const inProgressTasks = mockPPMTasks.filter((t) => t.status === "in_progress");
  const scheduledTasks = mockPPMTasks.filter((t) => t.status === "scheduled");

  // Compute PPM status from actual data
  const ppmPlanned = mockPPMTasks.length;
  const ppmCompleted = completedTasks.length;
  const ppmInProgress = inProgressTasks.length;
  const ppmOverdue = overdueTasks.length;
  const ppmCompletionRate = ppmPlanned > 0 ? (ppmCompleted / ppmPlanned) * 100 : 0;

  // Asset breakdown from categories
  const categoryBreakdown = mockCategories.map((cat) => ({
    name: cat.name,
    active: cat.activeCount,
    maintenance: cat.maintenanceCount,
    inactive: cat.inactiveCount,
    total: cat.totalAssets,
  }));

  // Critical checks: assets in maintenance or overdue PPM
  const criticalChecks = overdueTasks;

  function handleOpenObservation(obs: (typeof data.majorObservations)[0]) {
    setSelectedObservation(obs);
    setObservationDialogOpen(true);
  }

  function handleExportPDF() {
    const rows = [
      { Metric: "Total Assets", Value: String(data.totalAssets) },
      { Metric: "Active Assets", Value: String(data.activeAssets) },
      { Metric: "Inactive Assets", Value: String(data.inactiveAssets) },
      { Metric: "Total Gate Passes", Value: String(data.totalGatePasses) },
      { Metric: "Gate Passes Out", Value: String(data.gatePassesOut) },
      { Metric: "Gate Passes Overdue", Value: String(data.gatePassesOverdue) },
      {
        Metric: "Total Repair Cost",
        Value: `Rs ${data.totalRepairCost.toLocaleString("en-IN")}`,
      },
      { Metric: "Services Completed", Value: String(data.servicesCompleted) },
      { Metric: "PPM Planned", Value: String(ppmPlanned) },
      { Metric: "PPM Completed", Value: String(ppmCompleted) },
      { Metric: "PPM In Progress", Value: String(ppmInProgress) },
      { Metric: "PPM Overdue", Value: String(ppmOverdue) },
      { Metric: "PPM Completion Rate", Value: `${ppmCompletionRate.toFixed(1)}%` },
      ...categoryBreakdown.map((cat) => ({
        Metric: `${cat.name} (Active / Maintenance / Inactive)`,
        Value: `${cat.active} / ${cat.maintenance} / ${cat.inactive}`,
      })),
    ];
    exportPDF(rows, "Asset-Dashboard-Report", "Asset Dashboard Summary");
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "overdue":
        return "danger" as const;
      case "completed":
        return "success" as const;
      case "in_progress":
        return "info" as const;
      case "scheduled":
        return "neutral" as const;
      default:
        return "neutral" as const;
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div />
        <Button variant="outline" size="sm" onClick={handleExportPDF}>
          <Download className="h-3.5 w-3.5 mr-1" />
          Download Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Assets"
          value={data.totalAssets}
          subtitle={`${data.activeAssets} Active + ${data.inactiveAssets} Inactive`}
          icon={LayoutGrid}
          color="blue"
        />
        <KPICard
          title="Inactive Assets"
          value={data.inactiveAssets}
          subtitle={`${((data.inactiveAssets / data.totalAssets) * 100).toFixed(1)}% of total`}
          icon={XCircle}
          color="red"
        />
        <KPICard
          title="Gate Pass"
          value={data.totalGatePasses}
          subtitle={`${data.gatePassesOut} Out + ${data.gatePassesOverdue} Overdue`}
          icon={ArrowRightLeft}
          color="yellow"
        />
        <KPICard
          title="Total Repair Cost"
          value={`\u20B9${data.totalRepairCost.toLocaleString("en-IN")}`}
          subtitle={`${data.servicesCompleted} services completed`}
          icon={IndianRupee}
          color="green"
        />
      </div>

      {/* Asset Breakdown + Critical Checks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Asset Breakdown — all categories */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
              Asset Breakdown
            </h3>
            <div className="space-y-3">
              {categoryBreakdown.map((cat) => {
                const total = cat.total || 1;
                return (
                  <div key={cat.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-medium text-slate-700">
                        {cat.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{cat.total} total</span>
                        {cat.inactive > 0 && (
                          <span className="text-[10px] text-red-600 font-medium bg-red-50 px-1.5 py-px rounded">
                            {cat.inactive} Inactive
                          </span>
                        )}
                        {cat.maintenance > 0 && (
                          <span className="text-[10px] text-yellow-600 font-medium bg-yellow-50 px-1.5 py-px rounded">
                            {cat.maintenance} Maint.
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                      <div
                        className="bg-green-500 h-full"
                        style={{
                          width: `${(cat.active / total) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-yellow-400 h-full"
                        style={{
                          width: `${(cat.maintenance / total) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-red-500 h-full"
                        style={{
                          width: `${(cat.inactive / total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Active
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-400" />
                  Maintenance
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Inactive
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Critical Checks Due */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-slate-700">
                Critical Checks Due
              </h3>
              {criticalChecks.length > 0 && (
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  {criticalChecks.length} Overdue
                </span>
              )}
            </div>
            {criticalChecks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="rounded-full bg-green-50 p-2.5 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-[12px] font-medium text-slate-600">
                  All Checks Up to Date
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 max-w-[260px]">
                  No overdue maintenance checks found. All PPM tasks are on schedule.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {criticalChecks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-slate-700 truncate">
                        {task.assetName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {task.categoryName} - Due: {task.scheduledDate}
                      </p>
                    </div>
                    <StatusBadge status="overdue" variant="danger" />
                  </div>
                ))}
                {criticalChecks.length > 4 && (
                  <p className="text-[10px] text-slate-400 text-center">
                    +{criticalChecks.length - 4} more overdue
                  </p>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-1"
                  onClick={() => setCriticalDialogOpen(true)}
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1 text-red-500" />
                  View All Details
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Major Observations + PPM Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Major Observations */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
              Major Observations
            </h3>
            <div className="space-y-3">
              {data.majorObservations.map((obs, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className={`mt-0.5 rounded-full p-1 shrink-0 ${
                      obs.type === "positive"
                        ? "bg-green-100 text-green-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {obs.type === "positive" ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <TrendingUp className="h-3 w-3" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12px] font-medium text-slate-700">
                        {obs.title}
                      </p>
                      <button
                        onClick={() => handleOpenObservation(obs)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-medium shrink-0 flex items-center gap-0.5"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                      {obs.description}
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Location: {obs.location} | Updated: {obs.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* PPM Status */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[13px] font-semibold text-slate-700">
                PPM Status
              </h3>
              <button
                onClick={() => setPpmDialogOpen(true)}
                className="text-[10px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-0.5"
              >
                <CalendarClock className="h-3 w-3" />
                View All
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Plan vs Actual
                </p>
                <div className="space-y-1">
                  {[
                    { label: "Planned Tasks", value: ppmPlanned },
                    { label: "Completed", value: ppmCompleted },
                    { label: "In Progress", value: ppmInProgress },
                    { label: "Overdue", value: ppmOverdue },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-[12px]">
                      <span className="text-slate-500">{item.label}</span>
                      <span
                        className={`font-medium ${
                          item.label === "Overdue" && item.value > 0
                            ? "text-red-600"
                            : "text-slate-700"
                        }`}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between text-[12px] border-t border-slate-100 pt-1.5 mt-1.5">
                    <span className="text-slate-500 font-medium">Completion Rate</span>
                    <span
                      className={`font-bold ${
                        ppmCompletionRate < 50 ? "text-red-600" : "text-slate-800"
                      }`}
                    >
                      {ppmCompletionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* PPM Completion Progress Bar */}
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  Progress
                </p>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    className="bg-green-500 h-full"
                    style={{ width: `${(ppmCompleted / (ppmPlanned || 1)) * 100}%` }}
                  />
                  <div
                    className="bg-blue-400 h-full"
                    style={{ width: `${(ppmInProgress / (ppmPlanned || 1)) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 h-full"
                    style={{ width: `${(ppmOverdue / (ppmPlanned || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Done ({ppmCompleted})
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                    In Progress ({ppmInProgress})
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    Overdue ({ppmOverdue})
                  </div>
                </div>
              </div>

              {/* PPM Upcoming */}
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1.5">
                  PPM Upcoming Week
                </p>
                <div className="space-y-1.5">
                  {data.ppmUpcoming.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Clock className="h-3 w-3 text-slate-300 shrink-0" />
                        <span className="text-[12px] text-slate-600 truncate">
                          {item.name}
                        </span>
                      </div>
                      <StatusBadge
                        status={item.priority}
                        variant={
                          item.priority === "High Priority"
                            ? "danger"
                            : item.priority === "Medium"
                            ? "warning"
                            : "info"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---- Dialogs ---- */}

      {/* Critical Checks Dialog */}
      <Dialog open={criticalDialogOpen} onOpenChange={setCriticalDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Overdue Critical Checks ({criticalChecks.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {criticalChecks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-slate-700">
                    {task.assetName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Category: {task.categoryName} | Week {task.weekNumber} |
                    Scheduled: {task.scheduledDate}
                  </p>
                </div>
                <StatusBadge status="overdue" variant="danger" />
              </div>
            ))}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* Observation Detail Dialog */}
      <Dialog open={observationDialogOpen} onOpenChange={setObservationDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedObservation?.type === "positive" ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              )}
              {selectedObservation?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedObservation && (
            <div className="space-y-3 mt-2">
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-[12px] text-slate-600 leading-relaxed">
                  {selectedObservation.description}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Location
                  </p>
                  <p className="text-[12px] text-slate-700 font-medium">
                    {selectedObservation.location}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Last Updated
                  </p>
                  <p className="text-[12px] text-slate-700 font-medium">
                    {selectedObservation.date}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                  Type
                </p>
                <StatusBadge
                  status={selectedObservation.type === "positive" ? "Good" : "In Progress"}
                  variant={selectedObservation.type === "positive" ? "success" : "info"}
                />
              </div>
            </div>
          )}
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      {/* PPM All Tasks Dialog */}
      <Dialog open={ppmDialogOpen} onOpenChange={setPpmDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-600" />
              All PPM Tasks ({mockPPMTasks.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {mockPPMTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-slate-700">
                    {task.assetName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {task.categoryName} | Week {task.weekNumber} | {task.scheduledDate}
                  </p>
                </div>
                <StatusBadge status={task.status} variant={getStatusVariant(task.status)} />
              </div>
            ))}
          </div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>
    </div>
  );
}
