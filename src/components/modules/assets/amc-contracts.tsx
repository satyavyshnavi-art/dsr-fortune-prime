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
import { mockAMCContracts, type AMCContract } from "./mock-data";
import {
  FileText,
  CheckCircle2,
  IndianRupee,
  AlertTriangle,
  Plus,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export function AMCContracts() {
  const [contracts, setContracts] = useState<AMCContract[]>(mockAMCContracts);

  // Dialog states
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<AMCContract | null>(null);

  // Validation errors
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  // Add form
  const [addForm, setAddForm] = useState({
    vendorName: "",
    contractType: "",
    serviceProvider: "",
    contractValue: "",
    validUntil: "",
    description: "",
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    vendorName: "",
    contractType: "",
    serviceProvider: "",
    contractValue: "",
    validUntil: "",
    description: "",
    status: "active" as AMCContract["status"],
  });

  // KPIs (dynamic)
  const totalContracts = contracts.length;
  const activeContracts = contracts.filter((c) => c.status === "active").length;
  const totalValue = contracts.reduce((sum, c) => sum + c.contractValue, 0);
  const dueForRenewal = contracts.filter((c) => c.status === "expiring").length;

  // Validation helpers
  const clearAddError = (field: string) => {
    if (addErrors[field]) setAddErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };
  const clearEditError = (field: string) => {
    if (editErrors[field]) setEditErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Handlers
  const handleAdd = () => {
    const errs: Record<string, string> = {};
    if (!addForm.vendorName.trim()) errs.vendorName = "Vendor name is required";
    if (!addForm.contractType) errs.contractType = "Contract type is required";
    if (Object.keys(errs).length) { setAddErrors(errs); return; }

    const newContract: AMCContract = {
      id: `amc-${Date.now()}`,
      contractId: `AMC-2026-${String(contracts.length + 1).padStart(6, "0")}`,
      vendorName: addForm.vendorName,
      description: addForm.description || `Annual maintenance contract for ${addForm.contractType}`,
      contractType: addForm.contractType,
      serviceProvider: addForm.serviceProvider,
      contractValue: Number(addForm.contractValue) || 0,
      validUntil: addForm.validUntil
        ? new Date(addForm.validUntil).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })
        : "",
      status: "active",
    };
    setContracts((prev) => [newContract, ...prev]);
    setAddForm({ vendorName: "", contractType: "", serviceProvider: "", contractValue: "", validUntil: "", description: "" });
    setAddErrors({});
    setShowAddModal(false);
    toast.success("AMC contract added successfully");
  };

  const openView = (c: AMCContract) => {
    setSelectedContract(c);
    setViewOpen(true);
  };

  const openEdit = (c: AMCContract) => {
    setSelectedContract(c);
    setEditForm({
      vendorName: c.vendorName,
      contractType: c.contractType,
      serviceProvider: c.serviceProvider,
      contractValue: String(c.contractValue),
      validUntil: c.validUntil,
      description: c.description,
      status: c.status,
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!selectedContract) return;
    const errs: Record<string, string> = {};
    if (!editForm.vendorName.trim()) errs.vendorName = "Vendor name is required";
    if (!editForm.contractType) errs.contractType = "Contract type is required";
    if (Object.keys(errs).length) { setEditErrors(errs); return; }

    setContracts((prev) =>
      prev.map((c) =>
        c.id === selectedContract.id
          ? {
              ...c,
              vendorName: editForm.vendorName,
              contractType: editForm.contractType,
              serviceProvider: editForm.serviceProvider,
              contractValue: Number(editForm.contractValue) || 0,
              validUntil: editForm.validUntil,
              description: editForm.description,
              status: editForm.status,
            }
          : c
      )
    );
    setEditOpen(false);
    toast.success("Contract updated successfully");
  };

  const openDelete = (c: AMCContract) => {
    setSelectedContract(c);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedContract) return;
    setContracts((prev) => prev.filter((c) => c.id !== selectedContract.id));
    setDeleteOpen(false);
    toast.success("Contract deleted successfully");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-slate-800">AMC Contracts</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Manage Annual Maintenance Contracts
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5" onClick={() => toast.success("Refreshed")}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => { setAddErrors({}); setShowAddModal(true); }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add AMC Contract
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard title="Total Contracts" value={totalContracts} icon={FileText} color="blue" />
        <KPICard title="Active Contracts" value={activeContracts} icon={CheckCircle2} color="green" />
        <KPICard
          title="Total Value"
          value={`\u20B9${totalValue.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          color="yellow"
        />
        <KPICard title="Due for Renewal" value={dueForRenewal} icon={AlertTriangle} color="red" />
      </div>

      {/* Contract Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {contracts.map((contract) => (
          <Card key={contract.id} className="shadow-none border-slate-200 hover:shadow-sm transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-start justify-between mb-1.5">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-[12px] text-slate-800 line-clamp-1">
                    {contract.vendorName}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {contract.contractId}
                  </p>
                </div>
                <StatusBadge
                  status={contract.status === "active" ? "Active" : contract.status === "expiring" ? "Expiring" : "Expired"}
                  variant={
                    contract.status === "active"
                      ? "success"
                      : contract.status === "expiring"
                      ? "warning"
                      : "danger"
                  }
                />
              </div>

              <p className="text-[11px] text-slate-400 mb-2 line-clamp-2 leading-snug">
                {contract.description}
              </p>

              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 w-[88px] shrink-0">Contract Type:</span>
                  <span className="text-slate-600 font-medium truncate">{contract.contractType}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 w-[88px] shrink-0">Service Provider:</span>
                  <span className="text-slate-600 truncate">{contract.serviceProvider}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 w-[88px] shrink-0">Contract Value:</span>
                  <span className="text-slate-600 font-medium">
                    {"\u20B9"}{contract.contractValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 w-[88px] shrink-0">Valid Until:</span>
                  <span className="text-slate-600">{contract.validUntil}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 px-2" onClick={() => openView(contract)}>
                  <Eye className="h-3 w-3 mr-0.5" />
                  View
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 px-2" onClick={() => openEdit(contract)}>
                  <Pencil className="h-3 w-3 mr-0.5" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1 text-[10px] h-6 px-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openDelete(contract)}>
                  <Trash2 className="h-3 w-3 mr-0.5" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ===== ADD AMC CONTRACT DIALOG ===== */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add AMC Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Vendor Name *</Label>
                <Input
                  value={addForm.vendorName}
                  onChange={(e) => { setAddForm({ ...addForm, vendorName: e.target.value }); clearAddError("vendorName"); }}
                  placeholder="Enter vendor name"
                  className={`h-9 text-[13px] rounded-lg ${addErrors.vendorName ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {addErrors.vendorName && <p className="text-[10px] text-red-500 mt-0.5">{addErrors.vendorName}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Contract Type *</Label>
                <select
                  value={addForm.contractType}
                  onChange={(e) => { setAddForm({ ...addForm, contractType: e.target.value }); clearAddError("contractType"); }}
                  className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${addErrors.contractType ? "border-red-400 ring-1 ring-red-200" : ""}`}
                >
                  <option value="">Select type</option>
                  <option value="Comprehensive AMC">Comprehensive AMC</option>
                  <option value="Annual Service Contract">Annual Service Contract</option>
                  <option value="Breakdown Maintenance">Breakdown Maintenance</option>
                  <option value="Preventive Maintenance">Preventive Maintenance</option>
                </select>
                {addErrors.contractType && <p className="text-[10px] text-red-500 mt-0.5">{addErrors.contractType}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Service Provider</Label>
                <Input
                  value={addForm.serviceProvider}
                  onChange={(e) => setAddForm({ ...addForm, serviceProvider: e.target.value })}
                  placeholder="Enter provider"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Contract Value ({"\u20B9"})</Label>
                <Input
                  type="number"
                  value={addForm.contractValue}
                  onChange={(e) => setAddForm({ ...addForm, contractValue: e.target.value })}
                  placeholder="0"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Valid Until</Label>
              <Input
                type="date"
                value={addForm.validUntil}
                onChange={(e) => setAddForm({ ...addForm, validUntil: e.target.value })}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Description</Label>
              <textarea
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] min-h-[60px]"
                placeholder="Contract description..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleAdd} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                Add Contract
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW CONTRACT DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Contract Details</DialogTitle>
          </DialogHeader>
          {selectedContract && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Contract ID</span>
                  <span className="text-[13px] font-semibold text-slate-800">{selectedContract.contractId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Status</span>
                  <StatusBadge
                    status={selectedContract.status === "active" ? "Active" : selectedContract.status === "expiring" ? "Expiring" : "Expired"}
                    variant={selectedContract.status === "active" ? "success" : selectedContract.status === "expiring" ? "warning" : "danger"}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Contract Type</span>
                  <span className="text-[13px] text-slate-700">{selectedContract.contractType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Service Provider</span>
                  <span className="text-[13px] text-slate-700">{selectedContract.serviceProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Contract Value</span>
                  <span className="text-[13px] font-semibold text-slate-800">{"\u20B9"}{selectedContract.contractValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Valid Until</span>
                  <span className="text-[13px] text-slate-700">{selectedContract.validUntil}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Vendor Name</p>
                <p className="text-[13px] text-slate-800">{selectedContract.vendorName}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Description</p>
                <p className="text-[13px] text-slate-700">{selectedContract.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT CONTRACT DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Edit Contract - {selectedContract?.contractId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Vendor Name *</Label>
              <Input
                value={editForm.vendorName}
                onChange={(e) => { setEditForm({ ...editForm, vendorName: e.target.value }); clearEditError("vendorName"); }}
                className={`h-9 text-[13px] rounded-lg ${editErrors.vendorName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {editErrors.vendorName && <p className="text-[10px] text-red-500 mt-0.5">{editErrors.vendorName}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Contract Type *</Label>
                <select
                  value={editForm.contractType}
                  onChange={(e) => { setEditForm({ ...editForm, contractType: e.target.value }); clearEditError("contractType"); }}
                  className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${editErrors.contractType ? "border-red-400 ring-1 ring-red-200" : ""}`}
                >
                  <option value="Comprehensive AMC">Comprehensive AMC</option>
                  <option value="Annual Service Contract">Annual Service Contract</option>
                  <option value="Breakdown Maintenance">Breakdown Maintenance</option>
                  <option value="Preventive Maintenance">Preventive Maintenance</option>
                </select>
                {editErrors.contractType && <p className="text-[10px] text-red-500 mt-0.5">{editErrors.contractType}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AMCContract["status"] })}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                >
                  <option value="active">Active</option>
                  <option value="expiring">Expiring</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Service Provider</Label>
                <Input
                  value={editForm.serviceProvider}
                  onChange={(e) => setEditForm({ ...editForm, serviceProvider: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Contract Value ({"\u20B9"})</Label>
                <Input
                  type="number"
                  value={editForm.contractValue}
                  onChange={(e) => setEditForm({ ...editForm, contractValue: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Valid Until</Label>
              <Input
                value={editForm.validUntil}
                onChange={(e) => setEditForm({ ...editForm, validUntil: e.target.value })}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Description</Label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] min-h-[60px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleEdit} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Update Contract</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Contract</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete contract <span className="font-semibold">{selectedContract?.contractId}</span>? This action cannot be undone.
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
