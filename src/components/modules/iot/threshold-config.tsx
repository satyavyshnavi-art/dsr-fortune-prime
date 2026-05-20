"use client";

import { useState } from "react";
import { DataTable } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Trash2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface Threshold {
  id: string;
  assetName: string;
  assetId: string;
  metricName: string;
  minValue: number | null;
  maxValue: number | null;
  alertSeverity: string;
}

const mockThresholds: Threshold[] = [
  { id: "1", assetName: "HVAC Unit A1", assetId: "a1", metricName: "temperature", minValue: 18, maxValue: 28, alertSeverity: "high" },
  { id: "2", assetName: "HVAC Unit A1", assetId: "a1", metricName: "humidity", minValue: 30, maxValue: 65, alertSeverity: "medium" },
  { id: "3", assetName: "Water Pump P1", assetId: "a2", metricName: "flow_rate", minValue: 10, maxValue: null, alertSeverity: "critical" },
  { id: "4", assetName: "DG Set 1", assetId: "a3", metricName: "voltage", minValue: 210, maxValue: 250, alertSeverity: "high" },
  { id: "5", assetName: "Air Handler AH2", assetId: "a5", metricName: "pm2.5", minValue: null, maxValue: 50, alertSeverity: "medium" },
];

const severityColors: Record<string, string> = {
  critical: "text-red-700 bg-red-50 border-red-200",
  high: "text-orange-700 bg-orange-50 border-orange-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  low: "text-blue-700 bg-blue-50 border-blue-200",
};

export function ThresholdConfig() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    assetId: "",
    metricName: "",
    minValue: "",
    maxValue: "",
    alertSeverity: "medium",
  });

  const { data, create, remove } = useApi<Threshold[]>({
    url: "/api/v1/iot/thresholds",
    initialData: mockThresholds,
  });

  const thresholds = data ?? mockThresholds;

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      toast.success("Threshold deleted");
    } catch {
      toast.error("Failed to delete threshold");
    }
  };

  const handleCreate = async () => {
    if (!formData.metricName) {
      toast.error("Metric name is required");
      return;
    }
    if (!formData.minValue && !formData.maxValue) {
      toast.error("Set at least one threshold value");
      return;
    }
    try {
      await create({
        assetId: formData.assetId || null,
        metricName: formData.metricName,
        minValue: formData.minValue ? parseFloat(formData.minValue) : null,
        maxValue: formData.maxValue ? parseFloat(formData.maxValue) : null,
        alertSeverity: formData.alertSeverity,
      });
      toast.success("Threshold created");
      setDialogOpen(false);
      setFormData({ assetId: "", metricName: "", minValue: "", maxValue: "", alertSeverity: "medium" });
    } catch {
      toast.error("Failed to create threshold");
    }
  };

  const columns: ColumnDef<Threshold, any>[] = [
    {
      accessorKey: "assetName",
      header: "Asset",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-700 font-medium">
          {row.original.assetName}
        </span>
      ),
    },
    {
      accessorKey: "metricName",
      header: "Metric",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-600">
          {row.original.metricName.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ),
    },
    {
      accessorKey: "minValue",
      header: "Min",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-600">
          {row.original.minValue !== null ? row.original.minValue : <span className="text-slate-300">--</span>}
        </span>
      ),
    },
    {
      accessorKey: "maxValue",
      header: "Max",
      cell: ({ row }) => (
        <span className="text-[11px] text-slate-600">
          {row.original.maxValue !== null ? row.original.maxValue : <span className="text-slate-300">--</span>}
        </span>
      ),
    },
    {
      accessorKey: "alertSeverity",
      header: "Alert Severity",
      cell: ({ row }) => {
        const sev = row.original.alertSeverity;
        const cls = severityColors[sev] ?? severityColors.medium;
        return (
          <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded border ${cls}`}>
            {sev.charAt(0).toUpperCase() + sev.slice(1)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-3 w-3 text-red-400" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-500">
          {thresholds.length} threshold{thresholds.length !== 1 ? "s" : ""} configured
        </p>

        <Button size="sm" className="h-7 text-[11px] px-2.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Add Threshold
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[14px]">Add Threshold Rule</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Asset ID (optional)</Label>
                <Input
                  placeholder="e.g. asset-uuid"
                  className="h-8 text-[12px]"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Metric Name</Label>
                <Input
                  placeholder="e.g. temperature, humidity, voltage"
                  className="h-8 text-[12px]"
                  value={formData.metricName}
                  onChange={(e) => setFormData({ ...formData, metricName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px]">Min Value</Label>
                  <Input
                    type="number"
                    placeholder="Min"
                    className="h-8 text-[12px]"
                    value={formData.minValue}
                    onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Max Value</Label>
                  <Input
                    type="number"
                    placeholder="Max"
                    className="h-8 text-[12px]"
                    value={formData.maxValue}
                    onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Alert Severity</Label>
                <Select
                  value={formData.alertSeverity}
                  onValueChange={(v) => setFormData({ ...formData, alertSeverity: v ?? "medium" })}
                >
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="w-full h-8 text-[12px]" onClick={handleCreate}>
                Save Threshold
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={thresholds}
        searchKey="metricName"
        searchPlaceholder="Search thresholds..."
        pageSize={10}
      />
    </div>
  );
}
