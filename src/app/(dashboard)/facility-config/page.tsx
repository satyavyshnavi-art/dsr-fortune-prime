"use client";

import { PageHeader } from "@/components/shared";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { FacilityDetailsForm } from "@/components/modules/facility-config/facility-details-form";
import { DailyUpdateConfig } from "@/components/modules/facility-config/daily-update-config";
import { EmptyState } from "@/components/shared";
import { Users, Truck } from "lucide-react";

export default function FacilityConfigPage() {
  return (
    <div className="p-5 space-y-4 max-w-[1400px]">
      <PageHeader
        title="Facility Config"
        description="Manage your facility settings, daily update templates, and service providers."
      />

      <Tabs defaultValue={0}>
        <TabsList variant="line" className="border-b border-slate-200 w-full justify-start gap-0">
          <TabsTrigger
            value={0}
            className="px-3 py-1.5 text-[12px] font-medium data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            Facility Config
          </TabsTrigger>
          <TabsTrigger
            value={1}
            className="px-3 py-1.5 text-[12px] font-medium data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            Daily Update
          </TabsTrigger>
          <TabsTrigger
            value={2}
            className="px-3 py-1.5 text-[12px] font-medium data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            Employee
          </TabsTrigger>
          <TabsTrigger
            value={3}
            className="px-3 py-1.5 text-[12px] font-medium data-active:text-blue-600 data-active:after:bg-blue-600"
          >
            Service Provider
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="pt-4">
          <FacilityDetailsForm />
        </TabsContent>

        <TabsContent value={1} className="pt-4">
          <DailyUpdateConfig />
        </TabsContent>

        <TabsContent value={2} className="pt-4">
          <EmptyState
            icon={Users}
            title="Employee Configuration"
            description="Employee management settings will be configured here."
          />
        </TabsContent>

        <TabsContent value={3} className="pt-4">
          <EmptyState
            icon={Truck}
            title="Service Provider Configuration"
            description="Manage your facility service providers and vendor contacts here."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
