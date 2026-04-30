"use client";

import { PageHeader } from "@/components/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DevicesTab, EnrollmentsTab, UnmappedGuestsTab } from "@/components/modules/biometric";
import { Fingerprint, Link2, UserX } from "lucide-react";

export default function BiometricDevicesPage() {
  return (
    <div className="p-5 space-y-4">
      <PageHeader
        title="Biometric Devices"
        description="Register ZKTeco / eSSL units, link device users to employees, and review unmapped punches."
      />

      <Tabs defaultValue={0}>
        <TabsList variant="line" className="w-full justify-start border-b border-slate-200 pb-0">
          <TabsTrigger value={0} className="text-[12px] font-medium gap-1.5">
            <Fingerprint className="h-3.5 w-3.5" />
            Devices
          </TabsTrigger>
          <TabsTrigger value={1} className="text-[12px] font-medium gap-1.5">
            <Link2 className="h-3.5 w-3.5" />
            Enrollments
          </TabsTrigger>
          <TabsTrigger value={2} className="text-[12px] font-medium gap-1.5">
            <UserX className="h-3.5 w-3.5" />
            Unmapped Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="pt-4">
          <DevicesTab />
        </TabsContent>

        <TabsContent value={1} className="pt-4">
          <EnrollmentsTab />
        </TabsContent>

        <TabsContent value={2} className="pt-4">
          <UnmappedGuestsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
