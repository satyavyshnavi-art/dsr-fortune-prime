"use client";

import { ChartCard } from "@/components/shared";
import { EmptyState } from "@/components/shared";
import { Droplets } from "lucide-react";

export function WaterQualityWidget() {
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
