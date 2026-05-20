/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Data migration script template for importing from an external system.
 * Accepts JSON input via stdin or --file flag, validates with Zod,
 * inserts with conflict handling.
 *
 * Usage:
 *   npx tsx src/db/migrate-data.ts --file data.json
 *   npx tsx src/db/migrate-data.ts --file data.json --dry-run
 *   cat data.json | npx tsx src/db/migrate-data.ts
 *   cat data.json | npx tsx src/db/migrate-data.ts --dry-run
 */

import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import * as schema from "./schema";
import { readFileSync } from "fs";

// --------------- CLI flags ---------------

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const fileIdx = args.indexOf("--file");
const filePath = fileIdx !== -1 ? args[fileIdx + 1] : null;

// --------------- Zod schemas for importable entities ---------------

const importEmployeeSchema = z.object({
  empId: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100),
  lastName: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  dateOfBirth: z.string().optional(),
});

const importAssetSchema = z.object({
  name: z.string().min(1).max(255),
  assetTag: z.string().max(100),
  categoryName: z.string().min(1),
  location: z.string().max(255).optional(),
  status: z.enum(["active", "maintenance", "inactive"]).optional(),
});

const importInventorySchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().max(100).optional(),
  unit: z.string().max(50).optional(),
  currentQty: z.number().int().min(0).default(0),
  minReorderLevel: z.number().int().min(0).default(0),
});

const migrationInputSchema = z.object({
  facilityId: z.string().uuid(),
  employees: z.array(importEmployeeSchema).optional(),
  assets: z.array(importAssetSchema).optional(),
  inventory: z.array(importInventorySchema).optional(),
});

type MigrationInput = z.infer<typeof migrationInputSchema>;

// --------------- DB connection ---------------

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// --------------- Migration logic ---------------

async function migrateEmployees(facilityId: string, employees: MigrationInput["employees"]) {
  if (!employees || employees.length === 0) return;

  let created = 0;
  let skipped = 0;

  for (const emp of employees) {
    const existing = await db
      .select({ id: schema.employees.id })
      .from(schema.employees)
      .where(
        and(
          eq(schema.employees.facilityId, facilityId),
          eq(schema.employees.empId, emp.empId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    if (!dryRun) {
      await db.insert(schema.employees).values({
        facilityId,
        ...emp,
      });
    }
    created++;
  }

  console.log(`  Employees: ${created} ${dryRun ? "would be " : ""}created, ${skipped} skipped (already exist)`);
}

async function migrateAssets(facilityId: string, assets: MigrationInput["assets"]) {
  if (!assets || assets.length === 0) return;

  let created = 0;
  let skipped = 0;
  let categoryMissing = 0;

  for (const asset of assets) {
    // Look up category by name
    const [category] = await db
      .select({ id: schema.assetCategories.id })
      .from(schema.assetCategories)
      .where(
        and(
          eq(schema.assetCategories.facilityId, facilityId),
          eq(schema.assetCategories.name, asset.categoryName)
        )
      )
      .limit(1);

    if (!category) {
      categoryMissing++;
      console.warn(`    Warning: category "${asset.categoryName}" not found for asset "${asset.name}"`);
      continue;
    }

    const existing = await db
      .select({ id: schema.assets.id })
      .from(schema.assets)
      .where(
        and(
          eq(schema.assets.facilityId, facilityId),
          eq(schema.assets.assetTag, asset.assetTag)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    if (!dryRun) {
      await db.insert(schema.assets).values({
        facilityId,
        categoryId: category.id,
        name: asset.name,
        assetTag: asset.assetTag,
        location: asset.location,
        status: asset.status,
      });
    }
    created++;
  }

  console.log(`  Assets: ${created} ${dryRun ? "would be " : ""}created, ${skipped} skipped, ${categoryMissing} missing category`);
}

async function migrateInventory(facilityId: string, inventory: MigrationInput["inventory"]) {
  if (!inventory || inventory.length === 0) return;

  let created = 0;
  let skipped = 0;

  for (const item of inventory) {
    const existing = await db
      .select({ id: schema.inventoryItems.id })
      .from(schema.inventoryItems)
      .where(
        and(
          eq(schema.inventoryItems.facilityId, facilityId),
          eq(schema.inventoryItems.name, item.name)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      continue;
    }

    if (!dryRun) {
      await db.insert(schema.inventoryItems).values({
        facilityId,
        ...item,
      });
    }
    created++;
  }

  console.log(`  Inventory: ${created} ${dryRun ? "would be " : ""}created, ${skipped} skipped`);
}

// --------------- Main ---------------

async function main() {
  let rawInput: string;

  if (filePath) {
    rawInput = readFileSync(filePath, "utf-8");
  } else {
    // Read from stdin
    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    rawInput = Buffer.concat(chunks).toString("utf-8");
  }

  let data: unknown;
  try {
    data = JSON.parse(rawInput);
  } catch {
    console.error("Error: Invalid JSON input");
    process.exit(1);
  }

  const parsed = migrationInputSchema.safeParse(data);
  if (!parsed.success) {
    console.error("Validation errors:");
    for (const issue of parsed.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }

  const input = parsed.data;

  console.log(`Data migration ${dryRun ? "(DRY RUN) " : ""}starting...`);
  console.log(`  Target facility: ${input.facilityId}\n`);

  // Verify facility exists
  const [facility] = await db
    .select({ id: schema.facilities.id })
    .from(schema.facilities)
    .where(eq(schema.facilities.id, input.facilityId))
    .limit(1);

  if (!facility) {
    console.error(`Error: Facility ${input.facilityId} not found`);
    process.exit(1);
  }

  await migrateEmployees(input.facilityId, input.employees);
  await migrateAssets(input.facilityId, input.assets);
  await migrateInventory(input.facilityId, input.inventory);

  console.log(`\nMigration ${dryRun ? "(DRY RUN) " : ""}complete!`);
  await client.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
