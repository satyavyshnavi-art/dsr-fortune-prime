"use client";

import { useState } from "react";
import { DataTable, StatusBadge } from "@/components/shared";
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
import { Plus, Wifi, WifiOff } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface IoTDevice {
  id: string;
  name: string;
  deviceIp: string;
  protocol: string;
  assetName: string | null;
  assetId: string | null;
  status: "online" | "offline" | "maintenance";
  lastSeenAt: string | null;
  pollIntervalSec: number;
}

const mockDevices: IoTDevice[] = [
  { id: "1", name: "Temp Sensor - Block A", deviceIp: "192.168.1.101", protocol: "mqtt", assetName: "HVAC Unit A1", assetId: "a1", status: "online", lastSeenAt: "2026-05-20T09:45:00Z", pollIntervalSec: 60 },
  { id: "2", name: "Water Flow Meter", deviceIp: "192.168.1.102", protocol: "modbus", assetName: "Water Pump P1", assetId: "a2", status: "online", lastSeenAt: "2026-05-20T09:44:00Z", pollIntervalSec: 30 },
  { id: "3", name: "Power Meter - Floor 3", deviceIp: "192.168.1.103", protocol: "mqtt", assetName: "DG Set 1", assetId: "a3", status: "offline", lastSeenAt: "2026-05-19T14:20:00Z", pollIntervalSec: 60 },
  { id: "4", name: "Humidity Sensor - Server Room", deviceIp: "192.168.1.104", protocol: "mqtt", assetName: null, assetId: null, status: "online", lastSeenAt: "2026-05-20T09:46:00Z", pollIntervalSec: 120 },
  { id: "5", name: "AQI Sensor - Lobby", deviceIp: "192.168.1.105", protocol: "http", assetName: "Air Handler AH2", assetId: "a5", status: "maintenance", lastSeenAt: "2026-05-18T11:00:00Z", pollIntervalSec: 300 },
];

function formatLastSeen(ts: string | null): string {
  if (!ts) return "Never";
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

const columns: ColumnDef<IoTDevice, any>[] = [
  {
    accessorKey: "name",
    header: "Device",
    cell: ({ row }) => (
      <div>
        <p className="text-[12px] font-medium text-slate-700">{row.original.name}</p>
        <p className="text-[10px] text-slate-400">{row.original.deviceIp}</p>
      </div>
    ),
  },
  {
    accessorKey: "protocol",
    header: "Protocol",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-600 uppercase font-medium">
        {row.original.protocol}
      </span>
    ),
  },
  {
    accessorKey: "assetName",
    header: "Assigned Asset",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-600">
        {row.original.assetName ?? <span className="text-slate-400 italic">Unassigned</span>}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isOnline = status === "online";
      return (
        <div className="flex items-center gap-1.5">
          <span className={`inline-block h-2 w-2 rounded-full shrink-0 ${
            isOnline ? "bg-green-500" : status === "maintenance" ? "bg-yellow-500" : "bg-red-500"
          }`} />
          <StatusBadge status={status} />
        </div>
      );
    },
  },
  {
    accessorKey: "lastSeenAt",
    header: "Last Seen",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-500">
        {formatLastSeen(row.original.lastSeenAt)}
      </span>
    ),
  },
  {
    accessorKey: "pollIntervalSec",
    header: "Poll Interval",
    cell: ({ row }) => (
      <span className="text-[11px] text-slate-500">
        {row.original.pollIntervalSec}s
      </span>
    ),
  },
];

export function DeviceManager() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    deviceIp: "",
    protocol: "mqtt",
    pollIntervalSec: "60",
  });

  const { data, loading, create } = useApi<IoTDevice[]>({
    url: "/api/v1/iot/devices",
    initialData: mockDevices,
  });

  const devices = data ?? mockDevices;

  const onlineCount = devices.filter((d) => d.status === "online").length;
  const offlineCount = devices.filter((d) => d.status === "offline").length;

  const handleRegister = async () => {
    if (!formData.name || !formData.deviceIp) {
      toast.error("Name and IP are required");
      return;
    }
    try {
      await create({
        name: formData.name,
        deviceIp: formData.deviceIp,
        protocol: formData.protocol,
        pollIntervalSec: parseInt(formData.pollIntervalSec, 10),
      });
      toast.success("Device registered");
      setDialogOpen(false);
      setFormData({ name: "", deviceIp: "", protocol: "mqtt", pollIntervalSec: "60" });
    } catch {
      toast.error("Failed to register device");
    }
  };

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
            <Wifi className="h-3.5 w-3.5 text-green-500" />
            <span className="font-medium">{onlineCount}</span>
            <span className="text-slate-400">online</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
            <WifiOff className="h-3.5 w-3.5 text-red-400" />
            <span className="font-medium">{offlineCount}</span>
            <span className="text-slate-400">offline</span>
          </div>
        </div>

        <Button size="sm" className="h-7 text-[11px] px-2.5" onClick={() => setDialogOpen(true)}>
          <Plus className="h-3 w-3 mr-1" />
          Register Device
        </Button>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[14px]">Register New Device</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Device Name</Label>
                <Input
                  placeholder="e.g. Temp Sensor - Block A"
                  className="h-8 text-[12px]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Device IP</Label>
                <Input
                  placeholder="e.g. 192.168.1.100"
                  className="h-8 text-[12px]"
                  value={formData.deviceIp}
                  onChange={(e) => setFormData({ ...formData, deviceIp: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Protocol</Label>
                <Select
                  value={formData.protocol}
                  onValueChange={(v) => setFormData({ ...formData, protocol: v ?? "mqtt" })}
                >
                  <SelectTrigger className="h-8 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mqtt">MQTT</SelectItem>
                    <SelectItem value="modbus">Modbus</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="opcua">OPC-UA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Poll Interval (seconds)</Label>
                <Input
                  type="number"
                  className="h-8 text-[12px]"
                  value={formData.pollIntervalSec}
                  onChange={(e) => setFormData({ ...formData, pollIntervalSec: e.target.value })}
                />
              </div>
              <Button size="sm" className="w-full h-8 text-[12px]" onClick={handleRegister}>
                Register
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable
        columns={columns}
        data={devices}
        searchKey="name"
        searchPlaceholder="Search devices..."
        pageSize={10}
      />
    </div>
  );
}
