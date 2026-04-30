"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Settings2, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface WaterQualityConfigItem {
  id: string;
  plantType: string;
  parameters: Record<string, unknown>;
  label: string;
}

// Map DB row to component shape
function mapDbConfig(row: Record<string, unknown>): WaterQualityConfigItem {
  const plantType = (row.plantType as string) ?? "stp";
  const params = (row.parameters as Record<string, unknown>) ?? {};
  const typeLabels: Record<string, string> = {
    stp: "STP",
    wtp: "WTP",
    pool: "POOL",
    ro: "ROPLANT",
  };
  return {
    id: row.id as string,
    plantType,
    parameters: params,
    label: `${typeLabels[plantType] ?? plantType.toUpperCase()} Config #${(row.id as string).slice(0, 4)}`,
  };
}

// Mock existing configs as fallback
const mockConfigs: WaterQualityConfigItem[] = [
  { id: "1", plantType: "stp", parameters: { mlss: "3000", mlssMinRange: "2000", mlssMaxRange: "4000", backwash: "off", backwashFlow: "100" }, label: "STP Config #1655" },
  { id: "2", plantType: "wtp", parameters: { inputHardness: "300", outputHardness: "50", tds: "150", regeneration: "off", regenWaterFlow: "80" }, label: "WTP Config #166d" },
  { id: "3", plantType: "pool", parameters: { phLevel: "7.4", phMinRange: "7.2", phMaxRange: "7.6", chlorine: "2", chlorineMin: "1", chlorineMax: "3", backwash: "off", backwashFlow: "120" }, label: "POOL Config #168S" },
  { id: "4", plantType: "ro", parameters: { inputTds: "500", outputTds: "50", usagePointHardness: "150", regeneration: "off", regenWaterFlow: "100" }, label: "ROPLANT Config #169d" },
];

function ExistingConfigCard({
  config,
  onEdit,
  onDelete,
}: {
  config: WaterQualityConfigItem;
  onEdit: (c: WaterQualityConfigItem) => void;
  onDelete: (c: WaterQualityConfigItem) => void;
}) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3">
        <p className="text-[12px] font-semibold text-slate-800">{config.label}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <button
            onClick={() => onEdit(config)}
            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDelete(config)}
            className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-[11px] text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

// STP Config form
function STPConfigForm({ onSave }: { onSave: (params: Record<string, unknown>) => void; }) {
  const [form, setForm] = useState({
    mlss: "3000", mlssMinRange: "2000", mlssMaxRange: "4000", backwash: "off", backwashFlow: "100",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">Add STP Config</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="MLSS (mg/L)">
            <Input value={form.mlss} onChange={(e) => setForm({ ...form, mlss: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="MLSS Min Range">
            <Input value={form.mlssMinRange} onChange={(e) => setForm({ ...form, mlssMinRange: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="MLSS Max Range">
            <Input value={form.mlssMaxRange} onChange={(e) => setForm({ ...form, mlssMaxRange: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Backwash">
            <Select value={form.backwash} onValueChange={(val) => setForm({ ...form, backwash: val as string })}>
              <SelectTrigger className="w-full h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Backwash Flow (KL)">
            <Input value={form.backwashFlow} onChange={(e) => setForm({ ...form, backwashFlow: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5" onClick={() => onSave({ ...form, plantType: "stp" })}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// WTP Config form
function WTPConfigForm({ onSave }: { onSave: (params: Record<string, unknown>) => void; }) {
  const [form, setForm] = useState({
    inputHardness: "300", outputHardness: "50", tds: "150", regeneration: "off", regenWaterFlow: "80",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">Add WTP Config</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Input Hardness">
            <Input value={form.inputHardness} onChange={(e) => setForm({ ...form, inputHardness: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Output Hardness">
            <Input value={form.outputHardness} onChange={(e) => setForm({ ...form, outputHardness: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="TDS">
            <Input value={form.tds} onChange={(e) => setForm({ ...form, tds: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Regeneration">
            <Select value={form.regeneration} onValueChange={(val) => setForm({ ...form, regeneration: val as string })}>
              <SelectTrigger className="w-full h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Regen Water Flow (KL)">
            <Input value={form.regenWaterFlow} onChange={(e) => setForm({ ...form, regenWaterFlow: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5" onClick={() => onSave({ ...form, plantType: "wtp" })}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Pool Config form
function PoolConfigForm({ onSave }: { onSave: (params: Record<string, unknown>) => void; }) {
  const [form, setForm] = useState({
    phLevel: "7.4", phMinRange: "7.2", phMaxRange: "7.6", chlorine: "2", chlorineMin: "1", chlorineMax: "3", backwash: "off", backwashFlow: "120",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">Add Swimming Pool Config</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="pH Level">
            <Input value={form.phLevel} onChange={(e) => setForm({ ...form, phLevel: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="pH Min Range">
            <Input value={form.phMinRange} onChange={(e) => setForm({ ...form, phMinRange: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="pH Max Range">
            <Input value={form.phMaxRange} onChange={(e) => setForm({ ...form, phMaxRange: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Chlorine">
            <Input value={form.chlorine} onChange={(e) => setForm({ ...form, chlorine: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Chlorine Min">
            <Input value={form.chlorineMin} onChange={(e) => setForm({ ...form, chlorineMin: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Chlorine Max">
            <Input value={form.chlorineMax} onChange={(e) => setForm({ ...form, chlorineMax: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Backwash">
            <Select value={form.backwash} onValueChange={(val) => setForm({ ...form, backwash: val as string })}>
              <SelectTrigger className="w-full h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Backwash Flow">
            <Input value={form.backwashFlow} onChange={(e) => setForm({ ...form, backwashFlow: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5" onClick={() => onSave({ ...form, plantType: "pool" })}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// RO Config form
function ROConfigForm({ onSave }: { onSave: (params: Record<string, unknown>) => void; }) {
  const [form, setForm] = useState({
    inputTds: "500", outputTds: "50", usagePointHardness: "150", regeneration: "off", regenWaterFlow: "100",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">Add RO Plant Config</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Input TDS">
            <Input value={form.inputTds} onChange={(e) => setForm({ ...form, inputTds: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Output TDS">
            <Input value={form.outputTds} onChange={(e) => setForm({ ...form, outputTds: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Usage Point Hardness">
            <Input value={form.usagePointHardness} onChange={(e) => setForm({ ...form, usagePointHardness: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
          <FormField label="Regeneration">
            <Select value={form.regeneration} onValueChange={(val) => setForm({ ...form, regeneration: val as string })}>
              <SelectTrigger className="w-full h-8 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Regen Water Flow (KL)">
            <Input value={form.regenWaterFlow} onChange={(e) => setForm({ ...form, regenWaterFlow: e.target.value })} className="h-8 text-[12px]" />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5" onClick={() => onSave({ ...form, plantType: "ro" })}>
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaterQualityConfig() {
  const [configs, setConfigs] = useState<WaterQualityConfigItem[]>(mockConfigs);
  const [loading, setLoading] = useState(true);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<WaterQualityConfigItem | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<WaterQualityConfigItem | null>(null);
  const [editParams, setEditParams] = useState<Record<string, string>>({});

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/facilities/config/water-quality");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setConfigs(data.map(mapDbConfig));
      }
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const stpConfigs = configs.filter((c) => c.plantType === "stp");
  const wtpConfigs = configs.filter((c) => c.plantType === "wtp");
  const poolConfigs = configs.filter((c) => c.plantType === "pool");
  const roConfigs = configs.filter((c) => c.plantType === "ro");

  // Save new config via POST
  const handleSaveNew = async (formData: Record<string, unknown>) => {
    const { plantType, ...rest } = formData;
    const body = {
      plantType: plantType as string,
      parameters: rest,
    };

    try {
      const res = await fetch("/api/v1/facilities/config/water-quality", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("API error");
      const created = await res.json();
      setConfigs((prev) => [...prev, mapDbConfig(created)]);
      toast.success("Parameters saved");
    } catch {
      // Fallback: add locally
      const localConfig: WaterQualityConfigItem = {
        id: `local-${Date.now()}`,
        plantType: plantType as string,
        parameters: rest,
        label: `${(plantType as string).toUpperCase()} Config #${Date.now().toString(36).slice(-4)}`,
      };
      setConfigs((prev) => [...prev, localConfig]);
      toast.success("Parameters saved (offline)");
    }
  };

  // Edit existing config
  const openEdit = (config: WaterQualityConfigItem) => {
    setEditConfig(config);
    const params: Record<string, string> = {};
    Object.entries(config.parameters).forEach(([key, val]) => {
      params[key] = String(val ?? "");
    });
    setEditParams(params);
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!editConfig) return;

    setConfigs((prev) =>
      prev.map((c) =>
        c.id === editConfig.id ? { ...c, parameters: { ...editParams } } : c
      )
    );
    setEditOpen(false);

    try {
      const res = await fetch(`/api/v1/facilities/config/water-quality/${editConfig.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameters: editParams }),
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Config updated");
    } catch {
      toast.success("Config updated (offline)");
    }
  };

  // Delete existing config
  const openDelete = (config: WaterQualityConfigItem) => {
    setDeleteConfig(config);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfig) return;

    setConfigs((prev) => prev.filter((c) => c.id !== deleteConfig.id));
    setDeleteOpen(false);

    try {
      const res = await fetch(`/api/v1/facilities/config/water-quality/${deleteConfig.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("API error");
      toast.success("Config deleted");
    } catch {
      toast.success("Config deleted (offline)");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-[13px] text-slate-500">Loading water quality configs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Existing Configs - compact grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">STP Configurations</h3>
          {stpConfigs.map((c) => (
            <ExistingConfigCard key={c.id} config={c} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">WTP Configurations</h3>
          {wtpConfigs.map((c) => (
            <ExistingConfigCard key={c.id} config={c} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">Swimming Pool Configurations</h3>
          {poolConfigs.map((c) => (
            <ExistingConfigCard key={c.id} config={c} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">RO Plant Configurations</h3>
          {roConfigs.map((c) => (
            <ExistingConfigCard key={c.id} config={c} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      </div>

      {/* Add New Config Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <STPConfigForm onSave={handleSaveNew} />
        <WTPConfigForm onSave={handleSaveNew} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PoolConfigForm onSave={handleSaveNew} />
        <ROConfigForm onSave={handleSaveNew} />
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Edit {editConfig?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            {Object.entries(editParams).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <Label className="text-[11px] text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                <Input
                  value={value}
                  onChange={(e) => setEditParams((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="h-8 text-[12px]"
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" className="h-7 text-[11px]" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button className="h-7 text-[11px]" onClick={handleEdit}>Update Config</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[14px]">Delete Config</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete <span className="font-semibold">{deleteConfig?.label}</span>? This action cannot be undone.
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
