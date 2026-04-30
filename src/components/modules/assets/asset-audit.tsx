"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatusBadge, EmptyState } from "@/components/shared";
import {
  auditDashboardSummary,
  mockAuditScans,
  mockAuditConfigs,
  mockCategories,
  type AuditScanRecord,
  type AuditConfig,
} from "./mock-data";
import {
  BarChart3,
  AlertTriangle,
  X,
  Bell,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Clock,
  Loader2,
  Settings2,
  BarChart2,
  Upload,
  ScanLine,
  ClipboardList,
  Pencil,
  Eye,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

type AuditSubTab =
  | "dashboard"
  | "audit-report"
  | "scan-report"
  | "my-scans"
  | "analytics"
  | "bulk-generator"
  | "audit-config";

export function AssetAudit() {
  const [activeSubTab, setActiveSubTab] = useState<AuditSubTab>("dashboard");

  // --- Audit Config state ---
  const [configs, setConfigs] = useState<AuditConfig[]>([...mockAuditConfigs]);
  const [showAddConfigModal, setShowAddConfigModal] = useState(false);
  const [newConfigCategory, setNewConfigCategory] = useState("");
  const [newConfigFrequency, setNewConfigFrequency] = useState("");
  const [editConfigId, setEditConfigId] = useState<string | null>(null);
  const [editConfigCategory, setEditConfigCategory] = useState("");
  const [editConfigFrequency, setEditConfigFrequency] = useState("");
  const [showEditConfigModal, setShowEditConfigModal] = useState(false);
  const [deleteConfigId, setDeleteConfigId] = useState<string | null>(null);
  const [showDeleteConfigModal, setShowDeleteConfigModal] = useState(false);

  // --- Real assets from API ---
  interface RealAsset { id: string; name: string; assetTag: string; categoryId: string; location: string; status: string; }
  interface RealCategory { id: string; name: string; }
  const [realAssets, setRealAssets] = useState<RealAsset[]>([]);
  const [realCategories, setRealCategories] = useState<RealCategory[]>([]);

  // Fetch real assets + categories on mount
  useEffect(() => {
    fetch("/api/v1/assets").then(r => r.json()).then(d => { if (Array.isArray(d)) setRealAssets(d); }).catch(() => {});
    fetch("/api/v1/assets/categories").then(r => r.json()).then(d => { if (Array.isArray(d)) setRealCategories(d); }).catch(() => {});
  }, []);

  // --- Scan state ---
  const [showStartScanModal, setShowStartScanModal] = useState(false);
  const [showIndividualScanModal, setShowIndividualScanModal] = useState(false);
  const [scanCategory, setScanCategory] = useState("");
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [individualAssetId, setIndividualAssetId] = useState("");
  const [individualCondition, setIndividualCondition] = useState<"Good" | "Needs Repair" | "Damaged">("Good");
  const [individualNotes, setIndividualNotes] = useState("");

  // --- Scan Report view detail ---
  const [viewScanOpen, setViewScanOpen] = useState(false);
  const [selectedScan, setSelectedScan] = useState<AuditScanRecord | null>(null);

  // --- Bulk Generator file picker ---
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [bulkFileName, setBulkFileName] = useState<string>("");

  // --- Notifications ---
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [dismissedAlerts, setDismissedAlerts] = useState<number[]>([]);

  // --- Scan results tracking (keyed by asset ID to prevent duplicates) ---
  const [scanResults, setScanResults] = useState<AuditScanRecord[]>([...mockAuditScans]);
  const [scannedAssetIds, setScannedAssetIds] = useState<Set<string>>(new Set());

  // Derived counts
  const scannedCount = scannedAssetIds.size;
  const scannedCategories: Record<string, number> = {};
  scannedAssetIds.forEach(assetId => {
    const asset = realAssets.find(a => a.id === assetId);
    if (asset) {
      const cat = realCategories.find(c => c.id === asset.categoryId);
      if (cat) {
        scannedCategories[cat.name] = (scannedCategories[cat.name] || 0) + 1;
      }
    }
  });

  // Get assets for a category (for scan dialog)
  const getAssetsForCategory = (catName: string) => {
    const cat = realCategories.find(c => c.name === catName);
    if (!cat) return [];
    return realAssets.filter(a => a.categoryId === cat.id);
  };

  // Individual scan handler
  const handleIndividualScan = () => {
    if (!individualAssetId) {
      toast.error("Please select an asset to scan");
      return;
    }
    const asset = realAssets.find(a => a.id === individualAssetId);
    if (!asset) return;
    const cat = realCategories.find(c => c.id === asset.categoryId);

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) +
      ", " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const newScan: AuditScanRecord = {
      id: `scan-${Date.now()}`,
      assetTag: asset.assetTag,
      assetName: asset.name,
      blockType: asset.location?.split(",")[0] || "-",
      block: "-",
      floor: "-",
      condition: individualCondition,
      scannedBy: "Demo User",
      dateTime: dateStr,
      notes: individualNotes,
      gps: true,
    };

    setScanResults(prev => [newScan, ...prev]);
    setScannedAssetIds(prev => new Set([...prev, individualAssetId]));
    toast.success(`Scanned: ${asset.name} (${asset.assetTag}) — ${individualCondition}`);
    setShowIndividualScanModal(false);
    setIndividualAssetId("");
    setIndividualCondition("Good");
    setIndividualNotes("");
  };

  const handleAddConfig = () => {
    if (!newConfigCategory || !newConfigFrequency) {
      toast.error("Please select both category and frequency");
      return;
    }
    const newConfig: AuditConfig = {
      id: `ac-${Date.now()}`,
      category: newConfigCategory,
      frequency: newConfigFrequency as AuditConfig["frequency"],
      created: new Date().toLocaleDateString("en-GB"),
    };
    setConfigs((prev) => [...prev, newConfig]);
    setNewConfigCategory("");
    setNewConfigFrequency("");
    setShowAddConfigModal(false);
    toast.success("Audit config added");
  };

  const openEditConfig = (cfg: AuditConfig) => {
    setEditConfigId(cfg.id);
    setEditConfigCategory(cfg.category);
    setEditConfigFrequency(cfg.frequency);
    setShowEditConfigModal(true);
  };

  const handleEditConfig = () => {
    if (!editConfigId || !editConfigCategory || !editConfigFrequency) return;
    setConfigs((prev) =>
      prev.map((c) =>
        c.id === editConfigId
          ? { ...c, category: editConfigCategory, frequency: editConfigFrequency as AuditConfig["frequency"] }
          : c
      )
    );
    setShowEditConfigModal(false);
    toast.success("Audit config updated");
  };

  const openDeleteConfig = (cfg: AuditConfig) => {
    setDeleteConfigId(cfg.id);
    setShowDeleteConfigModal(true);
  };

  const handleDeleteConfig = () => {
    if (!deleteConfigId) return;
    setConfigs((prev) => prev.filter((c) => c.id !== deleteConfigId));
    setShowDeleteConfigModal(false);
    toast.success("Audit config deleted");
  };

  const handleStartScan = () => {
    if (!scanCategory) {
      toast.error("Please select a category to scan");
      return;
    }
    setScanning(true);
    setScanProgress(0);
    setScanComplete(false);
  };

  useEffect(() => {
    if (!scanning) return;
    if (scanProgress >= 100) {
      setScanning(false);
      setScanComplete(true);
      // Add scan results using REAL assets from DB
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) + ", " + now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      const catAssets = getAssetsForCategory(scanCategory).filter(a => !scannedAssetIds.has(a.id));
      const newScans: AuditScanRecord[] = catAssets.map((asset) => ({
        id: `scan-${Date.now()}-${asset.id.slice(0, 8)}`,
        assetTag: asset.assetTag,
        assetName: asset.name,
        blockType: asset.location?.split(",")[0] || "-",
        block: "-",
        floor: "-",
        condition: "Good" as const,
        scannedBy: "Demo User",
        dateTime: dateStr,
        notes: "",
        gps: true,
      }));
      if (newScans.length > 0) {
        setScanResults(prev => [...newScans, ...prev]);
        setScannedAssetIds(prev => {
          const next = new Set(prev);
          catAssets.forEach(a => next.add(a.id));
          return next;
        });
        toast.success(`Scan complete! ${newScans.length} real assets scanned in ${scanCategory}`);
      } else {
        toast.info(`All assets in ${scanCategory} have already been scanned`);
      }
      return;
    }
    const timer = setTimeout(() => {
      setScanProgress((prev) => Math.min(prev + Math.floor(Math.random() * 18) + 5, 100));
    }, 300);
    return () => clearTimeout(timer);
  }, [scanning, scanProgress]);

  const openViewScan = (scan: AuditScanRecord) => {
    setSelectedScan(scan);
    setViewScanOpen(true);
  };

  const subTabs: { id: AuditSubTab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "audit-report", label: "Audit Report", icon: ClipboardList },
    { id: "scan-report", label: "Scan Report", icon: ScanLine },
    { id: "my-scans", label: "My Scans", icon: ScanLine },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "bulk-generator", label: "Bulk Generator", icon: Plus },
    { id: "audit-config", label: "Audit Config", icon: Settings2 },
  ];

  const visibleAlerts = auditDashboardSummary.pendingAlerts.filter(
    (_, i) => !dismissedAlerts.includes(i)
  );

  return (
    <div className="space-y-3">
      {/* Sub Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-100 pb-1.5 overflow-x-auto">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors ${
                activeSubTab === tab.id
                  ? "bg-orange-50 text-orange-700 border border-orange-200"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Actions: Scan buttons + Notifications */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          <Button
            size="sm"
            className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setScanCategory("");
              setScanProgress(0);
              setScanning(false);
              setScanComplete(false);
              setShowStartScanModal(true);
            }}
          >
            <ScanLine className="h-3 w-3 mr-1" />
            Bulk Scan Category
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px] px-2.5"
            onClick={() => {
              setIndividualAssetId("");
              setIndividualCondition("Good");
              setIndividualNotes("");
              setShowIndividualScanModal(true);
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            Scan Individual Asset
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className={`h-7 text-[11px] px-2.5 ${notificationsEnabled ? "bg-green-50 border-green-200 text-green-700" : ""}`}
          onClick={() => {
            setNotificationsEnabled(!notificationsEnabled);
            toast.success(notificationsEnabled ? "Notifications disabled" : "Notifications enabled — you'll be alerted for pending audits");
          }}
        >
          <Bell className="h-3 w-3 mr-1" />
          {notificationsEnabled ? "Notifications On" : "Enable Notifications"}
        </Button>
      </div>

      {/* Pending Alerts */}
      <div className="space-y-1.5">
        {visibleAlerts.map((alert, i) => {
          const origIdx = auditDashboardSummary.pendingAlerts.indexOf(alert);
          return (
            <div
              key={i}
              className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-orange-500 shrink-0" />
                <div>
                  <p className="text-[12px] font-medium text-slate-700">
                    {alert.count} assets pending -- {alert.category}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                    Monthly audit ends in 4 days ({alert.deadline}) - {alert.scanned} scanned
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => {
                  setDismissedAlerts((prev) => [...prev, origIdx]);
                  toast.info("Alert dismissed");
                }}
              >
                <X className="h-3 w-3 text-slate-400" />
              </Button>
            </div>
          );
        })}
      </div>

      {/* Content based on sub-tab */}
      {activeSubTab === "dashboard" && <AuditDashboard extraScanned={scannedCount} scannedCategories={scannedCategories} realAssets={realAssets} realCategories={realCategories} />}
      {activeSubTab === "audit-report" && <AuditReport />}
      {activeSubTab === "scan-report" && <ScanReport onView={openViewScan} scans={scanResults} />}
      {activeSubTab === "my-scans" && <MyScans />}
      {activeSubTab === "analytics" && <ScanAnalytics scans={scanResults} />}
      {activeSubTab === "bulk-generator" && (
        <BulkGenerator
          fileRef={bulkFileRef}
          fileName={bulkFileName}
          onFileChange={(name) => setBulkFileName(name)}
        />
      )}
      {activeSubTab === "audit-config" && (
        <AuditConfigTab
          configs={configs}
          onAdd={() => setShowAddConfigModal(true)}
          onEdit={openEditConfig}
          onDelete={openDeleteConfig}
        />
      )}

      {/* ===== START SCAN DIALOG ===== */}
      <Dialog open={showStartScanModal} onOpenChange={setShowStartScanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Start Asset Scan</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            {!scanning && !scanComplete && (
              <>
                <div>
                  <Label className="text-[12px] text-slate-600 mb-1.5 block">Asset Category *</Label>
                  <select
                    value={scanCategory}
                    onChange={(e) => setScanCategory(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                  >
                    <option value="">Select category</option>
                    {(realCategories.length > 0 ? realCategories : mockCategories).map((cat) => {
                      const catAssets = getAssetsForCategory(cat.name);
                      const unscanned = catAssets.filter(a => !scannedAssetIds.has(a.id)).length;
                      return (
                        <option key={cat.id} value={cat.name} disabled={unscanned === 0 && catAssets.length > 0}>
                          {cat.name} ({unscanned}/{catAssets.length} remaining)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="outline" onClick={() => setShowStartScanModal(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
                  <Button
                    onClick={handleStartScan}
                    disabled={!scanCategory}
                    className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ScanLine className="h-3.5 w-3.5 mr-1.5" /> Begin Scan
                  </Button>
                </div>
              </>
            )}
            {scanning && (
              <div className="space-y-3 py-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <p className="text-[13px] text-slate-700">Scanning <span className="font-medium">{scanCategory}</span> assets...</p>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 text-center">{scanProgress}% complete</p>
              </div>
            )}
            {scanComplete && (
              <div className="space-y-3 py-2 text-center">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                <p className="text-[14px] font-semibold text-slate-700">Scan Complete</p>
                <p className="text-[12px] text-slate-500">
                  Successfully scanned all <span className="font-medium">{scanCategory}</span> assets.
                </p>
                <Button
                  onClick={() => setShowStartScanModal(false)}
                  className="h-9 text-[13px] rounded-lg bg-green-600 hover:bg-green-700 text-white"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== INDIVIDUAL SCAN DIALOG ===== */}
      <Dialog open={showIndividualScanModal} onOpenChange={setShowIndividualScanModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Scan Individual Asset</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Select Asset *</Label>
              <select
                value={individualAssetId}
                onChange={(e) => setIndividualAssetId(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Choose an asset...</option>
                {realCategories.map(cat => {
                  const catAssets = realAssets.filter(a => a.categoryId === cat.id);
                  if (catAssets.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={cat.name}>
                      {catAssets.map(asset => (
                        <option key={asset.id} value={asset.id} disabled={scannedAssetIds.has(asset.id)}>
                          {asset.name} ({asset.assetTag}) {scannedAssetIds.has(asset.id) ? "✓ Scanned" : ""}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Condition *</Label>
              <div className="flex gap-2">
                {(["Good", "Needs Repair", "Damaged"] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => setIndividualCondition(c)}
                    className={`flex-1 h-9 rounded-lg border text-[12px] font-medium transition-colors ${
                      individualCondition === c
                        ? c === "Good" ? "border-green-400 bg-green-50 text-green-700"
                          : c === "Needs Repair" ? "border-amber-400 bg-amber-50 text-amber-700"
                          : "border-red-400 bg-red-50 text-red-700"
                        : "border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Notes (optional)</Label>
              <textarea
                value={individualNotes}
                onChange={(e) => setIndividualNotes(e.target.value)}
                placeholder="Add observation notes..."
                rows={2}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]"
              />
            </div>
            {individualAssetId && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                <p className="text-[11px] text-blue-700">
                  Asset: <span className="font-semibold">{realAssets.find(a => a.id === individualAssetId)?.name}</span>
                  {" · "}Tag: <span className="font-semibold">{realAssets.find(a => a.id === individualAssetId)?.assetTag}</span>
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowIndividualScanModal(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button
                onClick={handleIndividualScan}
                disabled={!individualAssetId}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Record Scan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW SCAN DETAIL DIALOG ===== */}
      <Dialog open={viewScanOpen} onOpenChange={setViewScanOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Scan Details</DialogTitle>
          </DialogHeader>
          {selectedScan && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Asset Tag</span>
                  <span className="text-[13px] font-medium text-slate-700">{selectedScan.assetTag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Asset Name</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.assetName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Block Type</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.blockType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Block</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Floor</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.floor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Condition</span>
                  {selectedScan.condition ? (
                    <StatusBadge
                      status={selectedScan.condition}
                      variant={
                        selectedScan.condition === "Good"
                          ? "success"
                          : selectedScan.condition === "Needs Repair"
                          ? "warning"
                          : selectedScan.condition === "Damaged"
                          ? "danger"
                          : "neutral"
                      }
                    />
                  ) : (
                    <span className="text-[12px] text-slate-300">Not recorded</span>
                  )}
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Scanned By</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.scannedBy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Date & Time</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.dateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">GPS</span>
                  <span className="text-[13px] text-slate-700">{selectedScan.gps ? "Available" : "Not available"}</span>
                </div>
              </div>
              {selectedScan.notes && (
                <div>
                  <p className="text-[11px] text-slate-400 mb-1">Notes</p>
                  <p className="text-[13px] text-slate-700">{selectedScan.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== ADD CONFIG DIALOG ===== */}
      <Dialog open={showAddConfigModal} onOpenChange={setShowAddConfigModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add Audit Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Category *</Label>
              <select
                value={newConfigCategory}
                onChange={(e) => setNewConfigCategory(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Frequency *</Label>
              <select
                value={newConfigFrequency}
                onChange={(e) => setNewConfigFrequency(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Select frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowAddConfigModal(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleAddConfig}
                disabled={!newConfigCategory || !newConfigFrequency}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Config
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== EDIT CONFIG DIALOG ===== */}
      <Dialog open={showEditConfigModal} onOpenChange={setShowEditConfigModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Edit Audit Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Category *</Label>
              <select
                value={editConfigCategory}
                onChange={(e) => setEditConfigCategory(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Frequency *</Label>
              <select
                value={editConfigFrequency}
                onChange={(e) => setEditConfigFrequency(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Select frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowEditConfigModal(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleEditConfig}
                disabled={!editConfigCategory || !editConfigFrequency}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Update Config
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIG DIALOG ===== */}
      <Dialog open={showDeleteConfigModal} onOpenChange={setShowDeleteConfigModal}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Configuration</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete this audit configuration? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfigModal(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleDeleteConfig} className="h-9 text-[13px] rounded-lg bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -------- Sub-tab components --------

function AuditDashboard({ extraScanned = 0, scannedCategories = {}, realAssets = [], realCategories = [] }: { extraScanned?: number; scannedCategories?: Record<string, number>; realAssets?: { id: string; categoryId: string }[]; realCategories?: { id: string; name: string }[] }) {
  // Use real asset counts if available
  const totalAssets = realAssets.length > 0 ? realAssets.length : auditDashboardSummary.totalAssets;
  const scanned = extraScanned;
  const remaining = Math.max(0, totalAssets - scanned);
  const overallCompletion = totalAssets > 0 ? Math.min(100, Math.round((scanned / totalAssets) * 100)) : 0;

  // Build category data from real DB categories + real asset counts
  const categories = realCategories.length > 0
    ? realCategories.map((cat) => {
        const catAssetCount = realAssets.filter(a => a.categoryId === cat.id).length;
        const catScanned = scannedCategories[cat.name] || 0;
        return {
          name: cat.name,
          frequency: "Monthly",
          period: "01 Apr - 01 May",
          total: catAssetCount,
          scanned: catScanned,
        };
      }).filter(c => c.total > 0)
    : auditDashboardSummary.categories.map((cat) => ({
        ...cat,
        scanned: cat.scanned + (scannedCategories[cat.name] || 0),
      }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
          <BarChart3 className="h-3.5 w-3.5" />
          Scan Progress — Current Period
        </h3>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toast.info("Refreshing scan data...")}>
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Progress KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="border border-slate-200 rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-green-600">{totalAssets}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Total Assets</p>
        </div>
        <div className="border border-slate-200 rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-blue-600">{scanned}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Scanned</p>
        </div>
        <div className="border border-slate-200 rounded-lg px-3 py-2.5 text-center">
          <p className="text-xl font-bold text-red-600">{remaining}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Remaining</p>
        </div>
      </div>

      {/* Overall Completion */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[12px] text-slate-500">Overall Completion</p>
          <p className="text-[12px] font-medium text-slate-700">{overallCompletion}%</p>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${overallCompletion}%` }}
          />
        </div>
      </div>

      {/* Category breakdown — updates live after scans */}
      <div className="space-y-3">
        {categories.map((cat) => {
          const catRemaining = Math.max(0, cat.total - cat.scanned);
          const catPct = cat.total > 0 ? Math.min(100, Math.round((cat.scanned / cat.total) * 100)) : 0;
          return (
            <div key={cat.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[12px] font-medium text-slate-600">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({cat.frequency})</span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400">
                    <Clock className="h-2.5 w-2.5 inline mr-0.5" />
                    {cat.period}
                  </p>
                  <p className="text-[11px] font-medium text-slate-600">{cat.scanned}/{cat.total}</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${catPct}%` }}
                />
              </div>
              {catRemaining > 0 ? (
                <p className="text-[10px] text-red-500">
                  <AlertTriangle className="h-2.5 w-2.5 inline mr-0.5" />
                  {catRemaining} assets remaining
                </p>
              ) : (
                <p className="text-[10px] text-green-600">
                  <CheckCircle className="h-2.5 w-2.5 inline mr-0.5" />
                  All assets scanned
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditReport() {
  const [category, setCategory] = useState("all");
  const [year, setYear] = useState("2026");
  const [loaded, setLoaded] = useState(false);

  // Simulated audit report data
  const reportData = [
    { assetTag: "GV-EARTH-01", name: "Earthing Pit - Main Building", jan: "present", feb: "present", mar: "present", apr: "na" },
    { assetTag: "GV-EARTH-02", name: "Earthing Pit - Tower A", jan: "present", feb: "missed", mar: "present", apr: "na" },
    { assetTag: "GV-FIRE-001", name: "FAPA PANELRFD", jan: "present", feb: "present", mar: "needs_repair", apr: "na" },
    { assetTag: "GV-FIRE-002", name: "Fire Hydrant System", jan: "present", feb: "present", mar: "damaged", apr: "na" },
    { assetTag: "GV-LIFT-001", name: "Passenger Lift", jan: "present", feb: "present", mar: "present", apr: "na" },
  ];

  const filteredReport = category === "all"
    ? reportData
    : reportData.filter((r) => {
        if (category === "Earthing pits") return r.assetTag.includes("EARTH");
        if (category === "Fire safety") return r.assetTag.includes("FIRE");
        if (category === "Lifts") return r.assetTag.includes("LIFT");
        return true;
      });

  const statusColor: Record<string, string> = {
    present: "bg-green-500",
    missed: "bg-yellow-500",
    na: "bg-slate-300",
    needs_repair: "bg-red-500",
    damaged: "bg-orange-500",
    missing: "bg-purple-500",
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
        <ClipboardList className="h-3.5 w-3.5" />
        Audit Report
      </h3>

      <div className="flex items-end gap-2">
        <div>
          <Label className="text-[12px] text-slate-600 mb-1.5 block">Category</Label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-9 w-40 rounded-lg border border-input bg-transparent px-3 text-[13px]"
          >
            <option value="all">All Categories</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="text-[12px] text-slate-600 mb-1.5 block">Year</Label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="flex h-9 w-20 rounded-lg border border-input bg-transparent px-3 text-[13px]"
          >
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
        <Button
          size="sm"
          className="h-9 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setLoaded(true)}
        >
          Load Report
        </Button>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-slate-400">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Present</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500" /> Missed</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-300" /> N/A</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Needs Repair</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-orange-500" /> Damaged</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Missing</span>
      </div>

      {!loaded ? (
        <EmptyState
          icon={ClipboardList}
          title='Click "Load Report" to view audit data'
        />
      ) : (
        <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Asset Tag</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Name</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3 text-center">Jan</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3 text-center">Feb</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3 text-center">Mar</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3 text-center">Apr</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReport.map((row) => (
                <TableRow key={row.assetTag} className="hover:bg-slate-50/50">
                  <TableCell className="text-[12px] py-2 px-3 font-medium text-slate-700">{row.assetTag}</TableCell>
                  <TableCell className="text-[12px] py-2 px-3 text-slate-600">{row.name}</TableCell>
                  {[row.jan, row.feb, row.mar, row.apr].map((s, idx) => (
                    <TableCell key={idx} className="text-center py-2 px-3">
                      <div className={`w-3 h-3 rounded-full mx-auto ${statusColor[s] || "bg-slate-200"}`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function ScanReport({ onView, scans }: { onView: (scan: AuditScanRecord) => void; scans: AuditScanRecord[] }) {
  // Use scans from props (live state, includes new scan results)
  const [filterDate, setFilterDate] = useState("");

  const filteredScans = filterDate
    ? scans.filter((s) => s.dateTime.includes(filterDate))
    : scans;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
            <ScanLine className="h-3.5 w-3.5" />
            Scan Report
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{filteredScans.length} records found</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Input
            type="date"
            className="w-32 h-7 text-[11px]"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <Button size="sm" className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-3 w-3 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Asset Tag</TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Asset Name</TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Condition</TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Scanned By</TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Date & Time</TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">GPS</TableHead>
              <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredScans.map((scan) => (
              <TableRow key={scan.id} className="hover:bg-slate-50/50">
                <TableCell className="text-[12px] py-2 px-3 font-medium text-slate-700">{scan.assetTag}</TableCell>
                <TableCell className="text-[12px] py-2 px-3 text-slate-600">{scan.assetName}</TableCell>
                <TableCell className="text-[12px] py-2 px-3">
                  {scan.condition ? (
                    <StatusBadge
                      status={scan.condition}
                      variant={
                        scan.condition === "Good"
                          ? "success"
                          : scan.condition === "Needs Repair"
                          ? "warning"
                          : scan.condition === "Damaged"
                          ? "danger"
                          : "neutral"
                      }
                    />
                  ) : (
                    <span className="text-[10px] text-slate-300">-</span>
                  )}
                </TableCell>
                <TableCell className="text-[12px] py-2 px-3 text-slate-500">{scan.scannedBy}</TableCell>
                <TableCell className="text-[12px] py-2 px-3 text-slate-500">{scan.dateTime}</TableCell>
                <TableCell className="text-[12px] py-2 px-3">
                  {scan.gps ? (
                    <span className="text-green-500 text-sm">&#9679;</span>
                  ) : (
                    <span className="text-slate-300 text-[10px]">-</span>
                  )}
                </TableCell>
                <TableCell className="text-[12px] py-2 px-3">
                  <button
                    onClick={() => onView(scan)}
                    className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function MyScans() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
          <ScanLine className="h-3.5 w-3.5" />
          My Scan History
        </h3>
        <Input type="date" className="w-32 h-7 text-[11px]" placeholder="Select date" />
      </div>

      <EmptyState
        icon={Loader2}
        title="No scans found."
        description="Your scan history will appear here."
      />
    </div>
  );
}

function ScanAnalytics({ scans = mockAuditScans }: { scans?: AuditScanRecord[] }) {
  const [analyticsYear, setAnalyticsYear] = useState("2026");

  // Mock monthly scan counts
  const monthlyData = [0, 0, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...monthlyData, 1);

  // Condition breakdown from mock scans
  const goodCount = scans.filter((s) => s.condition === "Good").length;
  const emptyCount = scans.filter((s) => !s.condition).length;
  const totalScans = scans.length;

  const complianceData = [
    { name: "Earthing pits", rate: 13, expected: "1/10" },
    { name: "Fire safety", rate: 1, expected: "1/120" },
    { name: "Lifts", rate: 0, expected: "0/30" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
          <BarChart2 className="h-3.5 w-3.5" />
          Scan Analytics
        </h3>
        <select
          value={analyticsYear}
          onChange={(e) => setAnalyticsYear(e.target.value)}
          className="flex h-7 w-20 rounded-lg border border-input bg-transparent px-2 text-[11px]"
        >
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Monthly Scans Chart */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <h4 className="text-[12px] font-semibold text-slate-600 mb-2">Monthly Scans</h4>
            <div className="h-[130px] flex items-end gap-1">
              {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((month, i) => (
                <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all"
                    style={{ height: `${monthlyData[i] > 0 ? Math.max((monthlyData[i] / maxVal) * 100, 8) : 0}%` }}
                  />
                  {monthlyData[i] > 0 && (
                    <span className="text-[8px] text-slate-600 font-medium">{monthlyData[i]}</span>
                  )}
                  <span className="text-[8px] text-slate-400 mt-0.5">{month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Condition Breakdown */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <h4 className="text-[12px] font-semibold text-slate-600 mb-2">Condition Breakdown</h4>
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Good</span>
                  <span className="font-medium text-slate-700">{goodCount} ({totalScans > 0 ? Math.round((goodCount / totalScans) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${totalScans > 0 ? (goodCount / totalScans) * 100 : 0}%` }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-slate-500">Not Recorded</span>
                  <span className="font-medium text-slate-700">{emptyCount} ({totalScans > 0 ? Math.round((emptyCount / totalScans) * 100) : 0}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full bg-slate-400 rounded-full" style={{ width: `${totalScans > 0 ? (emptyCount / totalScans) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Compliance */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <h4 className="text-[12px] font-semibold text-slate-600 mb-2">Category Compliance Rate</h4>
            <div className="space-y-2.5">
              {complianceData.map((cat) => (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">{cat.name}</span>
                    <span className="font-medium text-slate-700">{cat.rate}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-0.5">
                    <div
                      className={`h-full rounded-full ${cat.rate > 10 ? "bg-green-500" : "bg-red-500"}`}
                      style={{ width: `${Math.max(cat.rate, 2)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">{cat.expected} expected scans</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Scanners */}
        <Card className="shadow-none border-slate-200">
          <CardContent className="p-3">
            <h4 className="text-[12px] font-semibold text-slate-600 mb-2">Top Scanners</h4>
            <div className="flex items-center justify-between text-[12px]">
              <div className="flex items-center gap-1.5">
                <span className="text-yellow-500 font-bold text-[11px]">1</span>
                <span className="text-slate-600">Unknown</span>
              </div>
              <span className="font-medium text-slate-700">{mockAuditScans.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function BulkGenerator({
  fileRef,
  fileName,
  onFileChange,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  fileName: string;
  onFileChange: (name: string) => void;
}) {
  const [bulkTab, setBulkTab] = useState<"excel" | "pattern">("excel");
  const [bulkCategory, setBulkCategory] = useState("");
  const [patternCategory, setPatternCategory] = useState("");
  const [patternName, setPatternName] = useState("");
  const [patternStart, setPatternStart] = useState("1");
  const [patternCount, setPatternCount] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");

  const handleFileClick = () => {
    fileRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    onFileChange(file?.name || "");
  };

  const handlePatternGenerate = () => {
    if (!patternCategory || !patternName || !patternCount) return;
    const count = parseInt(patternCount);
    const start = parseInt(patternStart) || 1;
    setGeneratedMessage(`Successfully generated ${count} assets: ${patternName.replace("{n}", String(start))} to ${patternName.replace("{n}", String(start + count - 1))}`);
    setTimeout(() => setGeneratedMessage(""), 4000);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Bulk Asset Generator
      </h3>

      {generatedMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-[12px] text-green-700">
          <CheckCircle className="h-3.5 w-3.5 inline mr-1.5" />
          {generatedMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
        <button
          onClick={() => setBulkTab("excel")}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded ${
            bulkTab === "excel"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Upload className="h-3 w-3" />
          Excel Upload
        </button>
        <button
          onClick={() => setBulkTab("pattern")}
          className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded ${
            bulkTab === "pattern"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-slate-400 hover:text-slate-600"
          }`}
        >
          <Plus className="h-3 w-3" />
          Pattern Generator
        </button>
      </div>

      {bulkTab === "excel" && (
        <div className="space-y-3">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Category *</Label>
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Excel File * (.xlsx)</Label>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-9 text-[11px]" onClick={handleFileClick}>
                  Choose file
                </Button>
                <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                  {fileName || "No file chosen"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
            <p className="text-[11px] font-medium text-blue-800">Required Excel columns:</p>
            <p className="text-[10px] text-blue-600 mt-0.5">
              Category, Asset Tag, Facility, Block Type, Block, Floor, Equipment
            </p>
            <p className="text-[9px] text-blue-400 mt-0.5">
              S.No column is optional and will be ignored.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button
              size="sm"
              className="h-7 text-[11px] bg-green-600 hover:bg-green-700 text-white"
              disabled={!bulkCategory || !fileName}
            >
              <Upload className="h-3 w-3 mr-1" />
              Upload & Create Assets
            </Button>
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              <Download className="h-3 w-3 mr-1" />
              Download Template
            </Button>
          </div>
        </div>
      )}

      {bulkTab === "pattern" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Category *</Label>
              <select
                value={patternCategory}
                onChange={(e) => setPatternCategory(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Naming Pattern *</Label>
              <Input
                placeholder="e.g., Fire_Extinguisher_{n}"
                value={patternName}
                onChange={(e) => setPatternName(e.target.value)}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Start Number</Label>
              <Input
                type="number"
                value={patternStart}
                onChange={(e) => setPatternStart(e.target.value)}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Count *</Label>
              <Input
                type="number"
                placeholder="How many assets?"
                value={patternCount}
                onChange={(e) => setPatternCount(e.target.value)}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>
          </div>
          <Button
            size="sm"
            className="h-7 text-[11px] bg-green-600 hover:bg-green-700 text-white"
            disabled={!patternCategory || !patternName || !patternCount}
            onClick={handlePatternGenerate}
          >
            Generate Assets
          </Button>
        </div>
      )}
    </div>
  );
}

function AuditConfigTab({
  configs,
  onAdd,
  onEdit,
  onDelete,
}: {
  configs: AuditConfig[];
  onAdd: () => void;
  onEdit: (cfg: AuditConfig) => void;
  onDelete: (cfg: AuditConfig) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold text-slate-700 flex items-center gap-1.5">
          <Settings2 className="h-3.5 w-3.5" />
          Audit Frequency Configuration
        </h3>
        <Button
          size="sm"
          className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={onAdd}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Config
        </Button>
      </div>

      {configs.length === 0 ? (
        <EmptyState
          icon={Settings2}
          title="No configurations found"
          description="Add your first audit frequency configuration."
        />
      ) : (
        <div className="rounded-md border border-slate-200 bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Category</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Frequency</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Created</TableHead>
                <TableHead className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider h-8 px-3">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((cfg) => (
                <TableRow key={cfg.id} className="hover:bg-slate-50/50">
                  <TableCell className="text-[12px] py-2 px-3 font-medium text-slate-700">{cfg.category}</TableCell>
                  <TableCell className="text-[12px] py-2 px-3">
                    <StatusBadge status={cfg.frequency} variant="info" />
                  </TableCell>
                  <TableCell className="text-[12px] py-2 px-3 text-slate-500">{cfg.created}</TableCell>
                  <TableCell className="text-[12px] py-2 px-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEdit(cfg)}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onDelete(cfg)}
                        className="h-6 w-6 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
