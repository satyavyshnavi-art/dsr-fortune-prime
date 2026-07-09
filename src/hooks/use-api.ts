"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface UseApiOptions<T> {
  url: string;
  initialData?: T;
  autoFetch?: boolean;
}

export function useApi<T>({ url, initialData, autoFetch = true }: UseApiOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);

  const fetchData = useCallback(async () => {
    if (!initialFetchDone.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const unwrapped = json && !Array.isArray(json) && Array.isArray(json.data) ? json.data : json;
      setData(unwrapped);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      initialFetchDone.current = true;
    }
  }, [url]);

  const create = useCallback(async (body: any) => {
    const optimistic = { ...body, id: `temp-${Date.now()}`, createdAt: new Date().toISOString() };
    setData((prev) => {
      if (!Array.isArray(prev)) return prev;
      return [optimistic, ...prev] as T;
    });
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      fetchData();
      throw new Error(`HTTP ${res.status}`);
    }
    const result = await res.json();
    setData((prev) => {
      if (!Array.isArray(prev)) return prev;
      return (prev as any[]).map((item: any) =>
        item.id === optimistic.id ? { ...item, ...result } : item
      ) as T;
    });
    return result;
  }, [url, fetchData]);

  const update = useCallback(async (id: string, body: any) => {
    setData((prev) => {
      if (!Array.isArray(prev)) return prev;
      return (prev as any[]).map((item: any) =>
        item.id === id ? { ...item, ...body } : item
      ) as T;
    });
    const res = await fetch(`${url}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    setData((prev) => {
      if (!Array.isArray(prev)) return prev;
      return (prev as any[]).map((item: any) =>
        item.id === id ? { ...item, ...result } : item
      ) as T;
    });
    // No trailing refetch: the optimistic update + merged server response
    // already reflect the change. Callers that need server-derived side
    // effects (e.g. parent recalculation) refetch explicitly.
    return result;
  }, [url]);

  const remove = useCallback(async (id: string) => {
    setData((prev) => {
      if (!Array.isArray(prev)) return prev;
      return (prev as any[]).filter((item: any) => item.id !== id) as T;
    });
    const res = await fetch(`${url}/${id}`, { method: "DELETE" });
    if (!res.ok) {
      fetchData();
      throw new Error(`HTTP ${res.status}`);
    }
  }, [url, fetchData]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [autoFetch, fetchData]);

  return { data, loading, error, fetchData, create, update, remove, setData };
}
