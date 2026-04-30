"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface DashboardSummary {
  employees: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  attendance: {
    rate: number;
    recentCheckIns: Array<{
      employeeId: string;
      date: string;
      status: string;
      checkIn: string | null;
    }>;
    byStatus: Record<string, number>;
  };
  assets: {
    total: number;
    active: number;
    maintenance: number;
    inactive: number;
    byCategory: Array<{ categoryName: string; count: number }>;
    byStatus: Record<string, number>;
    gatePasses: { out: number; pending: number };
  };
  complaints: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    avgResolutionDays: number;
    recentComplaints: Array<{
      id: string;
      title: string;
      status: string;
      priority: string;
      createdAt: string;
    }>;
    byStatus: Record<string, number>;
  };
  tasks: {
    total: number;
    pending: number;
    unassigned: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    overdue: number;
    eisenhower: Record<string, number>;
    recentTasks: Array<{
      id: string;
      title: string;
      priority: string;
      status: string;
      dueDate: string | null;
      eisenhowerMatrix: string | null;
    }>;
    byStatus: Record<string, number>;
  };
  powerReadings: {
    totalKwh: number;
    avgDaily: number;
    activeMeters: number;
    byType: Record<string, { totalUnits: number; meterCount: number }>;
    recentReadings: Array<{
      meterId: string;
      meterType: string;
      location: string | null;
      unitsConsumed: string | null;
      date: string;
    }>;
  };
  waterReadings: {
    totalLiters: number;
    avgDaily: number;
    activeSources: number;
    recentReadings: Array<{
      sourceName: string;
      sourceType: string;
      consumed: string | null;
      levelPercent: string | null;
      date: string;
    }>;
  };
  waterQuality: {
    readings: Array<{
      plantType: string;
      parameters: any;
      date: string;
    }>;
    hasData: boolean;
  };
  vendorTickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
    avgResolutionDays: number;
    byStatus: Record<string, number>;
  };
  alerts: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    unacknowledged: number;
  };
}

interface DashboardContextValue {
  data: DashboardSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  data: null,
  loading: true,
  error: null,
  refresh: () => {},
});

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/dashboard/summary");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json && !json.error) {
        setData(json);
      } else {
        setError(json?.error ?? "Unknown error");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refresh: fetchData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  return useContext(DashboardContext);
}
