"use client";

import { useState } from "react";
import { Users, Shield, ScrollText } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { UserList } from "@/components/modules/users/user-list";
import { RolesPermissions } from "@/components/modules/users/roles-permissions";
import { UserAuditLog } from "@/components/modules/users/user-audit-log";

type TabId = "users" | "roles" | "audit";

const tabs = [
  { id: "users" as TabId, label: "Users", icon: Users },
  { id: "roles" as TabId, label: "Roles & Access", icon: Shield },
  { id: "audit" as TabId, label: "User Audit", icon: ScrollText },
];

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="User Management" />

      <div className="flex items-center gap-1 border-b overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div>
        {activeTab === "users" && <UserList />}
        {activeTab === "roles" && <RolesPermissions />}
        {activeTab === "audit" && <UserAuditLog />}
      </div>
    </div>
  );
}
