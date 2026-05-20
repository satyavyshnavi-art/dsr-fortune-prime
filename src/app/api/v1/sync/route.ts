import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tasks,
  attendanceRecords,
  workLogs,
  inventoryItems,
  inventoryTransactions,
  approvalRequests,
  approvalSteps,
} from "@/db/schema";
import { gt, sql } from "drizzle-orm";

// Modules where server always wins (financial data)
const SERVER_WINS_TABLES = new Set(["inventory", "approvals"]);

// Modules where last-write-wins applies
const LAST_WRITE_WINS_TABLES = new Set(["tasks", "attendance"]);

// Modules where queue-and-merge applies
const QUEUE_MERGE_TABLES = new Set(["work_logs"]);

interface PendingWrite {
  table: string;
  operation: "insert" | "update" | "delete";
  id?: string;
  data: Record<string, any>;
  clientTimestamp: string;
}

interface SyncRequest {
  lastSyncTimestamp: string;
  pendingWrites: PendingWrite[];
  deviceId: string;
}

interface ConflictRecord {
  table: string;
  id: string;
  resolution: "server_wins" | "client_wins" | "merged";
  serverData?: Record<string, any>;
}

async function getChangedData(table: string, since: Date) {
  const sinceStr = since.toISOString();

  switch (table) {
    case "tasks":
      return db
        .select()
        .from(tasks)
        .where(gt(tasks.createdAt, since));
    case "attendance":
      return db
        .select()
        .from(attendanceRecords)
        .where(sql`${attendanceRecords.checkIn} > ${sinceStr}::timestamp OR ${attendanceRecords.checkOut} > ${sinceStr}::timestamp`);
    case "work_logs":
      return db
        .select()
        .from(workLogs)
        .where(gt(workLogs.createdAt, since));
    case "inventory":
      return db
        .select()
        .from(inventoryItems);
    default:
      return [];
  }
}

async function processWrite(
  write: PendingWrite
): Promise<{ success: boolean; conflict?: ConflictRecord }> {
  const { table, operation, id, data } = write;

  // Server-wins for financial data
  if (SERVER_WINS_TABLES.has(table)) {
    if (id) {
      // Return server data as authoritative
      const serverData = await getServerRecord(table, id);
      if (serverData) {
        return {
          success: false,
          conflict: {
            table,
            id,
            resolution: "server_wins",
            serverData,
          },
        };
      }
    }
    // If no server record exists, allow the insert
    return await applyWrite(write);
  }

  // Last-write-wins for status updates
  if (LAST_WRITE_WINS_TABLES.has(table)) {
    return await applyWrite(write);
  }

  // Queue-and-merge for work logs
  if (QUEUE_MERGE_TABLES.has(table)) {
    if (operation === "insert") {
      return await applyWrite(write);
    }
    // For updates, merge fields
    if (id) {
      const serverData = await getServerRecord(table, id);
      if (serverData) {
        const merged = { ...serverData, ...data };
        await applyWrite({ ...write, data: merged, operation: "update" });
        return {
          success: true,
          conflict: { table, id, resolution: "merged", serverData: merged },
        };
      }
    }
    return await applyWrite(write);
  }

  // Default: last-write-wins
  return await applyWrite(write);
}

async function getServerRecord(
  table: string,
  id: string
): Promise<Record<string, any> | null> {
  let result: any[];
  switch (table) {
    case "tasks":
      result = await db
        .select()
        .from(tasks)
        .where(sql`${tasks.id} = ${id}`)
        .limit(1);
      break;
    case "attendance":
      result = await db
        .select()
        .from(attendanceRecords)
        .where(sql`${attendanceRecords.id} = ${id}`)
        .limit(1);
      break;
    case "work_logs":
      result = await db
        .select()
        .from(workLogs)
        .where(sql`${workLogs.id} = ${id}`)
        .limit(1);
      break;
    case "inventory":
      result = await db
        .select()
        .from(inventoryItems)
        .where(sql`${inventoryItems.id} = ${id}`)
        .limit(1);
      break;
    default:
      return null;
  }
  return result[0] ?? null;
}

async function applyWrite(
  write: PendingWrite
): Promise<{ success: boolean; conflict?: ConflictRecord }> {
  const { table, operation, id, data } = write;

  try {
    switch (table) {
      case "tasks":
        if (operation === "insert") {
          await db.insert(tasks).values(data as any);
        } else if (operation === "update" && id) {
          await db
            .update(tasks)
            .set(data)
            .where(sql`${tasks.id} = ${id}`);
        }
        break;
      case "attendance":
        if (operation === "insert") {
          await db.insert(attendanceRecords).values(data as any);
        } else if (operation === "update" && id) {
          await db
            .update(attendanceRecords)
            .set(data)
            .where(sql`${attendanceRecords.id} = ${id}`);
        }
        break;
      case "work_logs":
        if (operation === "insert") {
          await db.insert(workLogs).values(data as any);
        } else if (operation === "update" && id) {
          await db
            .update(workLogs)
            .set(data)
            .where(sql`${workLogs.id} = ${id}`);
        }
        break;
      case "inventory":
        if (operation === "insert") {
          await db.insert(inventoryItems).values(data as any);
        } else if (operation === "update" && id) {
          await db
            .update(inventoryItems)
            .set(data)
            .where(sql`${inventoryItems.id} = ${id}`);
        }
        break;
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to apply write for ${table}:`, error);
    return { success: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SyncRequest = await request.json();
    const { lastSyncTimestamp, pendingWrites, deviceId } = body;

    if (!lastSyncTimestamp || !deviceId) {
      return NextResponse.json(
        { error: "lastSyncTimestamp and deviceId are required" },
        { status: 400 }
      );
    }

    const since = new Date(lastSyncTimestamp);
    const now = new Date();

    // Process client pending writes
    const conflicts: ConflictRecord[] = [];
    for (const write of pendingWrites ?? []) {
      const result = await processWrite(write);
      if (result.conflict) {
        conflicts.push(result.conflict);
      }
    }

    // Fetch server changes since last sync
    const newData: Record<string, any[]> = {};
    const tablesToSync = ["tasks", "attendance", "work_logs", "inventory"];

    for (const table of tablesToSync) {
      const data = await getChangedData(table, since);
      if (Array.isArray(data) && data.length > 0) {
        newData[table] = data;
      }
    }

    return NextResponse.json({
      newData,
      conflicts,
      newSyncTimestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("POST /api/v1/sync error:", error);
    return NextResponse.json(
      { error: "Sync failed" },
      { status: 500 }
    );
  }
}
