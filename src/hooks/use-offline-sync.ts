"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getPendingWrites,
  clearPendingWrites,
  applyServerData,
  getLastSyncTimestamp,
  setLastSyncTimestamp,
} from "@/lib/offline-store";

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSynced: string | null;
  forceSync: () => Promise<void>;
}

function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let deviceId = localStorage.getItem("spotworks-device-id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("spotworks-device-id", deviceId);
  }
  return deviceId;
}

export function useOfflineSync(): UseOfflineSyncReturn {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const syncInProgress = useRef(false);

  const sync = useCallback(async () => {
    if (syncInProgress.current || !navigator.onLine) return;
    syncInProgress.current = true;
    setIsSyncing(true);

    try {
      const pending = await getPendingWrites();
      const lastTimestamp =
        (await getLastSyncTimestamp()) ?? new Date(0).toISOString();
      const deviceId = getDeviceId();

      const response = await fetch("/api/v1/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastSyncTimestamp: lastTimestamp,
          pendingWrites: pending.map((w) => ({
            table: w.table,
            operation: w.operation,
            id: w.recordId,
            data: w.data,
            clientTimestamp: w.clientTimestamp,
          })),
          deviceId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Sync failed with status ${response.status}`);
      }

      const result = await response.json();

      // Apply server data to local store
      if (result.newData) {
        await applyServerData(result.newData);
      }

      // Clear successfully synced pending writes
      const ids = pending
        .map((w) => w.id)
        .filter((id): id is number => id !== undefined);
      if (ids.length > 0) {
        await clearPendingWrites(ids);
      }

      // Update sync timestamp
      if (result.newSyncTimestamp) {
        await setLastSyncTimestamp(result.newSyncTimestamp);
        setLastSynced(result.newSyncTimestamp);
      }

      // Refresh pending count
      const remaining = await getPendingWrites();
      setPendingCount(remaining.length);
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      syncInProgress.current = false;
      setIsSyncing(false);
    }
  }, []);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync on reconnect
      sync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [sync]);

  // Load initial state
  useEffect(() => {
    async function loadState() {
      const pending = await getPendingWrites();
      setPendingCount(pending.length);
      const ts = await getLastSyncTimestamp();
      setLastSynced(ts);
    }
    loadState();
  }, []);

  // Periodic sync when online (every 5 minutes)
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(sync, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isOnline, sync]);

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSynced,
    forceSync: sync,
  };
}
