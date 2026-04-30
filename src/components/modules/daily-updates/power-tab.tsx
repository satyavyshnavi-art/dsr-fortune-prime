"use client";

import { useState, useMemo } from "react";
import { KPICard } from "@/components/shared/kpi-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Zap, Pencil, Trash2, ClipboardList, Save } from "lucide-react";
import { powerConsumptionData } from "./mock-data";

type ConsumptionRow = {
  date: string;
  meterId: string;
  location: string;
  previousReading: string;
  currentReading: string;
  unitsConsumed: string;
  mf: number;
  recordedAt: string;
};

// Add TEST 2 row to match screenshot
const initialData: ConsumptionRow[] = [
  {
    date: "27-Apr-26",
    meterId: "TEST 2",
    location: "Test",
    previousReading: "123456",
    currentReading: "234567",
    unitsConsumed: "111111.00 kWh",
    mf: 1,
    recordedAt: "10:09 PM",
  },
  ...powerConsumptionData,
];

export function PowerTab() {
  const [data, setData] = useState(initialData);
  const [meterFilter, setMeterFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("2026-03-30");
  const [dateTo, setDateTo] = useState("2026-04-29");

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    date: "",
    previousReading: "",
    currentReading: "",
    mf: "1",
  });

  const openEdit = (idx: number) => {
    const row = data[idx];
    setEditIdx(idx);
    setEditForm({
      date: "2026-04-27", // Convert to ISO for date input
      previousReading: row.previousReading.replace(/[^0-9.]/g, ""),
      currentReading: row.currentReading.replace(/[^0-9.]/g, ""),
      mf: String(row.mf),
    });
    setEditOpen(true);
  };

  const editUnits = useMemo(() => {
    const prev = parseFloat(editForm.previousReading) || 0;
    const curr = parseFloat(editForm.currentReading) || 0;
    const mf = parseFloat(editForm.mf) || 1;
    return ((curr - prev) * mf).toFixed(2);
  }, [editForm]);

  const handleUpdate = () => {
    if (editIdx === null) return;
    const prev = parseFloat(editForm.previousReading) || 0;
    const curr = parseFloat(editForm.currentReading) || 0;
    const mf = parseFloat(editForm.mf) || 1;
    const units = ((curr - prev) * mf).toFixed(2);
    setData((d) =>
      d.map((row, i) =>
        i === editIdx
          ? {
              ...row,
              previousReading: `${prev.toFixed(0)}`,
              currentReading: `${curr.toFixed(0)}`,
              mf: mf,
              unitsConsumed: `${units} kWh`,
            }
          : row
      )
    );
    setEditOpen(false);
    setEditIdx(null);
  };

  const handleDelete = (idx: number) => {
    setData((d) => d.filter((_, i) => i !== idx));
  };

  const totalConsumption = data.reduce((sum, r) => {
    const val = parseFloat(r.unitsConsumed.replace(/[^0-9.-]/g, "")) || 0;
    return sum + val;
  }, 0);

  const editRow = editIdx !== null ? data[editIdx] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-4 w-4 text-slate-600" />
          <h3 className="text-[15px] font-semibold text-slate-900">Daily Consumption Reports</h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={meterFilter}
            onChange={(e) => setMeterFilter(e.target.value)}
            className="h-8 rounded-lg border border-slate-200 bg-white px-3 text-[12px] min-w-[120px]"
          >
            <option value="all">All Meters</option>
            <option value="eb">EB Only</option>
            <option value="dg">DG Only</option>
          </select>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-8 text-[12px] w-[140px] rounded-lg"
          />
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-8 text-[12px] w-[140px] rounded-lg"
          />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Consumption" value={`${totalConsumption.toFixed(2)} kWh`} color="green" />
        <KPICard title="Average Daily" value={`${(totalConsumption / Math.max(data.length, 1)).toFixed(2)} kWh`} color="blue" />
        <KPICard title="Total Records" value={data.length} color="red" />
        <KPICard title="Active Meters" value={7} color="green" />
      </div>

      {/* Consumption Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="w-full table-fixed">
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "6%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "6%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Date</th>
              <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Meter ID</th>
              <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">Location</th>
              <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Previous</th>
              <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Current</th>
              <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Units Consumed</th>
              <th className="text-center py-3 px-3 text-[11px] font-medium text-slate-400">MF</th>
              <th className="text-right py-3 px-3 text-[11px] font-medium text-slate-400">Recorded At</th>
              <th className="text-center py-3 px-3 text-[11px] font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40">
                <td className="py-3.5 px-3 text-[13px] text-slate-800">{row.date}</td>
                <td className="py-3.5 px-3 text-[13px] text-slate-800 font-medium">{row.meterId}</td>
                <td className="py-3.5 px-3 text-[13px] text-slate-500 truncate">{row.location}</td>
                <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">{row.previousReading}</td>
                <td className="py-3.5 px-3 text-right text-[13px] text-slate-500">{row.currentReading}</td>
                <td className="py-3.5 px-3 text-right">
                  <span className="text-[13px] text-green-600 font-medium">{row.unitsConsumed}</span>
                </td>
                <td className="py-3.5 px-3 text-center text-[13px] text-slate-500">{row.mf}</td>
                <td className="py-3.5 px-3 text-right text-[13px] text-slate-400">{row.recordedAt}</td>
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => openEdit(idx)}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(idx)}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Consumption Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-[16px]">
              Edit Consumption - {editRow?.meterId}
            </DialogTitle>
          </DialogHeader>

          {editRow && (
            <div className="space-y-4 pt-2">
              {/* Meter info banner */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                <p className="text-[12px] text-blue-700">
                  Meter: <span className="font-semibold">{editRow.meterId}</span>
                  {" · "}Location: <span className="font-semibold">{editRow.location}</span>
                </p>
              </div>

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Date</Label>
                  <Input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                    className="h-9 text-[13px] rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Previous Reading (kWh)</Label>
                  <Input
                    type="number"
                    value={editForm.previousReading}
                    onChange={(e) => setEditForm({ ...editForm, previousReading: e.target.value })}
                    className="h-9 text-[13px] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Current Reading (kWh)</Label>
                  <Input
                    type="number"
                    value={editForm.currentReading}
                    onChange={(e) => setEditForm({ ...editForm, currentReading: e.target.value })}
                    className="h-9 text-[13px] rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">MF</Label>
                  <Input
                    type="number"
                    value={editForm.mf}
                    onChange={(e) => setEditForm({ ...editForm, mf: e.target.value })}
                    className="h-9 text-[13px] rounded-lg"
                  />
                </div>
              </div>

              {/* Live units calculation */}
              <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2.5">
                <p className="text-[13px] text-slate-700">
                  Units Consumed: <span className="font-bold text-green-700">{editUnits} kWh</span>
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="h-9 text-[13px] px-4 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdate}
                  className="h-9 text-[13px] px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Update Reading
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
