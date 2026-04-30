"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KPICard, StatusBadge } from "@/components/shared";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockBreakdowns, type BreakdownRecord, type IncidentReport } from "./mock-data";
import {
  Wrench,
  IndianRupee,
  Users,
  Plus,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export function BreakdownService() {
  const [breakdowns, setBreakdowns] = useState<BreakdownRecord[]>(mockBreakdowns);
  const [incidentReports, setIncidentReports] = useState<IncidentReport[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<"report" | "view">("report");

  // Dialog states
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedBreakdown, setSelectedBreakdown] = useState<BreakdownRecord | null>(null);
  const [incidentSubmitted, setIncidentSubmitted] = useState(false);

  // Validation errors
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [incidentErrors, setIncidentErrors] = useState<Record<string, string>>({});

  // Add form
  const [addForm, setAddForm] = useState({
    type: "" as BreakdownRecord["type"] | "",
    asset: "",
    serviceProvider: "",
    cost: "",
    date: "",
    status: "Pending" as BreakdownRecord["status"],
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    type: "" as BreakdownRecord["type"],
    asset: "",
    serviceProvider: "",
    cost: "",
    date: "",
    status: "" as BreakdownRecord["status"],
  });

  // Incident form
  const [incidentForm, setIncidentForm] = useState({
    time: "2026-04-27T22:10",
    severity: "Low" as IncidentReport["severity"],
    title: "",
    description: "",
    whys: ["", "", "", "", ""],
    correctiveAction: "",
    preventiveAction: "",
  });

  // KPIs (dynamic)
  const totalServices = breakdowns.length;
  const totalCost = breakdowns.reduce((sum, b) => sum + b.cost, 0);
  const serviceProviders = new Set(breakdowns.map((b) => b.serviceProvider)).size;

  // Error helpers
  const clearAddError = (field: string) => {
    if (addErrors[field]) setAddErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };
  const clearEditError = (field: string) => {
    if (editErrors[field]) setEditErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };
  const clearIncidentError = (field: string) => {
    if (incidentErrors[field]) setIncidentErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  // Add handler
  const handleAdd = () => {
    const errs: Record<string, string> = {};
    if (!addForm.type) errs.type = "Service type is required";
    if (!addForm.asset.trim()) errs.asset = "Asset is required";
    if (Object.keys(errs).length) { setAddErrors(errs); return; }
    const newRecord: BreakdownRecord = {
      id: `bd-${Date.now()}`,
      title: `${addForm.type} - ${addForm.asset}`,
      type: addForm.type as BreakdownRecord["type"],
      serviceProvider: addForm.serviceProvider,
      asset: addForm.asset,
      serviceId: `SRV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(breakdowns.length + 1).padStart(3, "0")}`,
      date: addForm.date
        ? new Date(addForm.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
        : new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" }),
      cost: Number(addForm.cost) || 0,
      status: addForm.status,
    };
    setBreakdowns((prev) => [newRecord, ...prev]);
    setAddForm({ type: "", asset: "", serviceProvider: "", cost: "", date: "", status: "Pending" });
    setAddErrors({});
    setShowAddModal(false);
    toast.success("Service record added successfully");
  };

  // View handler
  const openView = (bd: BreakdownRecord) => {
    setSelectedBreakdown(bd);
    setViewOpen(true);
  };

  // Edit handlers
  const openEdit = (bd: BreakdownRecord) => {
    setSelectedBreakdown(bd);
    setEditForm({
      type: bd.type,
      asset: bd.asset,
      serviceProvider: bd.serviceProvider,
      cost: String(bd.cost),
      date: bd.date,
      status: bd.status,
    });
    setEditErrors({});
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!selectedBreakdown) return;
    const errs: Record<string, string> = {};
    if (!editForm.type) errs.type = "Service type is required";
    if (!editForm.asset.trim()) errs.asset = "Asset is required";
    if (Object.keys(errs).length) { setEditErrors(errs); return; }
    setBreakdowns((prev) =>
      prev.map((b) =>
        b.id === selectedBreakdown.id
          ? {
              ...b,
              title: `${editForm.type} - ${editForm.asset}`,
              type: editForm.type,
              asset: editForm.asset,
              serviceProvider: editForm.serviceProvider,
              cost: Number(editForm.cost) || 0,
              date: editForm.date,
              status: editForm.status,
            }
          : b
      )
    );
    setEditOpen(false);
    toast.success("Service record updated successfully");
  };

  // Delete handlers
  const openDelete = (bd: BreakdownRecord) => {
    setSelectedBreakdown(bd);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedBreakdown) return;
    setBreakdowns((prev) => prev.filter((b) => b.id !== selectedBreakdown.id));
    setDeleteOpen(false);
    toast.success("Service record deleted successfully");
  };

  // Incident submit
  const handleIncidentSubmit = () => {
    const errs: Record<string, string> = {};
    if (!incidentForm.title.trim()) errs.title = "Title is required";
    if (!incidentForm.description.trim()) errs.description = "Description is required";
    if (Object.keys(errs).length) { setIncidentErrors(errs); return; }
    const report: IncidentReport = {
      id: `inc-${Date.now()}`,
      title: incidentForm.title,
      description: incidentForm.description,
      fiveWhys: [...incidentForm.whys],
      correctiveAction: incidentForm.correctiveAction,
      preventiveAction: incidentForm.preventiveAction,
      severity: incidentForm.severity,
      createdAt: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
    };
    setIncidentReports((prev) => [report, ...prev]);
    setIncidentForm({
      time: "",
      severity: "Low",
      title: "",
      description: "",
      whys: ["", "", "", "", ""],
      correctiveAction: "",
      preventiveAction: "",
    });
    setIncidentErrors({});
    setIncidentSubmitted(true);
    toast.success("Incident report submitted successfully");
    setTimeout(() => setIncidentSubmitted(false), 3000);
  };

  const updateWhy = (index: number, value: string) => {
    setIncidentForm((prev) => {
      const whys = [...prev.whys];
      whys[index] = value;
      return { ...prev, whys };
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <Wrench className="h-4 w-4 text-slate-500" />
        <h2 className="text-[15px] font-semibold text-slate-800">Breakdown</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-3">
        <KPICard title="Total Services" value={totalServices} icon={Wrench} color="blue" />
        <KPICard
          title="Total Cost"
          value={`\u20B9${totalCost.toLocaleString("en-IN")}`}
          icon={IndianRupee}
          color="green"
        />
        <KPICard title="Service Providers" value={serviceProviders} icon={Users} color="slate" />
      </div>

      {/* Recent Services */}
      <Card className="shadow-none border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[13px] font-semibold text-slate-700">
                Recent Services ({breakdowns.length})
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => { setAddErrors({}); setShowAddModal(true); }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Service
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {breakdowns.map((bd) => (
              <div
                key={bd.id}
                className="flex items-start justify-between p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-medium text-[12px] text-slate-800">
                      {bd.title}
                    </span>
                    <StatusBadge
                      status={bd.type}
                      variant={
                        bd.type === "Inspection"
                          ? "info"
                          : bd.type === "Replacement"
                          ? "danger"
                          : "warning"
                      }
                    />
                    <StatusBadge
                      status={bd.status}
                      variant={
                        bd.status === "Completed"
                          ? "success"
                          : bd.status === "In Progress"
                          ? "warning"
                          : "neutral"
                      }
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {bd.serviceProvider} - {bd.date}
                  </p>
                  <p className="text-[10px] text-slate-300">
                    Asset: {bd.asset} | ID: {bd.serviceId}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[12px] font-semibold text-slate-700">
                      {"\u20B9"}{bd.cost.toLocaleString("en-IN")}
                    </p>
                    <p className="text-[10px] text-slate-400">{bd.status}</p>
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openView(bd)} title="View">
                      <Eye className="h-3 w-3 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(bd)} title="Edit">
                      <Pencil className="h-3 w-3 text-slate-400" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openDelete(bd)} title="Delete">
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {breakdowns.length === 0 && (
              <div className="text-center py-6 text-slate-400 text-[12px]">No service records found.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incident/Accident Reporting Section */}
      <Card className="shadow-none border-slate-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-[13px] font-semibold text-slate-700">
                Incident/Accident Reporting
              </h3>
              <p className="text-[10px] text-slate-400">
                Report and track details of incidents or accidents related to assets
              </p>
            </div>
          </div>

          {/* Sub-tabs */}
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setActiveSubTab("report")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeSubTab === "report"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <AlertTriangle className="h-3 w-3" />
              Report Incident
            </button>
            <button
              onClick={() => setActiveSubTab("view")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                activeSubTab === "view"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <FileText className="h-3 w-3" />
              View Reports ({incidentReports.length})
            </button>
          </div>

          {activeSubTab === "report" && (
            <div className="space-y-3">
              {/* Success message */}
              {incidentSubmitted && (
                <div className="flex items-center gap-2 p-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <p className="text-[12px] text-green-700 font-medium">Incident report submitted successfully!</p>
                </div>
              )}

              {/* RCA Header */}
              <div className="flex items-start gap-2 mb-2">
                <div className="rounded-full bg-orange-100 p-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
                </div>
                <div>
                  <h4 className="text-[12px] font-semibold text-slate-700">
                    Root Cause Analysis (RCA) Report
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    Conduct 5-Why analysis to identify root causes and preventive actions
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">
                    Time of Incident *
                  </Label>
                  <Input
                    type="datetime-local"
                    value={incidentForm.time}
                    onChange={(e) => setIncidentForm({ ...incidentForm, time: e.target.value })}
                    className="h-9 text-[13px] rounded-lg"
                  />
                </div>
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Severity Level *</Label>
                  <select
                    value={incidentForm.severity}
                    onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value as IncidentReport["severity"] })}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Title *</Label>
                <Input
                  value={incidentForm.title}
                  onChange={(e) => { setIncidentForm({ ...incidentForm, title: e.target.value }); clearIncidentError("title"); }}
                  placeholder="RCA report title"
                  className={`h-9 text-[13px] rounded-lg ${incidentErrors.title ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {incidentErrors.title && <p className="text-[10px] text-red-500 mt-0.5">{incidentErrors.title}</p>}
              </div>

              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Description *</Label>
                <textarea
                  value={incidentForm.description}
                  onChange={(e) => { setIncidentForm({ ...incidentForm, description: e.target.value }); clearIncidentError("description"); }}
                  className={`flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] min-h-[60px] ${incidentErrors.description ? "border-red-400 ring-1 ring-red-200" : ""}`}
                  placeholder="Detailed description of the problem..."
                />
                {incidentErrors.description && <p className="text-[10px] text-red-500 mt-0.5">{incidentErrors.description}</p>}
              </div>

              {/* 5 Whys */}
              {[
                { num: 1, label: "What happened?" },
                { num: 2, label: "Why did that happen?" },
                { num: 3, label: "Why did that happen?" },
                { num: 4, label: "Why did that happen?" },
                { num: 5, label: "Why did that happen? (Root Cause)" },
              ].map((why) => (
                <div key={why.num}>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">
                    Why #{why.num} - {why.label}
                  </Label>
                  <Input
                    value={incidentForm.whys[why.num - 1]}
                    onChange={(e) => updateWhy(why.num - 1, e.target.value)}
                    placeholder={
                      why.num === 1
                        ? "First level of analysis - immediate cause..."
                        : why.num === 5
                        ? "Fifth level of analysis - ROOT CAUSE..."
                        : `${["Second", "Third", "Fourth"][why.num - 2]} level of analysis...`
                    }
                    className="h-9 text-[13px] rounded-lg"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Corrective Action</Label>
                  <textarea
                    value={incidentForm.correctiveAction}
                    onChange={(e) => setIncidentForm({ ...incidentForm, correctiveAction: e.target.value })}
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] min-h-[50px]"
                    placeholder="Actions to correct the current situation..."
                  />
                </div>
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Preventive Action</Label>
                  <textarea
                    value={incidentForm.preventiveAction}
                    onChange={(e) => setIncidentForm({ ...incidentForm, preventiveAction: e.target.value })}
                    className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px] min-h-[50px]"
                    placeholder="Actions to prevent recurrence..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="sm"
                  className="h-7 text-[11px] bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleIncidentSubmit}
                >
                  Submit Incident Report
                </Button>
              </div>
            </div>
          )}

          {activeSubTab === "view" && (
            <div className="space-y-2">
              {incidentReports.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[12px]">
                  No incident reports found.
                </div>
              ) : (
                incidentReports.map((report) => (
                  <div key={report.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-medium text-[12px] text-slate-800">{report.title}</span>
                          <StatusBadge
                            status={report.severity}
                            variant={
                              report.severity === "Critical"
                                ? "danger"
                                : report.severity === "High"
                                ? "danger"
                                : report.severity === "Medium"
                                ? "warning"
                                : "info"
                            }
                          />
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{report.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">{report.createdAt}</span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {report.fiveWhys.filter(Boolean).map((why, i) => (
                        <p key={i} className="text-[10px] text-slate-500">
                          <span className="font-medium text-slate-600">Why #{i + 1}:</span> {why}
                        </p>
                      ))}
                    </div>
                    {(report.correctiveAction || report.preventiveAction) && (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {report.correctiveAction && (
                          <div className="bg-blue-50 rounded p-1.5">
                            <p className="text-[10px] font-medium text-blue-700">Corrective Action</p>
                            <p className="text-[10px] text-blue-600">{report.correctiveAction}</p>
                          </div>
                        )}
                        {report.preventiveAction && (
                          <div className="bg-green-50 rounded p-1.5">
                            <p className="text-[10px] font-medium text-green-700">Preventive Action</p>
                            <p className="text-[10px] text-green-600">{report.preventiveAction}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== ADD SERVICE DIALOG ===== */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add Service Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Service Type *</Label>
                <select
                  value={addForm.type}
                  onChange={(e) => { setAddForm({ ...addForm, type: e.target.value as BreakdownRecord["type"] }); clearAddError("type"); }}
                  className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${addErrors.type ? "border-red-400 ring-1 ring-red-200" : ""}`}
                >
                  <option value="">Select type</option>
                  <option value="Inspection">Inspection</option>
                  <option value="Replacement">Replacement</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                {addErrors.type && <p className="text-[10px] text-red-500 mt-0.5">{addErrors.type}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Asset *</Label>
                <Input
                  value={addForm.asset}
                  onChange={(e) => { setAddForm({ ...addForm, asset: e.target.value }); clearAddError("asset"); }}
                  placeholder="Enter asset name"
                  className={`h-9 text-[13px] rounded-lg ${addErrors.asset ? "border-red-400 ring-1 ring-red-200" : ""}`}
                />
                {addErrors.asset && <p className="text-[10px] text-red-500 mt-0.5">{addErrors.asset}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Service Provider</Label>
                <Input
                  value={addForm.serviceProvider}
                  onChange={(e) => setAddForm({ ...addForm, serviceProvider: e.target.value })}
                  placeholder="Provider name"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Cost ({"\u20B9"})</Label>
                <Input
                  type="number"
                  value={addForm.cost}
                  onChange={(e) => setAddForm({ ...addForm, cost: e.target.value })}
                  placeholder="0"
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Date</Label>
                <Input
                  type="date"
                  value={addForm.date}
                  onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
                <select
                  value={addForm.status}
                  onChange={(e) => setAddForm({ ...addForm, status: e.target.value as BreakdownRecord["status"] })}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAddModal(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button onClick={handleAdd} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                Add Service
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW SERVICE DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Service Details</DialogTitle>
          </DialogHeader>
          {selectedBreakdown && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Service ID</span>
                  <span className="text-[13px] font-semibold text-slate-800">{selectedBreakdown.serviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Type</span>
                  <StatusBadge
                    status={selectedBreakdown.type}
                    variant={selectedBreakdown.type === "Inspection" ? "info" : selectedBreakdown.type === "Replacement" ? "danger" : "warning"}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Status</span>
                  <StatusBadge
                    status={selectedBreakdown.status}
                    variant={selectedBreakdown.status === "Completed" ? "success" : selectedBreakdown.status === "In Progress" ? "warning" : "neutral"}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Asset</span>
                  <span className="text-[13px] text-slate-700">{selectedBreakdown.asset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Service Provider</span>
                  <span className="text-[13px] text-slate-700">{selectedBreakdown.serviceProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Cost</span>
                  <span className="text-[13px] font-semibold text-slate-800">{"\u20B9"}{selectedBreakdown.cost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Date</span>
                  <span className="text-[13px] text-slate-700">{selectedBreakdown.date}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Title</p>
                <p className="text-[13px] text-slate-800">{selectedBreakdown.title}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT SERVICE DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Edit Service - {selectedBreakdown?.serviceId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Service Type *</Label>
                <select
                  value={editForm.type}
                  onChange={(e) => { setEditForm({ ...editForm, type: e.target.value as BreakdownRecord["type"] }); clearEditError("type"); }}
                  className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${editErrors.type ? "border-red-400 ring-1 ring-red-200" : ""}`}
                >
                  <option value="Inspection">Inspection</option>
                  <option value="Replacement">Replacement</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
                {editErrors.type && <p className="text-[10px] text-red-500 mt-0.5">{editErrors.type}</p>}
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as BreakdownRecord["status"] })}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Asset *</Label>
              <Input
                value={editForm.asset}
                onChange={(e) => { setEditForm({ ...editForm, asset: e.target.value }); clearEditError("asset"); }}
                className={`h-9 text-[13px] rounded-lg ${editErrors.asset ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {editErrors.asset && <p className="text-[10px] text-red-500 mt-0.5">{editErrors.asset}</p>}
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
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Cost ({"\u20B9"})</Label>
                <Input
                  type="number"
                  value={editForm.cost}
                  onChange={(e) => setEditForm({ ...editForm, cost: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleEdit} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Update Service</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Service Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete service <span className="font-semibold">{selectedBreakdown?.serviceId}</span>? This action cannot be undone.
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
