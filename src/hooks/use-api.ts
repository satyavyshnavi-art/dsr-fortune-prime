"use client";
import { useState, useEffect, useCallback } from "react";

interface UseApiOptions<T> {
  url: string;
  initialData?: T;
  autoFetch?: boolean;
}

export function useApi<T>({ url, initialData, autoFetch = true }: UseApiOptions<T>) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [url]);

  const create = useCallback(async (body: any) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    await fetchData(); // refresh list
    return result;
  }, [url, fetchData]);

  const update = useCallback(async (id: string, body: any) => {
    const res = await fetch(`${url}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    await fetchData();
    return result;
  }, [url, fetchData]);

  const remove = useCallback(async (id: string) => {
    const res = await fetch(`${url}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await fetchData();
  }, [url, fetchData]);

  useEffect(() => {
    if (autoFetch) fetchData();
  }, [autoFetch, fetchData]);

  return { data, loading, error, fetchData, create, update, remove, setData };
}
