"use client";

import {} from "react";
import { ChartCard } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { Droplets } from "lucide-react";

export function WaterQualityWidget({ data }: { data?: any }) {

  const hasData = data?.waterQuality?.hasData ?? false;
  const readings = data?.waterQuality?.readings ?? [];

  if (!hasData) {
    return (
      <ChartCard title="Water Quality Monitoring">
        <EmptyState
          icon={Droplets}
          title="No data"
          description="Water quality readings will appear here once configured."
          className="py-6"
        />
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Water Quality Monitoring">
      <div className="space-y-2">
        {readings.map((reading: any, idx: number) => {
          const params =
            typeof reading.parameters === "object" && reading.parameters
              ? Object.entries(reading.parameters as Record<string, any>)
              : [];
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-700">
                  {reading.plantType.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400">
                  {reading.date}
                </span>
              </div>
              {params.length > 0 ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {params.slice(0, 6).map(([key, val]) => (
                    <div
                      key={key}
                      className="rounded-md bg-slate-50 border border-slate-100 px-2 py-1"
                    >
                      <p className="text-[9px] text-slate-400 truncate">
                        {key}
                      </p>
                      <p className="text-[11px] font-medium text-slate-700">
                        {String(val)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">
                  No parameters recorded
                </p>
              )}
              {idx < readings.length - 1 && (
                <div className="border-t border-slate-100" />
              )}
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
}
