"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { kpiData, categorySummaries, type KPIStatus } from "./mock-data";

function StatusDot({ status }: { status: KPIStatus }) {
  const colorClass =
    status === "green"
      ? "bg-green-500"
      : status === "red"
        ? "bg-red-500"
        : "bg-blue-500";

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colorClass} shrink-0`}
      aria-label={`Status: ${status}`}
    />
  );
}

function formatValue(value: number, unit: string): string {
  if (unit === "%") return `${value}%`;
  if (unit === "kWh") return `${value}kWh`;
  if (unit === "KL") return `${value}KL`;
  if (unit === "mg/L") return `${value}mg/L`;
  if (unit === "pH") return `${value}pH`;
  if (unit === "hours") return `${value}hours`;
  if (unit === "/period") return `${value}/period`;
  return `${value}${unit}`;
}

function formatTarget(target: number, unit: string): string {
  if (unit === "%") return `Target ${target}%`;
  if (unit === "kWh") return `Target ${target}kWh`;
  if (unit === "KL") return `Target ${target}KL`;
  if (unit === "mg/L") return `Target ${target}mg/L`;
  if (unit === "pH") return `Target ${target}pH`;
  if (unit === "hours") return `Target ${target}hours`;
  if (unit === "/period") return `Target ${target}/period`;
  return `Target ${target}${unit}`;
}

function CategoryBar({
  category,
  percentage,
  label,
}: {
  category: string;
  percentage: number;
  label: string;
}) {
  const barColor =
    percentage >= 80
      ? "bg-green-500"
      : percentage >= 30
        ? "bg-blue-500"
        : percentage > 0
          ? "bg-blue-400"
          : "bg-slate-200";

  return (
    <div className="space-y-1">
      <span className="text-[12px] font-semibold text-slate-700">{category}</span>
      <div className="h-1 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.max(percentage, 1)}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 leading-tight">{label}</p>
    </div>
  );
}

interface KPITrafficLightProps {
  dateRange: string;
}

export function KPITrafficLight({ dateRange }: KPITrafficLightProps) {
  return (
    <div className="space-y-4">
      <Card className="shadow-none border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between px-4 py-2.5 pb-1">
          <CardTitle className="text-[13px] font-semibold text-slate-700">
            KPI Traffic Light Dashboard
          </CardTitle>
          <span className="text-[10px] text-slate-400">{dateRange}</span>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1">
          {/* KPI Grid - 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-0">
            {kpiData.map((kpi) => (
              <div
                key={kpi.id}
                className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={kpi.status} />
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-slate-700 leading-tight truncate">
                      {kpi.name}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      {formatValue(kpi.actualValue, kpi.unit)} ({formatTarget(kpi.targetValue, kpi.unit)})
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Summary Bars */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {categorySummaries.map((cs) => (
          <Card key={cs.category} className="shadow-none border-slate-200">
            <CardContent className="px-3 py-2.5">
              <CategoryBar
                category={cs.category}
                percentage={cs.percentage}
                label={cs.label}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
