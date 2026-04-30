"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EnergyMeter {
  id: string;
  meterId: string;
  location: string;
  load: number;
  totalUnits: number;
  status: "active" | "inactive";
  type: "eb" | "dg";
}

const mockEBMeters: EnergyMeter[] = [
  { id: "1", meterId: "TEST 2", location: "Test", load: 120, totalUnits: 0, status: "active", type: "eb" },
  { id: "2", meterId: "TEST 1", location: "Block A", load: 0, totalUnits: 0, status: "active", type: "eb" },
  { id: "3", meterId: "GV-EM-002", location: "DG Incomer - LT Panel", load: 200, totalUnits: 0, status: "active", type: "eb" },
  { id: "4", meterId: "GV-EM-003", location: "Block B - LT Panel", load: 280, totalUnits: 0, status: "active", type: "eb" },
  { id: "5", meterId: "GV-EM-001", location: "Main Incomer - LT Panel - Block A", load: 350, totalUnits: 0, status: "active", type: "eb" },
];

const mockDGMeters: EnergyMeter[] = [
  { id: "6", meterId: "TEST", location: "basement", load: 0, totalUnits: 0, status: "active", type: "dg" },
  { id: "7", meterId: "TEST 01", location: "Basement", load: 0, totalUnits: 0, status: "active", type: "dg" },
];

// Map DB row to component shape
function mapDbMeter(row: Record<string, unknown>): EnergyMeter {
  return {
    id: row.id as string,
    meterId: (row.meterIdLabel as string) ?? "",
    location: (row.location as string) ?? "",
    load: Number(row.load) || 0,
    totalUnits: Number(row.totalUnits) || 0,
    status: (row.status as "active" | "inactive") ?? "active",
    type: (row.type as "eb" | "dg") ?? "eb",
  };
}

function MeterCard({
  meter,
  onEdit,
  onDelete,
}: {
  meter: EnergyMeter;
  onEdit: (m: EnergyMeter) => void;
  onDelete: (m: EnergyMeter) => void;
}) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-[12px] font-semibold text-slate-800">
            Meter ID: {meter.meterId}
          </h4>
          <StatusBadge status={meter.status} />
        </div>

        <div className="space-y-0.5">
          <p className="text-[11px] text-slate-500">
            <span className="text-slate-400">Location:</span> {meter.location}
          </p>
          <p className="text-[11px] text-slate-500">
            <span className="text-slate-400">Load:</span> {meter.load} kW
          </p>
          <p className="text-[11px] text-slate-500">
            <span className="text-slate-400">Total Units:</span>{" "}
            {meter.totalUnits} kWh
          </p>
        </div>

        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => onEdit(meter)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(meter)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function MeterSection({
  title,
  count,
  meters,
  onEdit,
  onDelete,
}: {
  title: string;
  count: number;
  meters: EnergyMeter[];
  onEdit: (m: EnergyMeter) => void;
  onDelete: (m: EnergyMeter) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-[13px] font-semibold text-slate-800">{title}</h3>
        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0 h-[18px] leading-[18px] rounded-full inline-flex items-center">
          {count}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {meters.map((meter) => (
          <MeterCard key={meter.id} meter={meter} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

export function PowerConfig() {
  const [meters, setMeters] = useState<EnergyMeter[]>([...mockEBMeters, ...mockDGMeters]);
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addMeterId, setAddMeterId] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addLoad, setAddLoad] = useState("");
  const [addType, setAddType] = useState<"eb" | "dg">("eb");
  const [addErrors, setAddErrors] = useState<Record<string, boolean>>({});

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editMeter, setEditMeter] = useState<EnergyMeter | null>(null);
  const [editMeterId, setEditMeterId] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editLoad, setEditLoad] = useState("");
  const [editType, setEditType] = useState<"eb" | "dg">("eb");
  const [editErrors, setEditErrors] = useState<Record<string, boolean>>({});

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteMeter, setDeleteMeter] = useState<EnergyMeter | null>(null);

  const fetchMeters = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/facilities/config/energy-meters");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setMeters(data.map(mapDbMeter));
      }
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeters();
  }, [fetchMeters]);

  const ebMeters = meters.filter((m) => m.type === "eb");
  const dgMeters = meters.filter((m) => m.type === "dg");

  // Add meter
  const handleAdd = async () => {
    const errs: Record<string, boolean> = {};
    if (!addMeterId.trim()) errs.meterId = true;
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body = {
      meterIdLabel: addMeterId,
      type: addType,
      location: addLocation || null,
      load: addLoad ? String(addLoad) : null,
      status: "active" as const,
    };

    try {
      const res = await fetch("/api/v1/facilities/config/energy-meters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const created = await res.json();
      setMeters((prev) => [...prev, mapDbMeter(created)]);
      toast.success("Meter added successfully");
    } catch {
      // Fallback: add locally
      const localMeter: EnergyMeter = {
        id: `local-${Date.now()}`,
        meterId: addMeterId,
        location: addLocation,
        load: Number(addLoad) || 0,
        totalUnits: 0,
        status: "active",
        type: addType,
      };
      setMeters((prev) => [...prev, localMeter]);
      toast.success("Meter added (offline)");
    }

    setAddMeterId("");
    setAddLocation("");
    setAddLoad("");
    setAddType("eb");
    setAddErrors({});
    setAddOpen(false);
  };

  // Edit meter
  const openEdit = (m: EnergyMeter) => {
    setEditMeter(m);
    setEditMeterId(m.meterId);
    setEditLocation(m.location);
    setEditLoad(String(m.load));
    setEditType(m.type);
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editMeter) return;
    const errs: Record<string, boolean> = {};
    if (!editMeterId.trim()) errs.meterId = true;
    setEditErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Optimistic update
    setMeters((prev) =>
      prev.map((m) =>
        m.id === editMeter.id
          ? { ...m, meterId: editMeterId, location: editLocation, load: Number(editLoad) || 0, type: editType }
          : m
      )
    );
    setEditOpen(false);

    try {
      const res = await fetch(`/api/v1/facilities/config/energy-meters/${editMeter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meterIdLabel: editMeterId,
          location: editLocation || null,
          load: editLoad ? String(editLoad) : null,
          type: editType,
        }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Meter updated successfully");
    } catch {
      toast.success("Meter updated (offline)");
    }
  };

  // Delete meter
  const openDelete = (m: EnergyMeter) => {
    setDeleteMeter(m);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteMeter) return;

    // Optimistic update
    setMeters((prev) => prev.filter((m) => m.id !== deleteMeter.id));
    setDeleteOpen(false);

    try {
      const res = await fetch(`/api/v1/facilities/config/energy-meters/${deleteMeter.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Meter deleted");
    } catch {
      toast.success("Meter deleted (offline)");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-[13px] text-slate-500">Loading energy meters...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-slate-800">Energy Meters</h2>
        <Button
          className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      <MeterSection
        title="Energy Meters (EB)"
        count={ebMeters.length}
        meters={ebMeters}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      <MeterSection
        title="DG (Diesel Generator)"
        count={dgMeters.length}
        meters={dgMeters}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* Add Meter Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Add Energy Meter</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px]">Meter ID <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. GV-EM-004"
                value={addMeterId}
                onChange={(e) => { setAddMeterId(e.target.value); setAddErrors((prev) => ({ ...prev, meterId: false })); }}
                className={`h-8 text-[12px] ${addErrors.meterId ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {addErrors.meterId && <p className="text-[10px] text-red-500 mt-0.5">Meter ID is required</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Type</Label>
              <Select value={addType} onValueChange={(val) => setAddType(val as "eb" | "dg")}>
                <SelectTrigger className="w-full h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eb" className="text-[12px]">EB (Energy Board)</SelectItem>
                  <SelectItem value="dg" className="text-[12px]">DG (Diesel Generator)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Location</Label>
              <Input
                placeholder="e.g. Block C - LT Panel"
                value={addLocation}
                onChange={(e) => setAddLocation(e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Load (kW)</Label>
              <Input
                placeholder="e.g. 350"
                value={addLoad}
                onChange={(e) => setAddLoad(e.target.value)}
                className="h-8 text-[12px]"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="h-7 text-[11px]" />}>Cancel</DialogClose>
            <Button className="h-7 text-[11px]" onClick={handleAdd}>Add Meter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Meter Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Edit Energy Meter</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px]">Meter ID <span className="text-red-500">*</span></Label>
              <Input
                value={editMeterId}
                onChange={(e) => { setEditMeterId(e.target.value); setEditErrors((prev) => ({ ...prev, meterId: false })); }}
                className={`h-8 text-[12px] ${editErrors.meterId ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {editErrors.meterId && <p className="text-[10px] text-red-500 mt-0.5">Meter ID is required</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Type</Label>
              <Select value={editType} onValueChange={(val) => setEditType(val as "eb" | "dg")}>
                <SelectTrigger className="w-full h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eb" className="text-[12px]">EB (Energy Board)</SelectItem>
                  <SelectItem value="dg" className="text-[12px]">DG (Diesel Generator)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Location</Label>
              <Input
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Load (kW)</Label>
              <Input
                value={editLoad}
                onChange={(e) => setEditLoad(e.target.value)}
                className="h-8 text-[12px]"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-7 text-[11px]" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="h-7 text-[11px]" onClick={handleEdit}>Update Meter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Delete Meter</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete meter <span className="font-semibold">{deleteMeter?.meterId}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="h-7 text-[11px]">Cancel</Button>
              <Button onClick={handleDelete} className="h-7 text-[11px] bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
