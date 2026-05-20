/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Production seed script for Spotworks.
 * Seeds only structural data: roles, permissions, role_permissions mappings,
 * approval_workflows (6 types), and a default organization.
 *
 * Run: npx tsx src/db/seed-production.ts
 *
 * Idempotent — checks for existing records before inserting.
 * Does NOT insert mock/test data (no employees, tasks, complaints, etc.).
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// --------------- helpers ---------------

async function findOrCreate(
  table: PgTable,
  where: SQL | undefined,
  values: Record<string, unknown>
): Promise<Record<string, any>> {
  const existing = await (db as any).select().from(table).where(where).limit(1);
  if (existing.length > 0) return existing[0];
  const [created] = await (db as any).insert(table).values(values).returning();
  return created;
}

// --------------- seed ---------------

async function main() {
  console.log("Production seed starting...\n");

  // 1. Default Organization
  const org = await findOrCreate(
    schema.organizations,
    eq(schema.organizations.name, "Default Organization"),
    { name: "Default Organization" }
  );
  const orgId = org.id as string;
  console.log("  Organization:", orgId);

  // 2. Permissions Catalog
  const modules = [
    "dashboard",
    "employees",
    "attendance",
    "assets",
    "tasks",
    "complaints",
    "inventory",
    "approvals",
    "reports",
    "settings",
    "iot",
    "projects",
  ];
  const actions = ["read", "create", "update", "delete"];

  const permissionRecords: Record<string, any>[] = [];
  for (const mod of modules) {
    for (const action of actions) {
      const record = await findOrCreate(
        schema.permissions,
        and(
          eq(schema.permissions.module, mod),
          eq(schema.permissions.action, action)
        ),
        {
          module: mod,
          action,
          description: `${action} access for ${mod} module`,
        }
      );
      permissionRecords.push(record);
    }
  }
  console.log(`  Permissions: ${permissionRecords.length} seeded`);

  // 3. Roles + Role-Permission Mappings
  const roleData = [
    {
      name: "super_admin",
      description: "Full access to all modules",
      modules: modules,
    },
    {
      name: "facility_manager",
      description: "Manage facility operations",
      modules: ["dashboard", "employees", "attendance", "assets", "tasks", "complaints", "inventory", "approvals", "reports", "iot", "projects"],
    },
    {
      name: "site_engineer",
      description: "Asset and task management",
      modules: ["dashboard", "assets", "tasks", "complaints", "inventory", "iot", "projects"],
    },
    {
      name: "hr_manager",
      description: "Employee and attendance management",
      modules: ["dashboard", "employees", "attendance", "reports"],
    },
    {
      name: "accountant",
      description: "Financial approvals and inventory",
      modules: ["dashboard", "inventory", "approvals", "reports"],
    },
    {
      name: "supervisor",
      description: "Day-to-day task and attendance tracking",
      modules: ["dashboard", "attendance", "tasks", "complaints"],
    },
    {
      name: "security_guard",
      description: "Attendance and complaint logging",
      modules: ["dashboard", "attendance", "complaints"],
    },
    {
      name: "viewer",
      description: "Read-only access to dashboard and reports",
      modules: ["dashboard", "reports"],
    },
  ];

  const roleActionMap: Record<string, string[]> = {
    super_admin: ["read", "create", "update", "delete"],
    facility_manager: ["read", "create", "update", "delete"],
    site_engineer: ["read", "create", "update"],
    hr_manager: ["read", "create", "update"],
    accountant: ["read", "create", "update"],
    supervisor: ["read", "create", "update"],
    security_guard: ["read", "create"],
    viewer: ["read"],
  };

  for (const rd of roleData) {
    const role = await findOrCreate(
      schema.roles,
      and(
        eq(schema.roles.orgId, orgId),
        eq(schema.roles.name, rd.name)
      ),
      {
        orgId,
        name: rd.name,
        permissions: { description: rd.description, modules: rd.modules },
      }
    );

    const allowedActions = roleActionMap[rd.name] || ["read"];
    for (const mod of rd.modules) {
      for (const action of allowedActions) {
        const perm = permissionRecords.find(
          (p) => p.module === mod && p.action === action
        );
        if (!perm) continue;

        const existing = await (db as any)
          .select()
          .from(schema.rolePermissions)
          .where(
            and(
              eq(schema.rolePermissions.roleId, role.id),
              eq(schema.rolePermissions.permissionId, perm.id)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await (db as any)
            .insert(schema.rolePermissions)
            .values({ roleId: role.id, permissionId: perm.id });
        }
      }
    }
  }
  console.log(`  Roles: ${roleData.length} seeded with permission mappings`);

  // 4. Approval Workflow Definitions (6 types)
  const workflowData = [
    {
      type: "advance" as const,
      steps: [
        { stepOrder: 1, approverRole: "facility_manager", label: "FM Approval" },
        { stepOrder: 2, approverRole: "accountant", label: "Finance Approval" },
      ],
    },
    {
      type: "uniform" as const,
      steps: [
        { stepOrder: 1, approverRole: "supervisor", label: "Supervisor Approval" },
        { stepOrder: 2, approverRole: "hr_manager", label: "HR Approval" },
      ],
    },
    {
      type: "petty_cash" as const,
      steps: [
        { stepOrder: 1, approverRole: "facility_manager", label: "FM Approval" },
        { stepOrder: 2, approverRole: "accountant", label: "Finance Verification" },
      ],
    },
    {
      type: "po" as const,
      steps: [
        { stepOrder: 1, approverRole: "facility_manager", label: "FM Approval" },
        { stepOrder: 2, approverRole: "accountant", label: "Finance Approval" },
        { stepOrder: 3, approverRole: "super_admin", label: "Management Approval" },
      ],
    },
    {
      type: "invoice" as const,
      steps: [
        { stepOrder: 1, approverRole: "facility_manager", label: "FM Verification" },
        { stepOrder: 2, approverRole: "accountant", label: "Finance Processing" },
      ],
    },
    {
      type: "salary_revision" as const,
      steps: [
        { stepOrder: 1, approverRole: "hr_manager", label: "HR Review" },
        { stepOrder: 2, approverRole: "facility_manager", label: "FM Approval" },
        { stepOrder: 3, approverRole: "super_admin", label: "Management Approval" },
      ],
    },
  ];

  for (const wf of workflowData) {
    await findOrCreate(
      schema.approvalWorkflows,
      and(
        eq(schema.approvalWorkflows.orgId, orgId),
        eq(schema.approvalWorkflows.type, wf.type)
      ),
      { orgId, type: wf.type, steps: wf.steps }
    );
  }
  console.log(`  Approval Workflows: ${workflowData.length} seeded`);

  console.log("\nProduction seed complete!");
  await client.end();
}

main().catch((err) => {
  console.error("Production seed failed:", err);
  process.exit(1);
});
