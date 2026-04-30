"use client";

import { useState } from "react";
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
import { Pencil, Trash2, Settings2, Save } from "lucide-react";

interface ExistingConfig {
  id: string;
  label: string;
}

interface STPFormData {
  mlss: string;
  mlssMinRange: string;
  mlssMaxRange: string;
  backwash: string;
  backwashFlow: string;
}

interface WTPFormData {
  inputHardness: string;
  outputHardness: string;
  tds: string;
  regeneration: string;
  regenWaterFlow: string;
}

interface PoolFormData {
  phLevel: string;
  phMinRange: string;
  phMaxRange: string;
  chlorine: string;
  chlorineMin: string;
  chlorineMax: string;
  backwash: string;
  backwashFlow: string;
}

interface ROFormData {
  inputTds: string;
  outputTds: string;
  usagePointHardness: string;
  regeneration: string;
  regenWaterFlow: string;
}

const existingSTP: ExistingConfig[] = [{ id: "1", label: "STP Config #1655" }];
const existingWTP: ExistingConfig[] = [{ id: "2", label: "WTP Config #166d" }];
const existingPool: ExistingConfig[] = [
  { id: "3", label: "POOL Config #168S" },
];
const existingRO: ExistingConfig[] = [
  { id: "4", label: "ROPLANT Config #169d" },
];

function ExistingConfigCard({ config }: { config: ExistingConfig }) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3">
        <p className="text-[12px] font-semibold text-slate-800">{config.label}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors">
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

function STPConfigForm() {
  const [form, setForm] = useState<STPFormData>({
    mlss: "3000",
    mlssMinRange: "2000",
    mlssMaxRange: "4000",
    backwash: "off",
    backwashFlow: "100",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">
            Add STP Config
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="MLSS (mg/L)">
            <Input
              value={form.mlss}
              onChange={(e) => setForm({ ...form, mlss: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="MLSS Min Range">
            <Input
              value={form.mlssMinRange}
              onChange={(e) => setForm({ ...form, mlssMinRange: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="MLSS Max Range">
            <Input
              value={form.mlssMaxRange}
              onChange={(e) => setForm({ ...form, mlssMaxRange: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Backwash">
            <Select
              value={form.backwash}
              onValueChange={(val) => setForm({ ...form, backwash: val as string })}
            >
              <SelectTrigger className="w-full h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Backwash Flow (KL)">
            <Input
              value={form.backwashFlow}
              onChange={(e) => setForm({ ...form, backwashFlow: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WTPConfigForm() {
  const [form, setForm] = useState<WTPFormData>({
    inputHardness: "300",
    outputHardness: "50",
    tds: "150",
    regeneration: "off",
    regenWaterFlow: "80",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">
            Add WTP Config
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Input Hardness">
            <Input
              value={form.inputHardness}
              onChange={(e) => setForm({ ...form, inputHardness: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Output Hardness">
            <Input
              value={form.outputHardness}
              onChange={(e) => setForm({ ...form, outputHardness: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="TDS">
            <Input
              value={form.tds}
              onChange={(e) => setForm({ ...form, tds: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Regeneration">
            <Select
              value={form.regeneration}
              onValueChange={(val) => setForm({ ...form, regeneration: val as string })}
            >
              <SelectTrigger className="w-full h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Regen Water Flow (KL)">
            <Input
              value={form.regenWaterFlow}
              onChange={(e) => setForm({ ...form, regenWaterFlow: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PoolConfigForm() {
  const [form, setForm] = useState<PoolFormData>({
    phLevel: "7.4",
    phMinRange: "7.2",
    phMaxRange: "7.6",
    chlorine: "2",
    chlorineMin: "1",
    chlorineMax: "3",
    backwash: "off",
    backwashFlow: "120",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">
            Add Swimming Pool Config
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="pH Level">
            <Input
              value={form.phLevel}
              onChange={(e) => setForm({ ...form, phLevel: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="pH Min Range">
            <Input
              value={form.phMinRange}
              onChange={(e) => setForm({ ...form, phMinRange: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="pH Max Range">
            <Input
              value={form.phMaxRange}
              onChange={(e) => setForm({ ...form, phMaxRange: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Chlorine">
            <Input
              value={form.chlorine}
              onChange={(e) => setForm({ ...form, chlorine: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Chlorine Min">
            <Input
              value={form.chlorineMin}
              onChange={(e) => setForm({ ...form, chlorineMin: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Chlorine Max">
            <Input
              value={form.chlorineMax}
              onChange={(e) => setForm({ ...form, chlorineMax: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Backwash">
            <Select
              value={form.backwash}
              onValueChange={(val) => setForm({ ...form, backwash: val as string })}
            >
              <SelectTrigger className="w-full h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Backwash Flow">
            <Input
              value={form.backwashFlow}
              onChange={(e) => setForm({ ...form, backwashFlow: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ROConfigForm() {
  const [form, setForm] = useState<ROFormData>({
    inputTds: "500",
    outputTds: "50",
    usagePointHardness: "150",
    regeneration: "off",
    regenWaterFlow: "100",
  });

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-3">
        <div className="flex items-center gap-1.5">
          <Settings2 className="h-4 w-4 text-slate-400" />
          <h4 className="text-[13px] font-semibold text-slate-800">
            Add RO Plant Config
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Input TDS">
            <Input
              value={form.inputTds}
              onChange={(e) => setForm({ ...form, inputTds: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Output TDS">
            <Input
              value={form.outputTds}
              onChange={(e) => setForm({ ...form, outputTds: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Usage Point Hardness">
            <Input
              value={form.usagePointHardness}
              onChange={(e) => setForm({ ...form, usagePointHardness: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
          <FormField label="Regeneration">
            <Select
              value={form.regeneration}
              onValueChange={(val) => setForm({ ...form, regeneration: val as string })}
            >
              <SelectTrigger className="w-full h-8 text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off" className="text-[12px]">OFF</SelectItem>
                <SelectItem value="on" className="text-[12px]">ON</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Regen Water Flow (KL)">
            <Input
              value={form.regenWaterFlow}
              onChange={(e) => setForm({ ...form, regenWaterFlow: e.target.value })}
              className="h-8 text-[12px]"
            />
          </FormField>
        </div>
        <div className="flex justify-end">
          <Button className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white gap-1.5 px-2.5">
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaterQualityConfig() {
  return (
    <div className="space-y-5">
      {/* Existing Configs - compact grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">
            STP Configurations
          </h3>
          {existingSTP.map((c) => (
            <ExistingConfigCard key={c.id} config={c} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">
            WTP Configurations
          </h3>
          {existingWTP.map((c) => (
            <ExistingConfigCard key={c.id} config={c} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">
            Swimming Pool Configurations
          </h3>
          {existingPool.map((c) => (
            <ExistingConfigCard key={c.id} config={c} />
          ))}
        </div>
        <div className="space-y-2">
          <h3 className="text-[13px] font-semibold text-slate-800">
            RO Plant Configurations
          </h3>
          {existingRO.map((c) => (
            <ExistingConfigCard key={c.id} config={c} />
          ))}
        </div>
      </div>

      {/* Add New Config Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <STPConfigForm />
        <WTPConfigForm />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PoolConfigForm />
        <ROConfigForm />
      </div>
    </div>
  );
}
