"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useApi } from "@/hooks/use-api";
import { Star, Save } from "lucide-react";

const CRITERIA = [
  { key: "quality", label: "Quality of Work" },
  { key: "timeliness", label: "Timeliness" },
  { key: "communication", label: "Communication" },
  { key: "safety", label: "Safety Compliance" },
  { key: "value", label: "Value for Money" },
];

interface VendorEval {
  id: string;
  vendorId: string | null;
  period: string | null;
  scores: Record<string, number> | null;
  createdAt: string;
}

export function VendorEvaluation() {
  const { data: apiResponse, loading, error, fetchData } = useApi<{ data: VendorEval[] }>({
    url: "/api/v1/vendor-evaluations",
    initialData: { data: [] },
  });

  const evaluations = apiResponse?.data ?? [];

  const [vendorId, setVendorId] = useState("");
  const [period, setPeriod] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  function handleScore(key: string, value: number) {
    setScores((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!period) return;

    setSubmitting(true);
    try {
      await fetch("/api/v1/vendor-evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId: undefined,
          vendorId: vendorId || undefined,
          facilityId: undefined,
          period,
          scores,
        }),
      });
      setScores({});
      setPeriod("");
      fetchData();
    } catch (err) {
      console.error("Failed to submit evaluation:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Evaluation Form */}
      <form onSubmit={handleSubmit} className="bg-slate-50 border rounded-lg p-4 space-y-4 max-w-2xl">
        <p className="text-[12px] font-semibold text-slate-700">New Vendor Evaluation</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">
              Vendor ID
            </label>
            <Input
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Vendor UUID"
              className="h-8 text-[12px]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-500 mb-1 block">
              Period
            </label>
            <Input
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              placeholder="e.g. Q1 2026"
              className="h-8 text-[12px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          {CRITERIA.map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <span className="text-[12px] text-slate-600 w-40">{c.label}</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleScore(c.key, n)}
                    className="p-0.5"
                  >
                    <Star
                      className={`h-4 w-4 ${
                        (scores[c.key] ?? 0) >= n
                          ? "text-amber-400 fill-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-400">{scores[c.key] ?? 0}/5</span>
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={!period || submitting}
          className="h-8 text-[12px] gap-1.5"
        >
          <Save className="h-3 w-3" />
          {submitting ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </form>

      {/* Previous evaluations */}
      <div>
        <p className="text-[12px] font-semibold text-slate-700 mb-2">
          Previous Evaluations ({evaluations.length})
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-700" />
          </div>
        ) : evaluations.length === 0 ? (
          <p className="text-[11px] text-slate-400 py-4">No evaluations recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {evaluations.map((ev) => {
              const avgScore = ev.scores
                ? Object.values(ev.scores).reduce((a, b) => a + b, 0) /
                  Object.values(ev.scores).length
                : 0;
              return (
                <div
                  key={ev.id}
                  className="flex items-center justify-between border rounded px-3 py-2"
                >
                  <div>
                    <p className="text-[12px] font-medium text-slate-700">{ev.period}</p>
                    <p className="text-[10px] text-slate-400">
                      {new Date(ev.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-[12px] font-semibold text-slate-700">
                      {avgScore.toFixed(1)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable. {error}
        </p>
      )}
    </div>
  );
}
