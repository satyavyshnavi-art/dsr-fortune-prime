/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Seed script for DSR Fortune Prime facility management app.
 * Run: npx tsx src/db/seed.ts
 *
 * Idempotent — checks for existing records before inserting.
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and, SQL } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://neondb_owner:npg_u3DNyhlO5iKQ@ep-odd-pond-a155vlkp.ap-southeast-1.aws.neon.tech/spotworks?sslmode=require";

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
  console.log("Seeding DSR Fortune Prime...\n");

  // 1. Organization
  const org = await findOrCreate(
    schema.organizations,
    eq(schema.organizations.name, "DSR Fortune Prime"),
    { name: "DSR Fortune Prime" }
  );
  const orgId = org.id as string;
  console.log("  Organization:", orgId);

  // 2. Facility
  const facility = await findOrCreate(
    schema.facilities,
    and(
      eq(schema.facilities.orgId, orgId),
      eq(schema.facilities.name, "DSR Fortune Prime")
    ),
    {
      orgId,
      name: "DSR Fortune Prime",
      type: "residential",
      city: "Bangalore",
      location: "Whitefield, Bangalore",
      clientName: "DSR Infrastructure Pvt Ltd",
      contactNumber: "+91-9876543210",
      email: "admin@dsrfortuneprime.com",
    }
  );
  const facilityId = facility.id as string;
  console.log("  Facility:", facilityId);

  // 3. Employees (12)
  const employeeData = [
    { empId: "EMP001", firstName: "Neha", lastName: "Agarwal", designation: "Facility Manager", department: "Management", phone: "+91-9800000001", email: "neha.agarwal@dsrfp.com" },
    { empId: "EMP002", firstName: "Shalini", lastName: "Mehta", designation: "Admin Executive", department: "Administration", phone: "+91-9800000002", email: "shalini.mehta@dsrfp.com" },
    { empId: "EMP003", firstName: "Pradeep", lastName: "Desai", designation: "Chief Engineer", department: "Engineering", phone: "+91-9800000003", email: "pradeep.desai@dsrfp.com" },
    { empId: "EMP004", firstName: "Rajesh", lastName: "Kumar", designation: "Electrician", department: "Engineering", phone: "+91-9800000004", email: "rajesh.kumar@dsrfp.com" },
    { empId: "EMP005", firstName: "Suresh", lastName: "Patil", designation: "Plumber", department: "Engineering", phone: "+91-9800000005", email: "suresh.patil@dsrfp.com" },
    { empId: "EMP006", firstName: "Anita", lastName: "Sharma", designation: "Housekeeping Supervisor", department: "Housekeeping", phone: "+91-9800000006", email: "anita.sharma@dsrfp.com" },
    { empId: "EMP007", firstName: "Vikram", lastName: "Singh", designation: "Security Head", department: "Security", phone: "+91-9800000007", email: "vikram.singh@dsrfp.com" },
    { empId: "EMP008", firstName: "Meena", lastName: "Reddy", designation: "Accounts Officer", department: "Finance", phone: "+91-9800000008", email: "meena.reddy@dsrfp.com" },
    { empId: "EMP009", firstName: "Arun", lastName: "Nair", designation: "HVAC Technician", department: "Engineering", phone: "+91-9800000009", email: "arun.nair@dsrfp.com" },
    { empId: "EMP010", firstName: "Deepa", lastName: "Joshi", designation: "Gardener Supervisor", department: "Horticulture", phone: "+91-9800000010", email: "deepa.joshi@dsrfp.com" },
    { empId: "EMP011", firstName: "Manoj", lastName: "Tiwari", designation: "Fire Safety Officer", department: "Safety", phone: "+91-9800000011", email: "manoj.tiwari@dsrfp.com" },
    { empId: "EMP012", firstName: "Kavitha", lastName: "Iyer", designation: "Front Desk Executive", department: "Administration", phone: "+91-9800000012", email: "kavitha.iyer@dsrfp.com" },
  ];

  const employeeRecords: Record<string, any>[] = [];
  for (const emp of employeeData) {
    const record = await findOrCreate(
      schema.employees,
      and(
        eq(schema.employees.facilityId, facilityId),
        eq(schema.employees.empId, emp.empId)
      ),
      { facilityId, ...emp }
    );
    employeeRecords.push(record);
  }
  console.log(`  Employees: ${employeeRecords.length} seeded`);

  // 4. Asset Categories
  const categoryData = [
    { name: "Earthing Pits", icon: "zap", auditFrequency: "quarterly" },
    { name: "HVAC Systems", icon: "wind", auditFrequency: "monthly" },
    { name: "Fire Safety Equipment", icon: "flame", auditFrequency: "monthly" },
    { name: "Water Tanks", icon: "droplets", auditFrequency: "weekly" },
    { name: "Electric Panels", icon: "plug", auditFrequency: "monthly" },
    { name: "Pumps", icon: "waves", auditFrequency: "weekly" },
    { name: "Elevators", icon: "arrow-up-down", auditFrequency: "monthly" },
    { name: "Generators", icon: "battery-charging", auditFrequency: "monthly" },
    { name: "STP/WTP Plants", icon: "factory", auditFrequency: "daily" },
  ];

  const categoryRecords: Record<string, any>[] = [];
  for (const cat of categoryData) {
    const record = await findOrCreate(
      schema.assetCategories,
      and(
        eq(schema.assetCategories.facilityId, facilityId),
        eq(schema.assetCategories.name, cat.name)
      ),
      { facilityId, ...cat }
    );
    categoryRecords.push(record);
  }
  console.log(`  Asset Categories: ${categoryRecords.length} seeded`);

  // 5. Sample Assets (a few per category)
  const assetData = [
    { categoryIdx: 0, name: "Earthing Pit - Block A", assetTag: "EP-A01", location: "Block A Basement", status: "active" },
    { categoryIdx: 0, name: "Earthing Pit - Block B", assetTag: "EP-B01", location: "Block B Basement", status: "active" },
    { categoryIdx: 1, name: "AHU - Clubhouse", assetTag: "HVAC-001", location: "Clubhouse Terrace", status: "active", maintenanceFrequency: "monthly" },
    { categoryIdx: 1, name: "Split AC - Lobby", assetTag: "HVAC-002", location: "Main Lobby", status: "active", maintenanceFrequency: "quarterly" },
    { categoryIdx: 2, name: "Fire Extinguisher - Block A Ground", assetTag: "FS-A01", location: "Block A Ground Floor", status: "active" },
    { categoryIdx: 2, name: "Fire Alarm Panel", assetTag: "FS-PNL-01", location: "Security Room", status: "active" },
    { categoryIdx: 2, name: "Fire Hydrant - Podium", assetTag: "FS-HYD-01", location: "Podium Level", status: "active" },
    { categoryIdx: 3, name: "Overhead Tank - Block A", assetTag: "WT-OHT-A", location: "Block A Terrace", status: "active" },
    { categoryIdx: 3, name: "Underground Sump - Main", assetTag: "WT-UGS-01", location: "Basement Level 2", status: "active" },
    { categoryIdx: 4, name: "Main LT Panel", assetTag: "EP-LT-01", location: "Electrical Room", status: "active" },
    { categoryIdx: 4, name: "DG Changeover Panel", assetTag: "EP-DG-01", location: "DG Room", status: "active" },
    { categoryIdx: 5, name: "Borewell Pump 1", assetTag: "PMP-BW-01", location: "Pump Room", status: "active", maintenanceFrequency: "weekly" },
    { categoryIdx: 5, name: "STP Feed Pump", assetTag: "PMP-STP-01", location: "STP Area", status: "active" },
    { categoryIdx: 6, name: "Elevator - Block A", assetTag: "ELV-A01", location: "Block A", status: "active", maintenanceFrequency: "monthly" },
    { categoryIdx: 6, name: "Elevator - Block B", assetTag: "ELV-B01", location: "Block B", status: "active", maintenanceFrequency: "monthly" },
    { categoryIdx: 7, name: "DG Set 1 - 500 KVA", assetTag: "DG-001", location: "DG Room", status: "active", maintenanceFrequency: "monthly" },
    { categoryIdx: 7, name: "DG Set 2 - 380 KVA", assetTag: "DG-002", location: "DG Room", status: "active", maintenanceFrequency: "monthly" },
    { categoryIdx: 8, name: "STP - 150 KLD", assetTag: "STP-001", location: "STP Compound", status: "active", maintenanceFrequency: "daily" },
    { categoryIdx: 8, name: "WTP Unit", assetTag: "WTP-001", location: "WTP Room", status: "active", maintenanceFrequency: "daily" },
  ];

  let assetCount = 0;
  for (const a of assetData) {
    const { categoryIdx, ...rest } = a;
    await findOrCreate(
      schema.assets,
      and(
        eq(schema.assets.facilityId, facilityId),
        eq(schema.assets.assetTag, rest.assetTag)
      ),
      { facilityId, categoryId: categoryRecords[categoryIdx].id, ...rest }
    );
    assetCount++;
  }
  console.log(`  Assets: ${assetCount} seeded`);

  // 6. Energy Meter Configs (5 EB + 2 DG)
  const meterData = [
    { meterIdLabel: "EB-01", type: "eb", location: "Main Incomer", load: "500" },
    { meterIdLabel: "EB-02", type: "eb", location: "Block A", load: "200" },
    { meterIdLabel: "EB-03", type: "eb", location: "Block B", load: "200" },
    { meterIdLabel: "EB-04", type: "eb", location: "Common Areas", load: "100" },
    { meterIdLabel: "EB-05", type: "eb", location: "Clubhouse", load: "80" },
    { meterIdLabel: "DG-01", type: "dg", location: "DG Set 1", load: "500" },
    { meterIdLabel: "DG-02", type: "dg", location: "DG Set 2", load: "380" },
  ];

  for (const m of meterData) {
    await findOrCreate(
      schema.energyMeterConfigs,
      and(
        eq(schema.energyMeterConfigs.facilityId, facilityId),
        eq(schema.energyMeterConfigs.meterIdLabel, m.meterIdLabel)
      ),
      { facilityId, ...m }
    );
  }
  console.log(`  Energy Meters: ${meterData.length} seeded`);

  // 7. Water Infra Configs
  const waterData = [
    { sourceName: "Overhead Tank - Block A", type: "tank_overhead", capacity: "20000", location: "Block A Terrace" },
    { sourceName: "Overhead Tank - Block B", type: "tank_overhead", capacity: "20000", location: "Block B Terrace" },
    { sourceName: "Underground Sump", type: "tank_underground", capacity: "100000", location: "Basement Level 2" },
    { sourceName: "Borewell 1", type: "borewell", capacity: "5000", location: "Pump Room Area" },
    { sourceName: "Borewell 2", type: "borewell", capacity: "5000", location: "Garden Side" },
    { sourceName: "Rainwater Cavern", type: "cavern", capacity: "50000", location: "Below Podium" },
    { sourceName: "Tanker Bay", type: "tanker", capacity: "12000", location: "Entry Gate" },
  ];

  for (const w of waterData) {
    await findOrCreate(
      schema.waterInfraConfigs,
      and(
        eq(schema.waterInfraConfigs.facilityId, facilityId),
        eq(schema.waterInfraConfigs.sourceName, w.sourceName)
      ),
      { facilityId, ...w }
    );
  }
  console.log(`  Water Infra: ${waterData.length} seeded`);

  // 8. Alerts
  const alertData = [
    { category: "power", severity: "critical", title: "DG Set 1 fuel level below 20%", message: "DG-001 diesel tank at 18%. Schedule refueling immediately.", status: "unacknowledged" },
    { category: "water", severity: "high", title: "Underground sump level low", message: "Sump level at 25%. Consider scheduling tanker delivery.", status: "acknowledged" },
    { category: "fire_safety", severity: "medium", title: "Fire extinguisher inspection overdue", message: "3 extinguishers in Block A due for annual inspection.", status: "unacknowledged" },
    { category: "maintenance", severity: "low", title: "Elevator AMC renewal in 30 days", message: "Block A elevator AMC expires on 2026-05-27. Initiate renewal.", status: "unacknowledged" },
  ];

  for (const a of alertData) {
    await findOrCreate(
      schema.alerts,
      and(
        eq(schema.alerts.facilityId, facilityId),
        eq(schema.alerts.title, a.title)
      ),
      { facilityId, ...a }
    );
  }
  console.log(`  Alerts: ${alertData.length} seeded`);

  // 9. Complaints
  const complaintData = [
    { ticketId: "CMP-001", title: "Water leakage in Block A 3rd floor corridor", description: "Residents reported water seepage near lift lobby.", department: "Engineering", priority: "high", status: "open", createdBy: "Resident - Flat A-302" },
    { ticketId: "CMP-002", title: "Streetlight not working near Gate 2", description: "Two streetlights near south gate not functioning for 3 days.", department: "Engineering", priority: "medium", status: "in_progress", assignedTo: "Rajesh Kumar", createdBy: "Security" },
    { ticketId: "CMP-003", title: "Foul smell from STP area", description: "Strong odour reported near STP compound during evening hours.", department: "Engineering", priority: "high", status: "open", createdBy: "Resident - Flat B-101" },
  ];

  for (const c of complaintData) {
    await findOrCreate(
      schema.complaints,
      and(
        eq(schema.complaints.facilityId, facilityId),
        eq(schema.complaints.ticketId, c.ticketId)
      ),
      { facilityId, ...c }
    );
  }
  console.log(`  Complaints: ${complaintData.length} seeded`);

  // 10. Tasks
  const taskData = [
    { title: "Monthly fire drill", description: "Conduct fire evacuation drill for all blocks.", department: "Safety", priority: "high", status: "pending", assignedTo: "Manoj Tiwari", dueDate: "2026-05-05", source: "compliance", eisenhowerMatrix: "important_urgent" },
    { title: "Garden landscaping - Phase 2", description: "Complete landscaping of north garden area.", department: "Horticulture", priority: "medium", status: "in_progress", assignedTo: "Deepa Joshi", dueDate: "2026-05-15", source: "project" },
    { title: "DG servicing - Q2", description: "Quarterly servicing of both DG sets.", department: "Engineering", priority: "high", status: "pending", assignedTo: "Pradeep Desai", dueDate: "2026-05-10", source: "ppm" },
    { title: "Update resident contact directory", description: "Collect and update latest phone numbers of all flat owners.", department: "Administration", priority: "low", status: "pending", assignedTo: "Kavitha Iyer", dueDate: "2026-05-20", source: "admin" },
  ];

  for (const t of taskData) {
    await findOrCreate(
      schema.tasks,
      and(
        eq(schema.tasks.facilityId, facilityId),
        eq(schema.tasks.title, t.title)
      ),
      { facilityId, ...t }
    );
  }
  console.log(`  Tasks: ${taskData.length} seeded`);

  // 11. Demo User Profile
  await findOrCreate(
    schema.userProfiles,
    eq(schema.userProfiles.auth0UserId, "demo|seed-user"),
    {
      auth0UserId: "demo|seed-user",
      facilityId,
      displayName: "Demo Admin",
      phone: "+91-9999999999",
    }
  );
  console.log("  Demo User Profile: seeded");

  console.log("\nSeed complete!");
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
