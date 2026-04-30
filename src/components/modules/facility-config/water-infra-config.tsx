"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge, KPICard } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Pencil,
  Trash2,
  Droplets,
  ChevronDown,
  ChevronUp,
  Container,
  Gauge,
  Activity,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface WaterInfraItem {
  id: string;
  sourceName: string;
  type: string;
  capacity: number;
  location: string;
  status: "active" | "inactive";
}

// Map DB row to component shape
function mapDbInfra(row: Record<string, unknown>): WaterInfraItem {
  return {
    id: row.id as string,
    sourceName: (row.sourceName as string) ?? "",
    type: (row.type as string) ?? "tank_overhead",
    capacity: Number(row.capacity) || 0,
    location: (row.location as string) ?? "",
    status: (row.status as "active" | "inactive") ?? "active",
  };
}

// Type-to-display label mapping
const typeLabels: Record<string, string> = {
  tank_overhead: "Overhead Tank",
  tank_underground: "Underground Tank",
  borewell: "Borewell",
  cavern: "Cavern / Municipal",
  tanker: "Tanker Supply",
};

// Mock data as fallback
const mockItems: WaterInfraItem[] = [
  { id: "1", sourceName: "Overhead Tank - Tower A", type: "tank_overhead", capacity: 1000, location: "Roof Top - Tower A", status: "active" },
  { id: "2", sourceName: "Overhead Tank - Tower B", type: "tank_overhead", capacity: 1000, location: "Roof Top - Tower B", status: "active" },
  { id: "3", sourceName: "Underground Tank - Main", type: "tank_underground", capacity: 2000, location: "Basement 1 - Main Building", status: "active" },
  { id: "4", sourceName: "BW-01", type: "borewell", capacity: 600, location: "Basement - East Side", status: "active" },
  { id: "5", sourceName: "BW-02", type: "borewell", capacity: 700, location: "Basement - West Side", status: "active" },
  { id: "6", sourceName: "Facility Supply", type: "cavern", capacity: 500, location: "", status: "active" },
  { id: "7", sourceName: "Tanker Supply", type: "tanker", capacity: 80, location: "", status: "active" },
];

function CollapsibleSection({
  title,
  children,
  onAdd,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 hover:text-slate-600"
        >
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
          {title}
        </button>
        <Button
          variant="ghost"
          className="h-7 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 px-2"
          onClick={onAdd}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
      {open && children}
    </div>
  );
}

function InfraCard({
  item,
  onEdit,
  onDelete,
}: {
  item: WaterInfraItem;
  onEdit: (i: WaterInfraItem) => void;
  onDelete: (i: WaterInfraItem) => void;
}) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-[12px] font-semibold text-slate-800">{item.sourceName}</h4>
          <StatusBadge status={item.status} />
        </div>
        <div className="space-y-0.5">
          {item.location && (
            <p className="text-[11px] text-slate-500">
              <span className="text-slate-400">Location:</span> {item.location}
            </p>
          )}
          <p className="text-[11px] text-slate-500">
            <span className="text-slate-400">Capacity:</span> {item.capacity} L
          </p>
          <p className="text-[11px] text-slate-500">
            <span className="text-slate-400">Type:</span> {typeLabels[item.type] ?? item.type}
          </p>
        </div>
        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => onEdit(item)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(item)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaterInfraConfig() {
  const [items, setItems] = useState<WaterInfraItem[]>(mockItems);
  const [loading, setLoading] = useState(true);

  // Add dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState("tank_overhead");
  const [addName, setAddName] = useState("");
  const [addLocation, setAddLocation] = useState("");
  const [addCapacity, setAddCapacity] = useState("");
  const [addErrors, setAddErrors] = useState<Record<string, boolean>>({});

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<WaterInfraItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editCapacity, setEditCapacity] = useState("");
  const [editType, setEditType] = useState("tank_overhead");

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<WaterInfraItem | null>(null);

  const fetchInfra = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/facilities/config/water-infra");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data.map(mapDbInfra));
      }
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfra();
  }, [fetchInfra]);

  const tanks = items.filter((i) => i.type === "tank_overhead" || i.type === "tank_underground");
  const borewells = items.filter((i) => i.type === "borewell");
  const caverns = items.filter((i) => i.type === "cavern");
  const tankers = items.filter((i) => i.type === "tanker");

  const totalTankCapacity = tanks.reduce((sum, t) => sum + t.capacity, 0);
  const activeTanks = tanks.filter((t) => t.status === "active").length;
  const activeBorewells = borewells.filter((b) => b.status === "active").length;

  const openAddForType = (type: string) => {
    setAddType(type);
    setAddName("");
    setAddLocation("");
    setAddCapacity("");
    setAddErrors({});
    setAddOpen(true);
  };

  const handleAdd = async () => {
    const errs: Record<string, boolean> = {};
    if (!addName.trim()) errs.name = true;
    setAddErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const body = {
      sourceName: addName,
      type: addType,
      capacity: addCapacity ? String(addCapacity) : null,
      location: addLocation || null,
      status: "active" as const,
    };

    try {
      const res = await fetch("/api/v1/facilities/config/water-infra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const created = await res.json();
      setItems((prev) => [...prev, mapDbInfra(created)]);
      toast.success("Water source added successfully");
    } catch {
      const localItem: WaterInfraItem = {
        id: `local-${Date.now()}`,
        sourceName: addName,
        type: addType,
        capacity: Number(addCapacity) || 0,
        location: addLocation,
        status: "active",
      };
      setItems((prev) => [...prev, localItem]);
      toast.success("Water source added (offline)");
    }

    setAddOpen(false);
  };

  const openEdit = (item: WaterInfraItem) => {
    setEditItem(item);
    setEditName(item.sourceName);
    setEditLocation(item.location);
    setEditCapacity(String(item.capacity));
    setEditType(item.type);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editItem) return;

    setItems((prev) =>
      prev.map((i) =>
        i.id === editItem.id
          ? { ...i, sourceName: editName, location: editLocation, capacity: Number(editCapacity) || 0, type: editType }
          : i
      )
    );
    setEditOpen(false);

    try {
      const res = await fetch(`/api/v1/facilities/config/water-infra/${editItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceName: editName,
          location: editLocation || null,
          capacity: editCapacity ? String(editCapacity) : null,
          type: editType,
        }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Water source updated");
    } catch {
      toast.success("Water source updated (offline)");
    }
  };

  const openDelete = (item: WaterInfraItem) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteItem) return;

    setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
    setDeleteOpen(false);

    try {
      const res = await fetch(`/api/v1/facilities/config/water-infra/${deleteItem.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Water source deleted");
    } catch {
      toast.success("Water source deleted (offline)");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-[13px] text-slate-500">Loading water infrastructure...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[13px] font-semibold text-slate-800">
        Water Infrastructure Configuration
      </h2>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Total Tank Capacity"
          value={`${totalTankCapacity.toLocaleString()} L`}
          icon={Droplets}
          color="blue"
        />
        <KPICard
          title="Active Tanks"
          value={`${activeTanks} / ${tanks.length}`}
          icon={Container}
          color="green"
        />
        <KPICard
          title="Active Borewells"
          value={`${activeBorewells} / ${borewells.length}`}
          icon={Gauge}
          color="blue"
        />
        <KPICard
          title="Overall Status"
          value="Active"
          icon={Activity}
          color="green"
        />
      </div>

      {/* Water Tanks */}
      <CollapsibleSection title="Water Tanks" onAdd={() => openAddForType("tank_overhead")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tanks.map((item) => (
            <InfraCard key={item.id} item={item} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Borewells */}
      <CollapsibleSection title="Borewells" onAdd={() => openAddForType("borewell")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {borewells.map((item) => (
            <InfraCard key={item.id} item={item} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Cavern / Municipal Supply */}
      <CollapsibleSection title="Cavern / Municipal Supply" onAdd={() => openAddForType("cavern")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {caverns.map((item) => (
            <InfraCard key={item.id} item={item} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Tanker Supply */}
      <CollapsibleSection title="Tanker Supply" onAdd={() => openAddForType("tanker")}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tankers.map((item) => (
            <InfraCard key={item.id} item={item} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      </CollapsibleSection>

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Add {typeLabels[addType] ?? "Water Source"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px]">Source Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Overhead Tank - Tower C"
                value={addName}
                onChange={(e) => { setAddName(e.target.value); setAddErrors((prev) => ({ ...prev, name: false })); }}
                className={`h-8 text-[12px] ${addErrors.name ? 'border-red-400 ring-1 ring-red-200' : ''}`}
              />
              {addErrors.name && <p className="text-[10px] text-red-500 mt-0.5">Source name is required</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Type</Label>
              <Select value={addType} onValueChange={(val) => { if (val) setAddType(val); }}>
                <SelectTrigger className="w-full h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tank_overhead" className="text-[12px]">Overhead Tank</SelectItem>
                  <SelectItem value="tank_underground" className="text-[12px]">Underground Tank</SelectItem>
                  <SelectItem value="borewell" className="text-[12px]">Borewell</SelectItem>
                  <SelectItem value="cavern" className="text-[12px]">Cavern / Municipal</SelectItem>
                  <SelectItem value="tanker" className="text-[12px]">Tanker Supply</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Location</Label>
              <Input
                placeholder="e.g. Roof Top - Tower C"
                value={addLocation}
                onChange={(e) => setAddLocation(e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Capacity (Liters)</Label>
              <Input
                placeholder="e.g. 1000"
                value={addCapacity}
                onChange={(e) => setAddCapacity(e.target.value)}
                className="h-8 text-[12px]"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-7 text-[11px]" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="h-7 text-[11px]" onClick={handleAdd}>Add Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Edit Water Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-[11px]">Source Name <span className="text-red-500">*</span></Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8 text-[12px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Type</Label>
              <Select value={editType} onValueChange={(val) => { if (val) setEditType(val); }}>
                <SelectTrigger className="w-full h-8 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tank_overhead" className="text-[12px]">Overhead Tank</SelectItem>
                  <SelectItem value="tank_underground" className="text-[12px]">Underground Tank</SelectItem>
                  <SelectItem value="borewell" className="text-[12px]">Borewell</SelectItem>
                  <SelectItem value="cavern" className="text-[12px]">Cavern / Municipal</SelectItem>
                  <SelectItem value="tanker" className="text-[12px]">Tanker Supply</SelectItem>
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
              <Label className="text-[11px]">Capacity (Liters)</Label>
              <Input
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                className="h-8 text-[12px]"
                type="number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-7 text-[11px]" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="h-7 text-[11px]" onClick={handleEdit}>Update Source</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Delete Water Source</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete <span className="font-semibold">{deleteItem?.sourceName}</span>? This action cannot be undone.
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
