"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { HygieneConfig } from "./hygiene-config";
import { PowerConfig } from "./power-config";
import { WaterInfraConfig } from "./water-infra-config";
import { WaterQualityConfig } from "./water-quality-config";
import { SprayCan, Zap, Droplets, FlaskConical } from "lucide-react";

export function DailyUpdateConfig() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-[13px] font-semibold text-slate-800">
          Daily Update Configuration
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Configure settings for daily update modules
        </p>
      </div>

      <Tabs defaultValue={0}>
        <TabsList variant="line" className="border-b border-slate-200 w-full justify-start gap-0">
          <TabsTrigger
            value={0}
            className="px-3 py-1.5 text-[12px] font-medium gap-1.5 data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            <SprayCan className="h-3.5 w-3.5" />
            Hygiene
          </TabsTrigger>
          <TabsTrigger
            value={1}
            className="px-3 py-1.5 text-[12px] font-medium gap-1.5 data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            <Zap className="h-3.5 w-3.5" />
            Power
          </TabsTrigger>
          <TabsTrigger
            value={2}
            className="px-3 py-1.5 text-[12px] font-medium gap-1.5 data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            <Droplets className="h-3.5 w-3.5" />
            Water Infrastructure
          </TabsTrigger>
          <TabsTrigger
            value={3}
            className="px-3 py-1.5 text-[12px] font-medium gap-1.5 data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Water Quality
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="pt-3">
          <HygieneConfig />
        </TabsContent>
        <TabsContent value={1} className="pt-3">
          <PowerConfig />
        </TabsContent>
        <TabsContent value={2} className="pt-3">
          <WaterInfraConfig />
        </TabsContent>
        <TabsContent value={3} className="pt-3">
          <WaterQualityConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
