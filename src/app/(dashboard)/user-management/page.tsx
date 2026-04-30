"use client";

import { Users, Shield, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserList } from "@/components/modules/users/user-list";
import { RolesPermissions } from "@/components/modules/users/roles-permissions";
import { UserAuditLog } from "@/components/modules/users/user-audit-log";

export default function UserManagementPage() {
  return (
    <div className="p-5 space-y-4">
      <PageHeader title="User Management" />

      <Tabs defaultValue={0}>
        <TabsList variant="line">
          <TabsTrigger value={0} className="text-[12px] font-medium gap-1.5">
            <Users className="h-3.5 w-3.5" />
            Users
          </TabsTrigger>
          <TabsTrigger value={1} className="text-[12px] font-medium gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Roles & Access
          </TabsTrigger>
          <TabsTrigger value={2} className="text-[12px] font-medium gap-1.5">
            <ScrollText className="h-3.5 w-3.5" />
            User Audit
          </TabsTrigger>
        </TabsList>

        <TabsContent value={0} className="pt-4">
          <UserList />
        </TabsContent>

        <TabsContent value={1} className="pt-4">
          <RolesPermissions />
        </TabsContent>

        <TabsContent value={2} className="pt-4">
          <UserAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}
