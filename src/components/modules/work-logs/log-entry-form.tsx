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
import { Save } from "lucide-react";

const ASSET_CATEGORIES = [
  { id: "eb", label: "EB Meters", fields: ["previousKwh", "currentKwh", "multiplicationFactor"] },
  { id: "water", label: "Water Readings", fields: ["previousLiters", "currentLiters", "levelPercent"] },
  { id: "solar", label: "Solar/DG", fields: ["dgRunHours", "dgFuelLevel", "solarGeneration"] },
  { id: "fire", label: "Fire Safety", fields: ["extinguisherPressure", "hydrantFlow", "alarmStatus"] },
  { id: "hvac", label: "HVAC Systems", fields: ["supplyTemp", "returnTemp", "filterStatus"] },
  { id: "lifts", label: "Lifts/Elevators", fields: ["operationalStatus", "lastServiceDate", "remarks"] },
];

interface LogEntryFormProps {
  facilityId?: string;
}

export function LogEntryForm({ facilityId }: LogEntryFormProps) {
  const [category, setCategory] = useState("");
  const [shift, setShift] = useState("");
  const [logDate, setLogDate] = useState(new Date().toISOString().split("T")[0]);
  const [readings, setReadings] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { create } = useApi({ url: "/api/v1/work-logs", autoFetch: false });

  const selectedCategory = ASSET_CATEGORIES.find((c) => c.id === category);

  function handleFieldChange(field: string, value: string) {
    setReadings((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !logDate) return;

    setSubmitting(true);
    setSuccess(false);
    try {
      await create({
        facilityId: facilityId || undefined,
        assetCategory: category,
        logDate,
        shift: shift || undefined,
        readings,
      });
      setSuccess(true);
      setReadings({});
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to submit work log:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label htmlFor="log-category" className="text-[11px] font-medium text-slate-500 mb-1 block">
            Category
          </label>
          <Select value={category} onValueChange={(v: string | null) => setCategory(v ?? "")}>
            <SelectTrigger id="log-category" className="h-8 text-[12px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-[12px]">
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="log-shift" className="text-[11px] font-medium text-slate-500 mb-1 block">
            Shift
          </label>
          <Select value={shift} onValueChange={(v: string | null) => setShift(v ?? "")}>
            <SelectTrigger id="log-shift" className="h-8 text-[12px]">
              <SelectValue placeholder="Select shift" />
            </SelectTrigger>
            <SelectContent>
              {["G", "A", "B", "C"].map((s) => (
                <SelectItem key={s} value={s} className="text-[12px]">
                  Shift {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="log-date" className="text-[11px] font-medium text-slate-500 mb-1 block">
            Date
          </label>
          <Input
            id="log-date"
            type="date"
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="h-8 text-[12px]"
          />
        </div>
      </div>

      {selectedCategory && (
        <div className="bg-slate-50 border rounded-lg p-3 space-y-3">
          <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
            {selectedCategory.label} Readings
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedCategory.fields.map((field) => (
              <div key={field}>
                <label htmlFor={`reading-${field}`} className="text-[11px] font-medium text-slate-500 mb-1 block">
                  {field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}
                </label>
                <Input
                  id={`reading-${field}`}
                  value={readings[field] || ""}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  placeholder="Enter value"
                  className="h-8 text-[12px]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={!category || !logDate || submitting}
          className="h-8 text-[12px] gap-1.5"
        >
          <Save className="h-3 w-3" aria-hidden="true" />
          {submitting ? "Submitting..." : "Submit Log"}
        </Button>
        {success && (
          <span className="text-[11px] text-emerald-700 font-medium">
            Log submitted successfully
          </span>
        )}
      </div>
    </form>
  );
}
