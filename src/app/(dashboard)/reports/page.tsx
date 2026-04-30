"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  CalendarDays,
  BarChart3,
  LineChart,
  FileText,
  RefreshCw,
} from "lucide-react";
import { KPITrafficLight } from "@/components/modules/reports/kpi-traffic-light";
import { AnalyticsTab } from "@/components/modules/reports/analytics-tab";
import { ReportsTab } from "@/components/modules/reports/reports-tab";

export default function ReportsPage() {
  const [dateFrom] = useState("29-Mar-26");
  const [dateTo] = useState("27-Apr-26");

  const dateRange = `2026-03-29 \u2192 2026-04-27`;

  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Reports"
        actions={
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        }
      />

      {/* Date Range Display */}
      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
        <span className="font-medium">{dateFrom}</span>
        <span className="text-slate-300">&rarr;</span>
        <span className="font-medium">{dateTo}</span>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={0}>
        <TabsList variant="line">
          <TabsTrigger value={0} className="text-[12px] font-medium">
            <BarChart3 className="h-3.5 w-3.5" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value={1} className="text-[12px] font-medium">
            <LineChart className="h-3.5 w-3.5" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value={2} className="text-[12px] font-medium">
            <FileText className="h-3.5 w-3.5" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0}>
          <div className="pt-3">
            <KPITrafficLight dateRange={dateRange} />
          </div>
        </TabsContent>

        <TabsContent value={1}>
          <div className="pt-3">
            <AnalyticsTab />
          </div>
        </TabsContent>

        <TabsContent value={2}>
          <div className="pt-3">
            <ReportsTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
