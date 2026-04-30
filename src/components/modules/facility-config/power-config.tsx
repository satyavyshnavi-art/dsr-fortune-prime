"use client";

import { useState } from "react";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
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
  {
    id: "1",
    meterId: "TEST 2",
    location: "Test",
    load: 120,
    totalUnits: 0,
    status: "active",
    type: "eb",
  },
  {
    id: "2",
    meterId: "TEST 1",
    location: "Block A",
    load: 0,
    totalUnits: 0,
    status: "active",
    type: "eb",
  },
  {
    id: "3",
    meterId: "GV-EM-002",
    location: "DG Incomer - LT Panel",
    load: 200,
    totalUnits: 0,
    status: "active",
    type: "eb",
  },
  {
    id: "4",
    meterId: "GV-EM-003",
    location: "Block B - LT Panel",
    load: 280,
    totalUnits: 0,
    status: "active",
    type: "eb",
  },
  {
    id: "5",
    meterId: "GV-EM-001",
    location: "Main Incomer - LT Panel - Block A",
    load: 350,
    totalUnits: 0,
    status: "active",
    type: "eb",
  },
];

const mockDGMeters: EnergyMeter[] = [
  {
    id: "6",
    meterId: "TEST",
    location: "basement",
    load: 0,
    totalUnits: 0,
    status: "active",
    type: "dg",
  },
  {
    id: "7",
    meterId: "TEST 01",
    location: "Basement",
    load: 0,
    totalUnits: 0,
    status: "active",
    type: "dg",
  },
];

function MeterCard({ meter }: { meter: EnergyMeter }) {
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
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
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
}: {
  title: string;
  count: number;
  meters: EnergyMeter[];
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
          <MeterCard key={meter.id} meter={meter} />
        ))}
      </div>
    </div>
  );
}

function AddMeterDialog() {
  const [open, setOpen] = useState(false);
  const [meterId, setMeterId] = useState("");
  const [location, setLocation] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function handleAdd() {
    const errs: Record<string, boolean> = {};
    if (!meterId.trim()) errs.meterId = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    toast.success("Meter added successfully");
    setMeterId("");
    setLocation("");
    setErrors({});
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add Energy Meter</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="space-y-1">
            <Label className="text-[11px]">Meter ID <span className="text-red-500">*</span></Label>
            <Input
              placeholder="e.g. GV-EM-004"
              value={meterId}
              onChange={(e) => { setMeterId(e.target.value); setErrors((prev) => ({ ...prev, meterId: false })); }}
              className={`h-8 text-[12px] ${errors.meterId ? 'border-red-400 ring-1 ring-red-200' : ''}`}
            />
            {errors.meterId && <p className="text-[10px] text-red-500 mt-0.5">Meter ID is required</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Location</Label>
            <Input
              placeholder="e.g. Block C - LT Panel"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-8 text-[12px]"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" className="h-7 text-[11px]" />}>Cancel</DialogClose>
          <Button className="h-7 text-[11px]" onClick={handleAdd}>Add Meter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function PowerConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-slate-800">Energy Meters</h2>
        <AddMeterDialog />
      </div>

      <MeterSection
        title="Energy Meters (EB)"
        count={mockEBMeters.length}
        meters={mockEBMeters}
      />

      <MeterSection
        title="DG (Diesel Generator)"
        count={mockDGMeters.length}
        meters={mockDGMeters}
      />
    </div>
  );
}
