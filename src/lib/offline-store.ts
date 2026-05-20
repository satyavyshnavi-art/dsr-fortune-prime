import Dexie, { type Table } from "dexie";

export interface OfflineTask {
  id: string;
  facilityId: string;
  title: string;
  description?: string;
  department?: string;
  priority?: string;
  status: string;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
}

export interface OfflineAttendance {
  id: string;
  employeeId: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  source?: string;
}

export interface OfflineWorkLog {
  id: string;
  facilityId: string;
  assetCategory?: string;
  logDate?: string;
  shift?: string;
  readings?: any;
  loggedBy?: string;
  createdAt: string;
}

export interface OfflineInventoryItem {
  id: string;
  facilityId: string;
  name: string;
  category?: string;
  unit?: string;
  currentQty: number;
  minReorderLevel: number;
}

export interface PendingWrite {
  id?: number; // auto-increment key
  table: string;
  operation: "insert" | "update" | "delete";
  recordId?: string;
  data: Record<string, any>;
  clientTimestamp: string;
}

export interface SyncMeta {
  key: string;
  value: string;
}

class SpotworksOfflineDB extends Dexie {
  tasks!: Table<OfflineTask, string>;
  attendance!: Table<OfflineAttendance, string>;
  workLogs!: Table<OfflineWorkLog, string>;
  inventory!: Table<OfflineInventoryItem, string>;
  pendingWrites!: Table<PendingWrite, number>;
  syncMeta!: Table<SyncMeta, string>;

  constructor() {
    super("spotworks-offline");

    this.version(1).stores({
      tasks: "id, facilityId, status, dueDate",
      attendance: "id, employeeId, date",
      workLogs: "id, facilityId, logDate",
      inventory: "id, facilityId, category",
      pendingWrites: "++id, table, clientTimestamp",
      syncMeta: "key",
    });
  }
}

export const offlineDb = new SpotworksOfflineDB();

export async function queueWrite(
  table: string,
  operation: "insert" | "update" | "delete",
  data: Record<string, any>,
  recordId?: string
): Promise<void> {
  await offlineDb.pendingWrites.add({
    table,
    operation,
    recordId,
    data,
    clientTimestamp: new Date().toISOString(),
  });

  // Also apply locally for immediate UI feedback
  const store = (offlineDb as any)[table];
  if (store) {
    if (operation === "insert" || operation === "update") {
      await store.put(data);
    } else if (operation === "delete" && recordId) {
      await store.delete(recordId);
    }
  }
}

export async function getPendingWrites(): Promise<PendingWrite[]> {
  return offlineDb.pendingWrites.toArray();
}

export async function clearPendingWrites(ids: number[]): Promise<void> {
  await offlineDb.pendingWrites.bulkDelete(ids);
}

export async function applyServerData(
  newData: Record<string, any[]>
): Promise<void> {
  for (const [table, records] of Object.entries(newData)) {
    const store = (offlineDb as any)[table];
    if (store && Array.isArray(records)) {
      await store.bulkPut(records);
    }
  }
}

export async function getLastSyncTimestamp(): Promise<string | null> {
  const meta = await offlineDb.syncMeta.get("lastSyncTimestamp");
  return meta?.value ?? null;
}

export async function setLastSyncTimestamp(timestamp: string): Promise<void> {
  await offlineDb.syncMeta.put({ key: "lastSyncTimestamp", value: timestamp });
}
