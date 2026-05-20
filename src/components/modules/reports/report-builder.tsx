"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const MODULES: Record<string, string[]> = {
  attendance: ["employeeName", "date", "status", "checkIn", "checkOut", "shiftType", "department", "location"],
  tasks: ["title", "assignee", "priority", "status", "dueDate", "completedAt", "cluster", "category"],
  assets: ["name", "category", "location", "status", "lastServiceDate", "nextServiceDate", "vendor"],
  complaints: ["subject", "raisedBy", "severity", "status", "createdAt", "resolvedAt", "category"],
  inventory: ["itemName", "category", "currentStock", "reorderLevel", "unit", "lastUpdated", "supplier"],
  water: ["sourceName", "readingDate", "liters", "quality", "pH", "turbidity"],
  power: ["meterName", "readingDate", "kwh", "peakDemand", "powerFactor"],
};

const MODULE_LABELS: Record<string, string> = {
  attendance: "Attendance",
  tasks: "Tasks",
  assets: "Asset Management",
  complaints: "Complaints",
  inventory: "Inventory",
  water: "Water Management",
  power: "Power Management",
};

function formatFieldName(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export function ReportBuilder() {
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [format, setFormat] = useState<string>("pdf");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [generating, setGenerating] = useState(false);

  const availableFields = selectedModule ? MODULES[selectedModule] ?? [] : [];

  const handleModuleChange = (mod: string | null) => {
    setSelectedModule(mod ?? "");
    setSelectedFields([]);
  };

  const toggleField = (field: string) => {
    setSelectedFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field]
    );
  };

  const selectAll = () => {
    setSelectedFields([...availableFields]);
  };

  const clearAll = () => {
    setSelectedFields([]);
  };

  const handleGenerate = async () => {
    if (!selectedModule) {
      toast.error("Select a module");
      return;
    }
    if (selectedFields.length === 0) {
      toast.error("Select at least one field");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch("/api/v1/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: selectedModule,
          fields: selectedFields,
          filters: {
            ...(dateFrom && { dateFrom }),
            ...(dateTo && { dateTo }),
            ...(statusFilter && { status: statusFilter }),
          },
          format,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Generation failed");
      }

      const data = await res.json();
      toast.success("Report generated successfully");

      if (data.fileUrl) {
        window.open(data.fileUrl, "_blank");
      }
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: Config */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="shadow-none border-slate-200">
          <CardHeader className="px-4 py-2.5 pb-1">
            <CardTitle className="text-[13px] font-semibold text-slate-700">
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3 pt-2 space-y-3">
            {/* Module Selector */}
            <div className="space-y-1">
              <Label className="text-[11px]">Module</Label>
              <Select value={selectedModule} onValueChange={handleModuleChange}>
                <SelectTrigger className="h-8 text-[12px]">
                  <SelectValue placeholder="Select module..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODULE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Field Picker */}
            {selectedModule && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Fields</Label>
                  <div className="flex gap-2">
                    <button onClick={selectAll} className="text-[10px] text-blue-500 hover:underline">
                      Select All
                    </button>
                    <button onClick={clearAll} className="text-[10px] text-slate-400 hover:underline">
                      Clear
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
                  {availableFields.map((field) => (
                    <label
                      key={field}
                      className="flex items-center gap-1.5 rounded border border-slate-100 px-2 py-1.5 hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedFields.includes(field)}
                        onCheckedChange={() => toggleField(field)}
                      />
                      <span className="text-[11px] text-slate-600">
                        {formatFieldName(field)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Date From</Label>
                <Input
                  type="date"
                  className="h-8 text-[12px]"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Date To</Label>
                <Input
                  type="date"
                  className="h-8 text-[12px]"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Status Filter</Label>
                <Input
                  placeholder="e.g. active, completed"
                  className="h-8 text-[12px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
            </div>

            {/* Format + Generate */}
            <div className="flex items-end gap-3">
              <div className="space-y-1">
                <Label className="text-[11px]">Format</Label>
                <Select value={format} onValueChange={(v) => setFormat(v ?? "pdf")}>
                  <SelectTrigger className="h-8 text-[12px] w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="xlsx">XLSX</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                className="h-8 text-[12px] px-4"
                onClick={handleGenerate}
                disabled={generating || !selectedModule || selectedFields.length === 0}
              >
                {generating ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <FileDown className="h-3 w-3 mr-1" />
                )}
                {generating ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Preview */}
      <Card className="shadow-none border-slate-200">
        <CardHeader className="px-4 py-2.5 pb-1">
          <CardTitle className="text-[13px] font-semibold text-slate-700">
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-2">
          {selectedFields.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-6 text-center">
              Select fields to preview columns
            </p>
          ) : (
            <div className="rounded-md border border-slate-200 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/80">
                    {selectedFields.map((f) => (
                      <th
                        key={f}
                        className="text-left text-[9px] font-semibold text-slate-400 uppercase tracking-wider py-1.5 px-2 whitespace-nowrap"
                      >
                        {formatFieldName(f)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-100">
                    {selectedFields.map((f) => (
                      <td key={f} className="py-1.5 px-2 text-[10px] text-slate-300 italic">
                        ---
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-slate-100">
                    {selectedFields.map((f) => (
                      <td key={f} className="py-1.5 px-2 text-[10px] text-slate-300 italic">
                        ---
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          <p className="text-[10px] text-slate-300 mt-2 text-center">
            {selectedFields.length} field{selectedFields.length !== 1 ? "s" : ""} selected
            {selectedModule && ` from ${MODULE_LABELS[selectedModule]}`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
