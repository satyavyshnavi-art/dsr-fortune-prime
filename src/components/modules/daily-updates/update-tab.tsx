"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Droplets, Save, FlaskConical } from "lucide-react";
import {
  ebMeters,
  dgMeters,
  waterTanks,
  waterBorewells,
  waterCavern,
  waterTanker,
  waterQualityDefaults,
} from "./mock-data";

// ────────────────────────────────────────────────────────────────────────────
// Shared chrome
// ────────────────────────────────────────────────────────────────────────────

interface SectionShellProps {
  icon: React.ElementType;
  accent: "peach" | "sky" | "teal";
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

const ACCENT_TILE = {
  peach: "bg-amber-100 text-amber-600",
  sky: "bg-sky-100 text-sky-600",
  teal: "bg-teal-100 text-teal-600",
} as const;

function SectionShell({ icon: Icon, accent, title, subtitle, action, children }: SectionShellProps) {
  return (
    <Card className="rounded-2xl border-slate-100 shadow-none">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-5 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${ACCENT_TILE[accent]}`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-slate-900 leading-tight">
                {title}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{subtitle}</p>
            </div>
          </div>
          {action}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ReadingValue({
  value,
  state,
}: {
  value: number | null;
  state: "neutral" | "negative" | "positive";
}) {
  return (
    <span
      className={`text-[13px] font-semibold tabular-nums ${
        value === null
          ? "text-slate-300"
          : state === "negative"
          ? "text-rose-500"
          : state === "positive"
          ? "text-emerald-600"
          : "text-slate-500"
      }`}
    >
      {value !== null ? value.toFixed(1) : "—"}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Power Readings
// ────────────────────────────────────────────────────────────────────────────

function PowerReadingsSection() {
  const [ebData, setEbData] = useState(ebMeters);
  const [dgData, setDgData] = useState(dgMeters);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFacilityId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const updateEB = (idx: number, field: string, value: string) => {
    setEbData((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: Number(value) || 0 } : row))
    );
  };
  const updateDG = (idx: number, field: string, value: string) => {
    setDgData((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: Number(value) || 0 } : row))
    );
  };

  const handleSave = async () => {
    if (!facilityId) {
      toast.error("Facility not loaded yet. Please try again.");
      return;
    }
    setSaving(true);
    try {
      const allMeters = [...ebData, ...dgData].filter(
        (m) => m.currentKwh !== 0 && m.currentKwh !== null
      );
      if (allMeters.length === 0) {
        toast.info("No readings to save");
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      for (const meter of allMeters) {
        const units = (meter.currentKwh - meter.previousKwh) * meter.mf;
        const res = await fetch("/api/v1/power-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilityId,
            meterId: meter.meterId,
            meterType: meter.meterId.startsWith("DG") ? "dg" : "eb",
            location: meter.location,
            previousKwh: String(meter.previousKwh),
            currentKwh: String(meter.currentKwh),
            multiplicationFactor: String(meter.mf),
            unitsConsumed: String(units.toFixed(2)),
            date: today,
          }),
        });
        if (!res.ok) throw new Error("Failed to save reading for " + meter.meterId);
      }
      toast.success("Power readings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save power readings");
    } finally {
      setSaving(false);
    }
  };

  const renderMeterRow = (
    meter: (typeof ebData)[number],
    idx: number,
    onChange: (i: number, f: string, v: string) => void
  ) => {
    const hasInput = meter.currentKwh !== 0 && meter.currentKwh !== null;
    const units = hasInput ? (meter.currentKwh - meter.previousKwh) * meter.mf : null;
    const state =
      units === null ? "neutral" : units < 0 ? "negative" : units > 0 ? "positive" : "neutral";
    return (
      <TableRow key={meter.meterId + idx}>
        <TableCell className="text-[13px] font-medium text-slate-800">{meter.meterId}</TableCell>
        <TableCell className="text-[12px] text-slate-500">{meter.location}</TableCell>
        <TableCell className="text-right text-[12px] text-slate-500 tabular-nums">
          {meter.previousKwh > 0 ? meter.previousKwh.toLocaleString() : "0"}
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <Input
              type="number"
              value={meter.currentKwh || ""}
              onChange={(e) => onChange(idx, "currentKwh", e.target.value)}
              className="w-[90px] h-9 text-center text-[13px] rounded-lg"
              placeholder="0"
            />
          </div>
        </TableCell>
        <TableCell>
          <div className="flex justify-center">
            <Input
              type="number"
              value={meter.mf}
              onChange={(e) => onChange(idx, "mf", e.target.value)}
              className="w-[70px] h-9 text-center text-[13px] rounded-lg"
            />
          </div>
        </TableCell>
        <TableCell className="text-right">
          <ReadingValue value={units} state={state} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <SectionShell
      icon={Zap}
      accent="peach"
      title="Power Readings"
      subtitle={`${ebMeters.length + dgMeters.length} meters configured`}
      action={
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 text-[12px] px-4 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Readings"}
        </Button>
      }
    >
      <div className="space-y-6">
        <div>
          <h4 className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide mb-2">
            Energy Meters (EB)
          </h4>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400">Meter ID</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400">Location</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-right">Previous (kWh)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-center w-[120px]">Current (kWh)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-center w-[100px]">MF</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-right w-[100px]">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{ebData.map((m, i) => renderMeterRow(m, i, updateEB))}</TableBody>
          </Table>
        </div>

        <div>
          <h4 className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide mb-2">
            DG (Diesel Generator)
          </h4>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400">Meter ID</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400">Location</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-right">Previous (kWh)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-center w-[120px]">Current (kWh)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-center w-[100px]">MF</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-right w-[100px]">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{dgData.map((m, i) => renderMeterRow(m, i, updateDG))}</TableBody>
          </Table>
        </div>
      </div>
    </SectionShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Water Readings
// ────────────────────────────────────────────────────────────────────────────

type WaterRow = {
  source: string;
  type: string;
  previousL: number;
  currentL: number;
  levelPercent: number;
  consumed: number;
};

function WaterSubTable({
  title,
  rows,
  onChange,
  showLevelInput = true,
}: {
  title: string;
  rows: WaterRow[];
  onChange: (idx: number, field: string, value: string) => void;
  showLevelInput?: boolean;
}) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold text-slate-700 uppercase tracking-wide mb-2">
        {title}
      </h4>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-[10px] uppercase tracking-wide text-slate-400">Source</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 w-[80px]">Type</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-right">Previous (L)</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-center w-[120px]">Current (L)</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-center w-[100px]">Level %</TableHead>
            <TableHead className="text-[10px] uppercase tracking-wide text-slate-400 text-right w-[110px]">Consumed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, idx) => {
            const hasPrevious = row.previousL > 0;
            const hasCurrentInput = row.currentL !== 0;
            const consumed = hasCurrentInput && hasPrevious ? row.currentL - row.previousL : null;
            return (
              <TableRow key={row.source + idx}>
                <TableCell className="text-[13px] text-slate-800">{row.source}</TableCell>
                <TableCell>
                  <span className="inline-block rounded-full bg-sky-100 text-sky-700 text-[10px] font-medium px-2 py-0.5">
                    {row.type}
                  </span>
                </TableCell>
                <TableCell className="text-right text-[12px] text-slate-500 tabular-nums">
                  {hasPrevious ? row.previousL.toLocaleString() : <span className="text-slate-300">—</span>}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {!hasPrevious && row.type === "tank" ? (
                      <span className="text-[11px] italic text-slate-300">Not tracked</span>
                    ) : (
                      <Input
                        type="number"
                        value={row.currentL || ""}
                        onChange={(e) => onChange(idx, "currentL", e.target.value)}
                        className="w-[100px] h-9 text-center text-[13px] rounded-lg"
                        placeholder="0"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center">
                    {showLevelInput ? (
                      <Input
                        type="number"
                        value={row.levelPercent || ""}
                        onChange={(e) => onChange(idx, "levelPercent", e.target.value)}
                        className="w-[80px] h-9 text-center text-[13px] rounded-lg"
                        placeholder="%"
                      />
                    ) : (
                      <span className="text-[11px] italic text-slate-300">Not tracked</span>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className={`text-right text-[12px] tabular-nums ${
                    consumed === null
                      ? "text-slate-400"
                      : consumed < 0
                      ? "text-rose-500 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  {consumed !== null ? `${consumed.toLocaleString()} L` : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function WaterReadingsSection() {
  const [tanks, setTanks] = useState(waterTanks);
  const [borewells, setBorewells] = useState(waterBorewells);
  const [cavern, setCavern] = useState(waterCavern);
  const [tanker, setTanker] = useState(waterTanker);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/v1/facilities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFacilityId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const makeHandler =
    (setter: React.Dispatch<React.SetStateAction<WaterRow[]>>) =>
    (idx: number, field: string, value: string) => {
      setter((prev) =>
        prev.map((row, i) => (i === idx ? { ...row, [field]: Number(value) || 0 } : row))
      );
    };

  const handleSave = async () => {
    if (!facilityId) {
      toast.error("Facility not loaded yet. Please try again.");
      return;
    }
    setSaving(true);
    try {
      const allSources = [
        ...tanks.map((r) => ({ ...r, sourceType: r.type === "tank" ? "tank_overhead" : "tank_underground" })),
        ...borewells.map((r) => ({ ...r, sourceType: "borewell" as const })),
        ...cavern.map((r) => ({ ...r, sourceType: "cauvery" as const })),
        ...tanker.map((r) => ({ ...r, sourceType: "tanker" as const })),
      ].filter((r) => r.currentL !== 0);
      if (allSources.length === 0) {
        toast.info("No readings to save");
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      for (const src of allSources) {
        const consumed = src.currentL - src.previousL;
        const res = await fetch("/api/v1/water-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilityId,
            sourceName: src.source,
            sourceType: src.sourceType,
            previousLiters: String(src.previousL),
            currentLiters: String(src.currentL),
            consumed: String(consumed),
            levelPercent: src.levelPercent ? String(src.levelPercent) : null,
            date: today,
          }),
        });
        if (!res.ok) throw new Error("Failed to save reading for " + src.source);
      }
      toast.success("Water readings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save water readings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionShell
      icon={Droplets}
      accent="sky"
      title="Water Readings"
      subtitle={`${waterTanks.length + waterBorewells.length + waterCavern.length + waterTanker.length} sources configured`}
      action={
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-9 text-[12px] px-4 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {saving ? "Saving..." : "Save Readings"}
        </Button>
      }
    >
      <div className="space-y-6">
        <WaterSubTable title="Tanks" rows={tanks} onChange={makeHandler(setTanks)} showLevelInput />
        <WaterSubTable title="Borewells" rows={borewells} onChange={makeHandler(setBorewells)} showLevelInput={false} />
        <WaterSubTable title="Cauvery Supply" rows={cavern} onChange={makeHandler(setCavern)} showLevelInput={false} />
        <WaterSubTable title="Tanker Supply" rows={tanker} onChange={makeHandler(setTanker)} showLevelInput={false} />
      </div>
    </SectionShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Water Quality
// ────────────────────────────────────────────────────────────────────────────

interface QualityField {
  type: "input" | "number" | "select";
  label: string;
  value: string | number;
  options?: string[];
  onChange: (v: string) => void;
}

function QualityCard({
  dot,
  title,
  fields,
}: {
  dot: string;
  title: string;
  fields: QualityField[][];
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <span className="text-[13px] font-semibold text-slate-800">{title}</span>
      </div>
      <div className="space-y-3">
        {fields.map((row, ri) => (
          <div key={ri} className={`grid gap-2.5 ${row.length === 2 ? "grid-cols-2" : "grid-cols-1"}`}>
            {row.map((f, fi) => (
              <div key={fi} className="space-y-1">
                <Label className="text-[10px] uppercase tracking-wide text-slate-400">{f.label}</Label>
                {f.type === "select" ? (
                  <Select value={String(f.value)} onValueChange={(v) => f.onChange(v ?? "")}>
                    <SelectTrigger className="h-9 text-[13px] rounded-lg bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(f.options ?? []).map((opt) => (
                        <SelectItem key={opt} value={opt} className="text-[12px]">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : "text"}
                    value={f.value || ""}
                    onChange={(e) => f.onChange(e.target.value)}
                    className="h-9 text-[13px] rounded-lg bg-white"
                    placeholder={f.type === "number" ? "0" : undefined}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function WaterQualitySection() {
  const [stpData, setStpData] = useState(waterQualityDefaults.stp);
  const [poolData, setPoolData] = useState(waterQualityDefaults.pool);
  const [roData, setRoData] = useState(waterQualityDefaults.ro);
  const [wtpData, setWtpData] = useState(waterQualityDefaults.wtp);

  const handleSave = () => {
    toast.success("Water quality data saved");
  };

  return (
    <SectionShell
      icon={FlaskConical}
      accent="teal"
      title="Water Quality"
      subtitle="STP, WTP, RO, Pool — daily tracking"
      action={
        <Button
          onClick={handleSave}
          className="h-9 text-[12px] px-4 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
        >
          <Save className="h-3.5 w-3.5" />
          Save Readings
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <QualityCard
          dot="bg-violet-500"
          title="STP Daily"
          fields={[
            [
              {
                type: "input",
                label: "MLSS (mg/L)",
                value: stpData.mlss,
                onChange: (v) => setStpData({ ...stpData, mlss: v }),
              },
            ],
            [
              {
                type: "select",
                label: "Backwash",
                value: stpData.backwash,
                options: ["OFF", "ON"],
                onChange: (v) => setStpData({ ...stpData, backwash: v }),
              },
              {
                type: "number",
                label: "Flow (KL)",
                value: stpData.flowKL || "",
                onChange: (v) => setStpData({ ...stpData, flowKL: Number(v) || 0 }),
              },
            ],
          ]}
        />

        <QualityCard
          dot="bg-sky-500"
          title="Swimming Pool"
          fields={[
            [
              {
                type: "input",
                label: "pH Level",
                value: poolData.phLevel,
                onChange: (v) => setPoolData({ ...poolData, phLevel: v }),
              },
              {
                type: "input",
                label: "Chlorine (ppm)",
                value: poolData.chlorine,
                onChange: (v) => setPoolData({ ...poolData, chlorine: v }),
              },
            ],
            [
              {
                type: "select",
                label: "Backwash",
                value: poolData.backwash,
                options: ["OFF", "ON"],
                onChange: (v) => setPoolData({ ...poolData, backwash: v }),
              },
              {
                type: "number",
                label: "Flow (KL)",
                value: poolData.flowKL || "",
                onChange: (v) => setPoolData({ ...poolData, flowKL: Number(v) || 0 }),
              },
            ],
          ]}
        />

        <QualityCard
          dot="bg-emerald-500"
          title="RO Plant"
          fields={[
            [
              {
                type: "input",
                label: "Input TDS",
                value: roData.inputTDS,
                onChange: (v) => setRoData({ ...roData, inputTDS: v }),
              },
              {
                type: "input",
                label: "Output TDS",
                value: roData.outputTDS,
                onChange: (v) => setRoData({ ...roData, outputTDS: v }),
              },
            ],
            [
              {
                type: "input",
                label: "Usage Pt Hardness",
                value: roData.usageHardness,
                onChange: (v) => setRoData({ ...roData, usageHardness: v }),
              },
            ],
            [
              {
                type: "select",
                label: "Regeneration",
                value: roData.regeneration,
                options: ["OFF", "ON"],
                onChange: (v) => setRoData({ ...roData, regeneration: v }),
              },
              {
                type: "number",
                label: "Regen Flow (KL)",
                value: roData.regenFlowKL || "",
                onChange: (v) => setRoData({ ...roData, regenFlowKL: Number(v) || 0 }),
              },
            ],
          ]}
        />

        <QualityCard
          dot="bg-amber-500"
          title="WTP Daily"
          fields={[
            [
              {
                type: "input",
                label: "Input Hardness",
                value: wtpData.inputHardness,
                onChange: (v) => setWtpData({ ...wtpData, inputHardness: v }),
              },
              {
                type: "input",
                label: "Output Hardness",
                value: wtpData.outputHardness,
                onChange: (v) => setWtpData({ ...wtpData, outputHardness: v }),
              },
            ],
            [
              {
                type: "input",
                label: "TDS (ppm)",
                value: wtpData.tdsPPM,
                onChange: (v) => setWtpData({ ...wtpData, tdsPPM: v }),
              },
              {
                type: "input",
                label: "Usage Pt Hardness",
                value: wtpData.usagePointHardness,
                onChange: (v) => setWtpData({ ...wtpData, usagePointHardness: v }),
              },
            ],
            [
              {
                type: "select",
                label: "Regeneration",
                value: wtpData.regeneration,
                options: ["OFF", "ON"],
                onChange: (v) => setWtpData({ ...wtpData, regeneration: v }),
              },
              {
                type: "number",
                label: "Regen Flow (KL)",
                value: wtpData.regenFlowKL || "",
                onChange: (v) => setWtpData({ ...wtpData, regenFlowKL: Number(v) || 0 }),
              },
            ],
          ]}
        />
      </div>
    </SectionShell>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────────

export function UpdateTab() {
  return (
    <div className="space-y-5">
      <PowerReadingsSection />
      <WaterReadingsSection />
      <WaterQualitySection />
    </div>
  );
}
