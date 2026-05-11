"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Droplets, Save } from "lucide-react";
import {
  ebMeters,
  dgMeters,
  waterTanks,
  waterBorewells,
  waterCavern,
  waterTanker,
  waterQualityDefaults,
} from "./mock-data";

// ---------- Reusable Reading Table ----------

function ReadingTable({
  headers,
  children,
  colWidths,
}: {
  headers: { label: string; align?: "left" | "right" | "center" }[];
  children: React.ReactNode;
  colWidths?: string[];
}) {
  return (
    <table className="w-full table-fixed">
      {colWidths && (
        <colgroup>
          {colWidths.map((w, i) => (
            <col key={i} style={{ width: w }} />
          ))}
        </colgroup>
      )}
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th
              key={i}
              className={`pb-3 pt-1 text-[12px] font-normal text-slate-400 ${
                h.align === "right" ? "text-right" : h.align === "center" ? "text-center" : "text-left"
              }`}
            >
              {h.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">{children}</tbody>
    </table>
  );
}

// ---------- Power Readings ----------

function PowerReadingsSection() {
  const [ebData, setEbData] = useState(ebMeters);
  const [dgData, setDgData] = useState(dgMeters);
  const [facilityId, setFacilityId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/facilities")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFacilityId(data[0].id);
        }
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

  const meterHeaders = [
    { label: "Meter ID" },
    { label: "Location" },
    { label: "Previous (KWh)", align: "right" as const },
    { label: "Current (KWh)", align: "center" as const },
    { label: "MF", align: "center" as const },
    { label: "Units", align: "right" as const },
  ];
  const meterColWidths = ["15%", "30%", "18%", "14%", "12%", "11%"];

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Amber header band */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-50 to-amber-50/30 border-b border-amber-100/60">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-amber-100 p-2">
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">Power Readings</h3>
            <p className="text-[12px] text-slate-400">{ebMeters.length + dgMeters.length} meters configured</p>
          </div>
        </div>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-9 text-[13px] px-5 rounded-lg shadow-sm" onClick={async () => {
          if (!facilityId) {
            toast.error("Facility not loaded yet. Please try again.");
            return;
          }
          try {
            const allMeters = [...ebData, ...dgData].filter(m => m.currentKwh !== 0 && m.currentKwh !== null);
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
              if (!res.ok) {
                throw new Error("Failed to save reading for " + meter.meterId);
              }
            }
            toast.success("Power readings saved successfully");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save power readings");
          }
        }}>
          <Save className="h-3.5 w-3.5 mr-2" />
          Save Power
        </Button>
      </div>

      <div className="px-6 py-5">
        {/* EB Meters */}
        <h4 className="text-[13px] font-bold text-slate-900 mb-4">Energy Meters (EB)</h4>
        <ReadingTable headers={meterHeaders} colWidths={meterColWidths}>
          {ebData.map((meter, idx) => {
            const hasInput = meter.currentKwh !== 0 && meter.currentKwh !== null;
            const units = hasInput ? (meter.currentKwh - meter.previousKwh) * meter.mf : null;
            return (
              <tr key={meter.meterId}>
                <td className="py-3.5 text-[13px] font-semibold text-slate-900">{meter.meterId}</td>
                <td className="py-3.5 text-[13px] text-slate-500">{meter.location}</td>
                <td className="py-3.5 text-right text-[13px] text-slate-500">
                  {meter.previousKwh > 0 ? meter.previousKwh.toLocaleString() : "0"}
                </td>
                <td className="py-3.5">
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      value={meter.currentKwh || ""}
                      onChange={(e) => updateEB(idx, "currentKwh", e.target.value)}
                      className="w-[80px] text-center h-8 text-[13px] rounded-lg border-slate-200 bg-white shadow-none focus:bg-amber-50 focus:border-amber-300 focus:ring-amber-100"
                      placeholder="0"
                    />
                  </div>
                </td>
                <td className="py-3.5">
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      value={meter.mf}
                      onChange={(e) => updateEB(idx, "mf", e.target.value)}
                      className="w-[70px] text-center h-8 text-[13px] rounded-lg border-slate-200 bg-white shadow-none focus:bg-amber-50 focus:border-amber-300 focus:ring-amber-100"
                    />
                  </div>
                </td>
                <td className={`py-3.5 text-right text-[13px] font-semibold ${
                  units === null ? "text-slate-400" : units < 0 ? "text-red-500" : units > 0 ? "text-amber-600" : "text-slate-500"
                }`}>
                  {units !== null ? units.toFixed(1) : "-"}
                </td>
              </tr>
            );
          })}
        </ReadingTable>

        {/* DG */}
        <h4 className="text-[13px] font-bold text-slate-900 mt-8 mb-4">DG (Diesel Generator)</h4>
        <ReadingTable headers={meterHeaders} colWidths={meterColWidths}>
          {dgData.map((meter, idx) => {
            const hasInput = meter.currentKwh !== 0 && meter.currentKwh !== null;
            const units = hasInput ? (meter.currentKwh - meter.previousKwh) * meter.mf : null;
            return (
              <tr key={meter.meterId + idx}>
                <td className="py-3.5 text-[13px] font-semibold text-slate-900">{meter.meterId}</td>
                <td className="py-3.5 text-[13px] text-slate-500">{meter.location}</td>
                <td className="py-3.5 text-right text-[13px] text-slate-500">{meter.previousKwh}</td>
                <td className="py-3.5">
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      value={meter.currentKwh || ""}
                      onChange={(e) => updateDG(idx, "currentKwh", e.target.value)}
                      className="w-[80px] text-center h-8 text-[13px] rounded-lg border-slate-200 bg-white shadow-none focus:bg-amber-50 focus:border-amber-300 focus:ring-amber-100"
                      placeholder="0"
                    />
                  </div>
                </td>
                <td className="py-3.5">
                  <div className="flex justify-center">
                    <Input
                      type="number"
                      value={meter.mf}
                      onChange={(e) => updateDG(idx, "mf", e.target.value)}
                      className="w-[70px] text-center h-8 text-[13px] rounded-lg border-slate-200 bg-white shadow-none focus:bg-amber-50 focus:border-amber-300 focus:ring-amber-100"
                    />
                  </div>
                </td>
                <td className={`py-3.5 text-right text-[13px] font-semibold ${
                  units === null ? "text-slate-400" : units < 0 ? "text-red-500" : units > 0 ? "text-amber-600" : "text-slate-500"
                }`}>
                  {units !== null ? units.toFixed(1) : "-"}
                </td>
              </tr>
            );
          })}
        </ReadingTable>
      </div>
    </div>
  );
}

// ---------- Water Readings ----------

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
    <div className="mb-8 last:mb-0">
      <h4 className="text-[13px] font-bold text-slate-900 mb-3">{title}</h4>
      <table className="w-full table-fixed">
        <colgroup>
          <col className="w-[35%]" />
          <col className="w-[12%]" />
          <col className="w-[15%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead>
          <tr>
            <th className="pb-3 pt-1 text-[12px] font-normal text-slate-400 text-left">Source</th>
            <th className="pb-3 pt-1 text-[12px] font-normal text-slate-400 text-left">Type</th>
            <th className="pb-3 pt-1 text-[12px] font-normal text-slate-400 text-right">Previous (L)</th>
            <th className="pb-3 pt-1 text-[12px] font-normal text-slate-400 text-center">Current (L)</th>
            <th className="pb-3 pt-1 text-[12px] font-normal text-slate-400 text-center">Level %</th>
            <th className="pb-3 pt-1 text-[12px] font-normal text-slate-400 text-right">Consumed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => {
            const hasPrevious = row.previousL > 0;
            const hasCurrentInput = row.currentL !== 0;
            const consumed = hasCurrentInput && hasPrevious
              ? row.currentL - row.previousL
              : null;

            return (
              <tr key={row.source + idx}>
                <td className="py-3.5 text-[13px] text-slate-800">{row.source}</td>

                <td className="py-3.5">
                  <span className="inline-block rounded bg-blue-50 text-blue-500 text-[11px] font-medium px-2 py-0.5">
                    {row.type}
                  </span>
                </td>

                <td className="py-3.5 text-right text-[13px] text-slate-400">
                  {hasPrevious ? row.previousL.toLocaleString() : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>

                <td className="py-3.5">
                  <div className="flex justify-center">
                    {!hasPrevious && row.type === "tank" ? (
                      <span className="text-[12px] italic text-slate-300">Not tracked</span>
                    ) : (
                      <Input
                        type="number"
                        value={row.currentL || ""}
                        onChange={(e) => onChange(idx, "currentL", e.target.value)}
                        className="w-[80px] text-center h-8 text-[13px] rounded-lg border-slate-200 bg-white shadow-none focus:bg-blue-50 focus:border-blue-300 focus:ring-blue-100"
                        placeholder="0"
                      />
                    )}
                  </div>
                </td>

                <td className="py-3.5">
                  <div className="flex justify-center">
                    {showLevelInput ? (
                      <Input
                        type="number"
                        value={row.levelPercent || ""}
                        onChange={(e) => onChange(idx, "levelPercent", e.target.value)}
                        className="w-[70px] text-center h-8 text-[13px] rounded-lg border-slate-200 bg-white shadow-none focus:bg-blue-50 focus:border-blue-300 focus:ring-blue-100"
                        placeholder="%"
                      />
                    ) : (
                      <span className="text-[12px] italic text-slate-300">Not tracked</span>
                    )}
                  </div>
                </td>

                <td className={`py-3.5 text-right text-[13px] ${
                  consumed === null
                    ? "text-slate-400"
                    : consumed < 0
                    ? "text-red-500 font-semibold"
                    : "text-slate-600"
                }`}>
                  {consumed !== null ? `${consumed.toLocaleString()} L` : "- L"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function WaterReadingsSection() {
  const [tanks, setTanks] = useState(waterTanks);
  const [borewells, setBorewells] = useState(waterBorewells);
  const [cavern, setCavern] = useState(waterCavern);
  const [tanker, setTanker] = useState(waterTanker);
  const [facilityId, setFacilityId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/facilities")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFacilityId(data[0].id);
        }
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

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Blue header band */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-50/30 border-b border-blue-100/60">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Droplets className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-slate-900">Water Readings</h3>
            <p className="text-[12px] text-slate-400">
              {waterTanks.length + waterBorewells.length + waterCavern.length + waterTanker.length} sources configured
            </p>
          </div>
        </div>
        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-9 text-[13px] px-5 rounded-lg shadow-sm" onClick={async () => {
          if (!facilityId) {
            toast.error("Facility not loaded yet. Please try again.");
            return;
          }
          try {
            const allSources = [
              ...tanks.map(r => ({ ...r, sourceType: r.type === "tank" ? "tank_overhead" : "tank_underground" })),
              ...borewells.map(r => ({ ...r, sourceType: "borewell" as const })),
              ...cavern.map(r => ({ ...r, sourceType: "cauvery" as const })),
              ...tanker.map(r => ({ ...r, sourceType: "tanker" as const })),
            ].filter(r => r.currentL !== 0);
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
              if (!res.ok) {
                throw new Error("Failed to save reading for " + src.source);
              }
            }
            toast.success("Water readings saved successfully");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed to save water readings");
          }
        }}>
          <Save className="h-3.5 w-3.5 mr-2" />
          Save Water
        </Button>
      </div>

      <div className="px-6 py-5">
        <WaterSubTable title="Tanks" rows={tanks} onChange={makeHandler(setTanks)} showLevelInput={true} />
        <WaterSubTable title="Borewells" rows={borewells} onChange={makeHandler(setBorewells)} showLevelInput={false} />
        <WaterSubTable title="Cauvery Supply" rows={cavern} onChange={makeHandler(setCavern)} showLevelInput={false} />
        <WaterSubTable title="Tanker Supply" rows={tanker} onChange={makeHandler(setTanker)} showLevelInput={false} />
      </div>
    </div>
  );
}

// ---------- Water Quality ----------

function WaterQualitySection() {
  const [stpData, setStpData] = useState(waterQualityDefaults.stp);
  const [poolData, setPoolData] = useState(waterQualityDefaults.pool);
  const [roData, setRoData] = useState(waterQualityDefaults.ro);
  const [wtpData, setWtpData] = useState(waterQualityDefaults.wtp);

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Cyan header band */}
      <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-cyan-50 to-cyan-50/30 border-b border-cyan-100/60">
        <div className="rounded-full bg-cyan-100 p-2">
          <Droplets className="h-4 w-4 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-[14px] font-semibold text-slate-900">Water Quality - Daily Tracking</h3>
          <p className="text-[12px] text-slate-400">STP, WTP, RO, Pool</p>
        </div>
      </div>

      <div className="px-6 py-5 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* STP */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-[13px] font-semibold text-slate-900">STP Daily</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] px-3 rounded-lg" onClick={() => toast.success("STP data saved")}>
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">MLSS (mg/L)</label>
              <Input value={stpData.mlss} onChange={(e) => setStpData({ ...stpData, mlss: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Backwash</label>
                <select value={stpData.backwash} onChange={(e) => setStpData({ ...stpData, backwash: e.target.value })} className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] focus:bg-white focus:border-slate-300">
                  <option value="OFF">OFF</option><option value="ON">ON</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Flow (KL)</label>
                <Input type="number" value={stpData.flowKL || ""} onChange={(e) => setStpData({ ...stpData, flowKL: Number(e.target.value) })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* Pool */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-[13px] font-semibold text-slate-900">Swimming Pool</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] px-3 rounded-lg" onClick={() => toast.success("Pool data saved")}>
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">pH Level</label>
                <Input value={poolData.phLevel} onChange={(e) => setPoolData({ ...poolData, phLevel: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Chlorine (ppm)</label>
                <Input value={poolData.chlorine} onChange={(e) => setPoolData({ ...poolData, chlorine: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Backwash</label>
                <select value={poolData.backwash} onChange={(e) => setPoolData({ ...poolData, backwash: e.target.value })} className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] focus:bg-white focus:border-slate-300">
                  <option value="OFF">OFF</option><option value="ON">ON</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Flow (KL)</label>
                <Input type="number" value={poolData.flowKL || ""} onChange={(e) => setPoolData({ ...poolData, flowKL: Number(e.target.value) })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* RO */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <span className="text-[13px] font-semibold text-slate-900">RO Plant</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] px-3 rounded-lg" onClick={() => toast.success("RO data saved")}>
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Input TDS</label>
                <Input value={roData.inputTDS} onChange={(e) => setRoData({ ...roData, inputTDS: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Output TDS</label>
                <Input value={roData.outputTDS} onChange={(e) => setRoData({ ...roData, outputTDS: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 mb-1 block">Usage Pt Hardness</label>
              <Input value={roData.usageHardness} onChange={(e) => setRoData({ ...roData, usageHardness: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Regeneration</label>
                <select value={roData.regeneration} onChange={(e) => setRoData({ ...roData, regeneration: e.target.value })} className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] focus:bg-white focus:border-slate-300">
                  <option value="OFF">OFF</option><option value="ON">ON</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Regen Flow (KL)</label>
                <Input type="number" value={roData.regenFlowKL || ""} onChange={(e) => setRoData({ ...roData, regenFlowKL: Number(e.target.value) })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" placeholder="0" />
              </div>
            </div>
          </div>
        </div>

        {/* WTP */}
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
              <span className="text-[13px] font-semibold text-slate-900">WTP Daily</span>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px] px-3 rounded-lg" onClick={() => toast.success("WTP data saved")}>
              <Save className="h-3 w-3 mr-1" /> Save
            </Button>
          </div>
          <div className="space-y-3">
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Input Hardness</label>
                <Input value={wtpData.inputHardness} onChange={(e) => setWtpData({ ...wtpData, inputHardness: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Output Hardness</label>
                <Input value={wtpData.outputHardness} onChange={(e) => setWtpData({ ...wtpData, outputHardness: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">TDS (ppm)</label>
                <Input value={wtpData.tdsPPM} onChange={(e) => setWtpData({ ...wtpData, tdsPPM: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Usage Pt Hardness</label>
                <Input value={wtpData.usagePointHardness} onChange={(e) => setWtpData({ ...wtpData, usagePointHardness: e.target.value })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" />
              </div>
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Regeneration</label>
                <select value={wtpData.regeneration} onChange={(e) => setWtpData({ ...wtpData, regeneration: e.target.value })} className="flex h-9 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-[13px] focus:bg-white focus:border-slate-300">
                  <option value="OFF">OFF</option><option value="ON">ON</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-slate-400 mb-1 block">Regen Flow (KL)</label>
                <Input type="number" value={wtpData.regenFlowKL || ""} onChange={(e) => setWtpData({ ...wtpData, regenFlowKL: Number(e.target.value) })} className="h-9 text-[13px] rounded-xl border-slate-200 bg-slate-50/50 focus:bg-white" placeholder="0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Main ----------

export function UpdateTab() {
  return (
    <div className="space-y-5">
      <h3 className="text-[15px] font-semibold text-slate-900">Daily Updates</h3>
      <PowerReadingsSection />
      <WaterReadingsSection />
      <WaterQualitySection />
    </div>
  );
}
