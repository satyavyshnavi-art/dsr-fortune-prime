"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { KPICard } from "@/components/shared/kpi-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Droplets, Loader2, Plus, Pencil, Trash2 } from "lucide-react";

type WaterSubTab = "Daily Consumption" | "STP" | "Pool" | "RO" | "WTP";

type WaterRecord = {
  id: string;
  sourceName: string;
  sourceType: string;
  previousLiters: string;
  currentLiters: string;
  consumed: string;
  levelPercent: string | null;
  date: string;
  createdAt: string;
};

// Demo data shown when API returns empty
const demoWaterRecords: WaterRecord[] = [
  { id: "demo-1", sourceName: "Overhead Tank - Tower A", sourceType: "tank_overhead", previousLiters: "219057", currentLiters: "220450", consumed: "1393", levelPercent: "78.5", date: "2026-05-11", createdAt: "2026-05-11T09:00:00Z" },
  { id: "demo-2", sourceName: "Overhead Tank - Tower B", sourceType: "tank_overhead", previousLiters: "214664", currentLiters: "216120", consumed: "1456", levelPercent: "72.0", date: "2026-05-11", createdAt: "2026-05-11T09:05:00Z" },
  { id: "demo-3", sourceName: "Underground Tank - Main", sourceType: "tank_underground", previousLiters: "288037", currentLiters: "291500", consumed: "3463", levelPercent: "65.2", date: "2026-05-11", createdAt: "2026-05-11T09:10:00Z" },
  { id: "demo-4", sourceName: "BW-01", sourceType: "borewell", previousLiters: "127334", currentLiters: "128900", consumed: "1566", levelPercent: null, date: "2026-05-11", createdAt: "2026-05-11T08:30:00Z" },
  { id: "demo-5", sourceName: "BW-02", sourceType: "borewell", previousLiters: "119059", currentLiters: "120340", consumed: "1281", levelPercent: null, date: "2026-05-11", createdAt: "2026-05-11T08:35:00Z" },
  { id: "demo-6", sourceName: "Cauvery / Municipal Supply", sourceType: "cauvery", previousLiters: "102873", currentLiters: "105200", consumed: "2327", levelPercent: null, date: "2026-05-11", createdAt: "2026-05-11T07:00:00Z" },
  { id: "demo-7", sourceName: "Tanker Supply", sourceType: "tanker", previousLiters: "0", currentLiters: "12000", consumed: "12000", levelPercent: null, date: "2026-05-11", createdAt: "2026-05-11T10:00:00Z" },
  { id: "demo-8", sourceName: "Overhead Tank - Tower A", sourceType: "tank_overhead", previousLiters: "217600", currentLiters: "219057", consumed: "1457", levelPercent: "82.0", date: "2026-05-10", createdAt: "2026-05-10T09:00:00Z" },
  { id: "demo-9", sourceName: "Overhead Tank - Tower B", sourceType: "tank_overhead", previousLiters: "213100", currentLiters: "214664", consumed: "1564", levelPercent: "75.5", date: "2026-05-10", createdAt: "2026-05-10T09:05:00Z" },
  { id: "demo-10", sourceName: "Underground Tank - Main", sourceType: "tank_underground", previousLiters: "284800", currentLiters: "288037", consumed: "3237", levelPercent: "60.8", date: "2026-05-10", createdAt: "2026-05-10T09:10:00Z" },
  { id: "demo-11", sourceName: "BW-01", sourceType: "borewell", previousLiters: "125800", currentLiters: "127334", consumed: "1534", levelPercent: null, date: "2026-05-10", createdAt: "2026-05-10T08:30:00Z" },
  { id: "demo-12", sourceName: "Cauvery / Municipal Supply", sourceType: "cauvery", previousLiters: "100600", currentLiters: "102873", consumed: "2273", levelPercent: null, date: "2026-05-10", createdAt: "2026-05-10T07:00:00Z" },
  { id: "demo-13", sourceName: "Tanker Supply", sourceType: "tanker", previousLiters: "0", currentLiters: "10000", consumed: "10000", levelPercent: null, date: "2026-05-09", createdAt: "2026-05-09T11:00:00Z" },
  { id: "demo-14", sourceName: "Underground Tank - Main", sourceType: "tank_underground", previousLiters: "281200", currentLiters: "284800", consumed: "3600", levelPercent: "58.0", date: "2026-05-09", createdAt: "2026-05-09T09:10:00Z" },
  { id: "demo-15", sourceName: "BW-02", sourceType: "borewell", previousLiters: "117700", currentLiters: "119059", consumed: "1359", levelPercent: null, date: "2026-05-09", createdAt: "2026-05-09T08:35:00Z" },
];

const SOURCE_TYPE_OPTIONS = [
  { value: "tank_overhead", label: "Tank (Overhead)" },
  { value: "tank_underground", label: "Tank (Underground)" },
  { value: "borewell", label: "Borewell" },
  { value: "cauvery", label: "Cauvery" },
  { value: "tanker", label: "Tanker" },
];

const emptyForm = {
  sourceName: "",
  sourceType: "tank_overhead",
  previousLiters: "",
  currentLiters: "",
  levelPercent: "",
  date: new Date().toISOString().split("T")[0],
};

export function WaterTab() {
  const [activeSubTab, setActiveSubTab] = useState<WaterSubTab>("Daily Consumption");
  const [sourceType, setSourceType] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-11");
  const [records, setRecords] = useState<WaterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilityId, setFacilityId] = useState<string | null>(null);

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<WaterRecord | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const subTabs: WaterSubTab[] = ["Daily Consumption", "STP", "Pool", "RO", "WTP"];

  // Fetch facility
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

  // Fetch water readings from API
  const fetchWaterReadings = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/water-readings");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setRecords(data as WaterRecord[]);
      } else {
        // Use demo data when API returns empty
        setRecords(demoWaterRecords);
      }
    } catch {
      // Use demo data on error
      setRecords(demoWaterRecords);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWaterReadings();
  }, [fetchWaterReadings]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (sourceType !== "all" && !r.sourceType.toLowerCase().includes(sourceType)) return false;
      if (sourceFilter !== "all" && r.sourceName !== sourceFilter) return false;
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo && r.date > dateTo) return false;
      return true;
    });
  }, [records, sourceType, sourceFilter, dateFrom, dateTo]);

  // KPI computations
  const totalConsumed = useMemo(() => {
    return filteredRecords.reduce((sum, r) => sum + (parseFloat(r.consumed) || 0), 0);
  }, [filteredRecords]);

  const uniqueDates = useMemo(() => {
    return new Set(filteredRecords.map((r) => r.date)).size;
  }, [filteredRecords]);

  // Unique sources for filter
  const uniqueSources = useMemo(() => {
    return [...new Set(records.map((r) => r.sourceName))];
  }, [records]);

  const isDemo = (id: string) => id.startsWith("demo-");

  // Open add dialog
  const handleAdd = () => {
    setEditingRecord(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  // Open edit dialog
  const handleEdit = (record: WaterRecord) => {
    setEditingRecord(record);
    setForm({
      sourceName: record.sourceName,
      sourceType: record.sourceType,
      previousLiters: record.previousLiters,
      currentLiters: record.currentLiters,
      levelPercent: record.levelPercent || "",
      date: record.date,
    });
    setDialogOpen(true);
  };

  // Save (add or update)
  const handleSave = async () => {
    if (!form.sourceName || !form.currentLiters || !form.date) {
      toast.error("Please fill required fields: Source Name, Current Liters, Date");
      return;
    }

    const consumed = (parseFloat(form.currentLiters) || 0) - (parseFloat(form.previousLiters) || 0);

    if (editingRecord && isDemo(editingRecord.id)) {
      // Update demo record in local state
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? {
        ...r,
        sourceName: form.sourceName,
        sourceType: form.sourceType,
        previousLiters: form.previousLiters || "0",
        currentLiters: form.currentLiters,
        consumed: String(consumed),
        levelPercent: form.levelPercent || null,
        date: form.date,
      } : r));
      toast.success("Record updated");
      setDialogOpen(false);
      return;
    }

    setSaving(true);
    try {
      if (editingRecord) {
        // Update via API (PUT)
        const res = await fetch(`/api/v1/water-readings/${editingRecord.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilityId,
            sourceName: form.sourceName,
            sourceType: form.sourceType,
            previousLiters: form.previousLiters || "0",
            currentLiters: form.currentLiters,
            consumed: String(consumed),
            levelPercent: form.levelPercent || null,
            date: form.date,
          }),
        });
        if (!res.ok) throw new Error("Failed to update");
        toast.success("Record updated");
      } else {
        // Create via API (POST)
        const res = await fetch("/api/v1/water-readings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilityId,
            sourceName: form.sourceName,
            sourceType: form.sourceType,
            previousLiters: form.previousLiters || "0",
            currentLiters: form.currentLiters,
            consumed: String(consumed),
            levelPercent: form.levelPercent || null,
            date: form.date,
          }),
        });
        if (!res.ok) throw new Error("Failed to save");
        toast.success("Record added");
      }
      await fetchWaterReadings();
    } catch {
      // Fallback: add to local state
      const newRecord: WaterRecord = {
        id: `demo-${Date.now()}`,
        sourceName: form.sourceName,
        sourceType: form.sourceType,
        previousLiters: form.previousLiters || "0",
        currentLiters: form.currentLiters,
        consumed: String(consumed),
        levelPercent: form.levelPercent || null,
        date: form.date,
        createdAt: new Date().toISOString(),
      };
      if (editingRecord) {
        setRecords(prev => prev.map(r => r.id === editingRecord.id ? { ...newRecord, id: editingRecord.id } : r));
        toast.success("Record updated (local)");
      } else {
        setRecords(prev => [newRecord, ...prev]);
        toast.success("Record added (local)");
      }
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  // Delete
  const handleDelete = async (id: string) => {
    if (isDemo(id)) {
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success("Record deleted");
      setDeleteConfirmId(null);
      return;
    }

    try {
      const res = await fetch(`/api/v1/water-readings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Record deleted");
      await fetchWaterReadings();
    } catch {
      // Fallback: remove from local state
      setRecords(prev => prev.filter(r => r.id !== id));
      toast.success("Record deleted (local)");
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="flex items-center gap-0.5 border-b border-slate-200">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`px-3 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
              activeSubTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Records" value={filteredRecords.length} color="red" />
        <KPICard title="Total Consumed" value={`${totalConsumed.toLocaleString()} L`} color="green" />
        <KPICard title="Avg Daily" value={`${uniqueDates > 0 ? Math.round(totalConsumed / uniqueDates).toLocaleString() : "0"} L`} color="blue" />
        <KPICard title="Active Sources" value={uniqueSources.length || 9} color="green" />
      </div>

      {/* Content Area */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-slate-600" />
            <h4 className="text-[13px] font-semibold text-slate-800">Daily Water Consumption Tracking</h4>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleAdd} className="h-7 text-[12px] px-3 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Reading
            </Button>
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Source Types</option>
              <option value="tank">Tank</option>
              <option value="borewell">Borewell</option>
              <option value="cauvery">Cauvery</option>
              <option value="tanker">Tanker</option>
            </select>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-7 text-[12px] w-32"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-7 text-[12px] w-32"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="ml-2 text-[13px] text-slate-500">Loading water readings...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            icon={Droplets}
            title="No water consumption records found"
            description="Try adjusting your filters or date range"
          />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "11%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Date</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Source</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Type</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Previous (L)</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Current (L)</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Consumed (L)</th>
                  <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Level %</th>
                  <th className="text-center py-3 px-3 text-[11px] font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredRecords.map((r) => {
                  const consumed = parseFloat(r.consumed) || 0;
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/40 group">
                      <td className="py-3.5 px-3 text-[13px] text-slate-800">
                        {r.date ? new Date(r.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }) : ""}
                      </td>
                      <td className="py-3.5 px-3 text-[13px] text-slate-800 font-medium truncate">{r.sourceName}</td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block rounded bg-blue-50 text-blue-500 text-[11px] font-medium px-2 py-0.5">
                          {r.sourceType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">
                        {parseFloat(r.previousLiters || "0").toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">
                        {parseFloat(r.currentLiters || "0").toLocaleString()}
                      </td>
                      <td className={`py-3.5 px-3 text-right text-[13px] font-medium ${consumed < 0 ? "text-red-500" : "text-green-600"}`}>
                        {consumed.toLocaleString()} L
                      </td>
                      <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">
                        {r.levelPercent ? `${parseFloat(r.levelPercent).toFixed(1)}%` : "-"}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(r.id)}
                            className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingRecord ? "Edit Water Reading" : "Add Water Reading"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Source Name *</label>
              <Input
                value={form.sourceName}
                onChange={(e) => setForm(f => ({ ...f, sourceName: e.target.value }))}
                placeholder="e.g. Overhead Tank - Tower A"
                className="text-[13px]"
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Source Type *</label>
              <select
                value={form.sourceType}
                onChange={(e) => setForm(f => ({ ...f, sourceType: e.target.value }))}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-[13px]"
              >
                {SOURCE_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Previous (L)</label>
                <Input
                  type="number"
                  value={form.previousLiters}
                  onChange={(e) => setForm(f => ({ ...f, previousLiters: e.target.value }))}
                  placeholder="0"
                  className="text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Current (L) *</label>
                <Input
                  type="number"
                  value={form.currentLiters}
                  onChange={(e) => setForm(f => ({ ...f, currentLiters: e.target.value }))}
                  placeholder="0"
                  className="text-[13px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Level %</label>
                <Input
                  type="number"
                  value={form.levelPercent}
                  onChange={(e) => setForm(f => ({ ...f, levelPercent: e.target.value }))}
                  placeholder="Optional"
                  className="text-[13px]"
                />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Date *</label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))}
                  className="text-[13px]"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-[13px]">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingRecord ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Record</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-slate-600 py-2">
            Are you sure you want to delete this water reading? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="text-[13px]">
              Cancel
            </Button>
            <Button
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-red-600 hover:bg-red-700 text-white text-[13px]"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
