"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, StatusBadge, DataTable } from "@/components/shared";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Fingerprint, Plus, RefreshCw, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface BiometricDevice {
  id: string;
  deviceName: string;
  serialNumber: string;
  type: string;
  status: "active" | "inactive";
  registeredAt: string;
}

function buildDeviceColumns(onDelete: (id: string) => void): ColumnDef<BiometricDevice, unknown>[] {
  return [{
    accessorKey: "deviceName",
    header: "Device Name",
  },
  {
    accessorKey: "serialNumber",
    header: "Serial No.",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-slate-500">{row.getValue("serialNumber")}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <span className="capitalize text-[12px]">{type}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status") as string} />,
  },
  {
    accessorKey: "registeredAt",
    header: "Registered",
    cell: ({ row }) => {
      const date = new Date(row.getValue("registeredAt") as string);
      return (
        <span className="text-[11px] text-slate-500">
          {date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="icon-sm"
        className="h-6 w-6 text-slate-400 hover:text-red-500"
        onClick={() => onDelete(row.original.id)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    ),
  }];
}

export function DevicesTab() {
  const [devices, setDevices] = useState<BiometricDevice[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [deviceType, setDeviceType] = useState("fingerprint");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  function handleAddDevice() {
    const errs: Record<string, boolean> = {};
    if (!deviceName.trim()) errs.deviceName = true;
    if (!serialNumber.trim()) errs.serialNumber = true;
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newDevice: BiometricDevice = {
      id: crypto.randomUUID(),
      deviceName: deviceName.trim(),
      serialNumber: serialNumber.trim(),
      type: deviceType,
      status: "active",
      registeredAt: new Date().toISOString(),
    };

    setDevices((prev) => [...prev, newDevice]);
    setDeviceName("");
    setSerialNumber("");
    setDeviceType("fingerprint");
    setErrors({});
    setDialogOpen(false);
    toast.success("Device registered successfully");
  }

  function handleDeleteDevice(id: string) {
    setDevices((prev) => prev.filter((d) => d.id !== id));
    toast.success("Device removed");
  }

  function handleRefresh() {
    setIsRefreshing(true);
    toast.info("Refreshing...");
    setTimeout(() => setIsRefreshing(false), 1000);
  }

  const deviceColumns = buildDeviceColumns(handleDeleteDevice);

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-800">Registered Devices</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">{devices.length} devices</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" className="h-7 text-[11px] gap-1.5" onClick={handleRefresh}>
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              render={
                <Button className="h-7 text-[11px] gap-1.5">
                  <Plus className="h-3 w-3" />
                  Add Device
                </Button>
              }
            />
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle className="text-[14px]">Add Biometric Device</DialogTitle>
                <DialogDescription className="text-[11px]">
                  Register a new ZKTeco / eSSL biometric device for this facility.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 py-1">
                <div className="space-y-1">
                  <Label htmlFor="device-name" className="text-[11px]">Device Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="device-name"
                    placeholder="e.g. Main Gate Reader"
                    value={deviceName}
                    onChange={(e) => { setDeviceName(e.target.value); setErrors((prev) => ({ ...prev, deviceName: false })); }}
                    className={`h-8 text-[12px] ${errors.deviceName ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.deviceName && <p className="text-[10px] text-red-500 mt-0.5">Device name is required</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="serial-number" className="text-[11px]">Serial Number <span className="text-red-500">*</span></Label>
                  <Input
                    id="serial-number"
                    placeholder="e.g. ZK-2024-0001"
                    value={serialNumber}
                    onChange={(e) => { setSerialNumber(e.target.value); setErrors((prev) => ({ ...prev, serialNumber: false })); }}
                    className={`h-8 text-[12px] ${errors.serialNumber ? 'border-red-400 ring-1 ring-red-200' : ''}`}
                  />
                  {errors.serialNumber && <p className="text-[10px] text-red-500 mt-0.5">Serial number is required</p>}
                </div>

                <div className="space-y-1">
                  <Label className="text-[11px]">Device Type</Label>
                  <Select value={deviceType} onValueChange={(v) => v && setDeviceType(v)}>
                    <SelectTrigger className="w-full h-8 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fingerprint" className="text-[12px]">Fingerprint</SelectItem>
                      <SelectItem value="face" className="text-[12px]">Face Recognition</SelectItem>
                      <SelectItem value="card" className="text-[12px]">Card Reader</SelectItem>
                      <SelectItem value="multi" className="text-[12px]">Multi-modal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant="outline" className="h-7 text-[11px]" />}>
                  Cancel
                </DialogClose>
                <Button
                  className="h-7 text-[11px]"
                  onClick={handleAddDevice}
                  disabled={!deviceName.trim() || !serialNumber.trim()}
                >
                  Register Device
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Device list or empty state */}
      <Card className="shadow-none border-slate-200 p-0">
        {devices.length === 0 ? (
          <EmptyState
            icon={Fingerprint}
            title="No biometric devices registered for this facility yet."
            description="Add a device to start tracking attendance through biometric punches."
            action={
              <Button className="h-7 text-[11px] gap-1.5" onClick={() => setDialogOpen(true)}>
                <Plus className="h-3 w-3" />
                Add Device
              </Button>
            }
          />
        ) : (
          <div className="p-3">
            <DataTable
              columns={deviceColumns}
              data={devices}
              searchKey="deviceName"
              searchPlaceholder="Search devices..."
            />
          </div>
        )}
      </Card>
    </div>
  );
}
