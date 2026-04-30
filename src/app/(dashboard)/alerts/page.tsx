"use client";

import { PageHeader } from "@/components/shared";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertsList } from "@/components/modules/alerts/alerts-list";
import { AlertConfiguration } from "@/components/modules/alerts/alert-configuration";
import { Bell, Settings } from "lucide-react";

export default function AlertsPage() {
  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Alerts" />

      <Tabs defaultValue="alerts">
        <TabsList variant="line">
          <TabsTrigger value="alerts">
            <Bell className="h-3.5 w-3.5" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Settings className="h-3.5 w-3.5" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="pt-3">
          <AlertsList />
        </TabsContent>

        <TabsContent value="configuration" className="pt-3">
          <AlertConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
