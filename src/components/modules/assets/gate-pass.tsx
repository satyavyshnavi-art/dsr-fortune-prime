"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard, StatusBadge } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { mockGatePasses, type GatePass } from "./mock-data";
import {
  ArrowRightLeft,
  AlertTriangle,
  FileText,
  Plus,
  Eye,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export function GatePassManagement() {
  const [gatePasses, setGatePasses] = useState<GatePass[]>(mockGatePasses);

  // Dialog states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<GatePass | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create form
  const [createForm, setCreateForm] = useState({
    assetName: "",
    assetTag: "",
    gatePassType: "",
    serviceProvider: "",
    dateTimeOut: "",
  });

  // KPIs (dynamic)
  const assetsOut = gatePasses.filter((gp) => gp.status === "Out").length;
  const returnedCount = gatePasses.filter((gp) => gp.status === "Returned").length;
  const totalPasses = gatePasses.length;

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Handlers
  const handleCreate = () => {
    const errs: Record<string, string> = {};
    if (!createForm.assetName.trim()) errs.assetName = "Asset name is required";
    if (!createForm.gatePassType) errs.gatePassType = "Gate pass type is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const newPass: GatePass = {
      id: `gp-${Date.now()}`,
      assetName: createForm.assetName,
      assetTag: createForm.assetTag || `GV-${Date.now().toString().slice(-6)}`,
      gatePassType: createForm.gatePassType,
      status: "Out",
      dateTimeOut: createForm.dateTimeOut
        ? new Date(createForm.dateTimeOut).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
      serviceProvider: createForm.serviceProvider,
    };
    setGatePasses((prev) => [newPass, ...prev]);
    setCreateForm({ assetName: "", assetTag: "", gatePassType: "", serviceProvider: "", dateTimeOut: "" });
    setErrors({});
    setShowCreateModal(false);
    toast.success("Gate pass created successfully");
  };

  const openView = (gp: GatePass) => {
    setSelectedPass(gp);
    setViewOpen(true);
  };

  const handleMarkReturned = (gp: GatePass) => {
    setGatePasses((prev) =>
      prev.map((p) =>
        p.id === gp.id ? { ...p, status: "Returned" as const } : p
      )
    );
    toast.success(`${gp.assetName} marked as returned`);
  };

  const openDelete = (gp: GatePass) => {
    setSelectedPass(gp);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedPass) return;
    setGatePasses((prev) => prev.filter((p) => p.id !== selectedPass.id));
    setDeleteOpen(false);
    toast.success("Gate pass deleted successfully");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <ArrowRightLeft className="h-4 w-4 text-slate-500" />
        <h2 className="text-[15px] font-semibold text-slate-800">Gate Pass Management</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard title="Assets Out" value={assetsOut} icon={ArrowRightLeft} color="red" />
        <KPICard title="Returned" value={returnedCount} icon={AlertTriangle} color="green" />
        <KPICard title="Total Passes" value={totalPasses} icon={FileText} color="blue" />
      </div>

      {/* Active Gate Passes Table */}
      <Card className="shadow-none border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-700">Active Gate Passes</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">{gatePasses.length} records</p>
            </div>
            <Button
              size="sm"
              className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => { setErrors({}); setShowCreateModal(true); }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Pass
            </Button>
          </div>

          <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">
                    Asset Name
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">
                    Gate Pass Type
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">
                    Date & Time Out
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">
                    Service Provider
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gatePasses.map((gp) => (
                  <TableRow key={gp.id} className="hover:bg-slate-50/50">
                    <TableCell className="text-[12px] py-2 px-3">
                      <div>
                        <p className="font-medium text-slate-800">{gp.assetName}</p>
                        <p className="text-[10px] text-slate-400">ID: {gp.assetTag}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-[12px] py-2 px-3 text-slate-600">
                      {gp.gatePassType}
                    </TableCell>
                    <TableCell className="text-[12px] py-2 px-3">
                      <StatusBadge
                        status={gp.status}
                        variant={
                          gp.status === "Out"
                            ? "danger"
                            : gp.status === "Returned"
                            ? "info"
                            : gp.status === "Approved"
                            ? "success"
                            : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell className="text-[12px] py-2 px-3 text-slate-500">
                      {gp.dateTimeOut}
                    </TableCell>
                    <TableCell className="text-[12px] py-2 px-3 text-slate-500">
                      {gp.serviceProvider || "-"}
                    </TableCell>
                    <TableCell className="text-[12px] py-2 px-3">
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openView(gp)}
                          title="View"
                        >
                          <Eye className="h-3 w-3 text-blue-500" />
                        </Button>
                        {(gp.status === "Out" || gp.status === "Approved") && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleMarkReturned(gp)}
                            title="Mark Returned"
                          >
                            <RotateCcw className="h-3 w-3 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => openDelete(gp)}
                          title="Delete"
                        >
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {gatePasses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-400 text-[12px]">
                      No gate passes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ===== CREATE GATE PASS DIALOG ===== */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Create Gate Pass</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Asset Name *</Label>
                <Input
                  value={createForm.assetName}
                  onChange={(e) => { setCreateForm({ ...createForm, assetName: e.target.value }); clearError("assetName"); }}
                  placeholder="Enter asset name"
                  className={`h-9 text-[13px] rounded-lg ${errors.assetName ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {errors.assetName && <p className="text-[10px] text-red-500 mt-0.5">{errors.assetName}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Asset Tag</Label>
                <Input
                  value={createForm.assetTag}
                  onChange={(e) => setCreateForm({ ...createForm, assetTag: e.target.value })}
                  placeholder="e.g. GV-HVAC-010"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Gate Pass Type *</Label>
                <select
                  value={createForm.gatePassType}
                  onChange={(e) => { setCreateForm({ ...createForm, gatePassType: e.target.value }); clearError("gatePassType"); }}
                  className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${errors.gatePassType ? "border-red-400 ring-1 ring-red-200" : ""}`}
                >
                  <option value="">Select type</option>
                  <option value="Demonstration">Demonstration</option>
                  <option value="Calibration">Calibration</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Repair">Repair</option>
                  <option value="Testing">Testing</option>
                  <option value="Permanent transfer">Permanent transfer</option>
                  <option value="Temporary transfer">Temporary transfer</option>
                </select>
                {errors.gatePassType && <p className="text-[10px] text-red-500 mt-0.5">{errors.gatePassType}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Service Provider</Label>
                <Input
                  value={createForm.serviceProvider}
                  onChange={(e) => setCreateForm({ ...createForm, serviceProvider: e.target.value })}
                  placeholder="Provider name"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Date & Time Out</Label>
              <Input
                type="datetime-local"
                value={createForm.dateTimeOut}
                onChange={(e) => setCreateForm({ ...createForm, dateTimeOut: e.target.value })}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowCreateModal(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                Create Pass
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW GATE PASS DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Gate Pass Details</DialogTitle>
          </DialogHeader>
          {selectedPass && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Asset Name</span>
                  <span className="text-[13px] font-semibold text-slate-800">{selectedPass.assetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Asset Tag</span>
                  <span className="text-[13px] text-slate-700">{selectedPass.assetTag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Status</span>
                  <StatusBadge
                    status={selectedPass.status}
                    variant={
                      selectedPass.status === "Out"
                        ? "danger"
                        : selectedPass.status === "Returned"
                        ? "info"
                        : selectedPass.status === "Approved"
                        ? "success"
                        : "warning"
                    }
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Gate Pass Type</span>
                  <span className="text-[13px] text-slate-700">{selectedPass.gatePassType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Date & Time Out</span>
                  <span className="text-[13px] text-slate-700">{selectedPass.dateTimeOut}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Service Provider</span>
                  <span className="text-[13px] text-slate-700">{selectedPass.serviceProvider || "-"}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Gate Pass</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete the gate pass for <span className="font-semibold">{selectedPass?.assetName}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleDelete} className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
