"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  mockCategories,
  mockAssets,
  type AssetCategory,
  type Asset,
} from "./mock-data";
import {
  Eye,
  Plus,
  Upload,
  Download,
  Settings2,
  QrCode,
  Pencil,
  Trash2,
  X,
  Zap,
  Wind,
  Flame,
  Container,
  PlugZap,
  Droplets,
  Cog,
  ArrowUpDown,
  Battery,
  Package,
  Copy,
  Check,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Wind,
  Flame,
  Container,
  PlugZap,
  Droplets,
  Cog,
  ArrowUpDown,
  Battery,
  Package,
};

function getCategoryIcon(iconName: string) {
  return iconMap[iconName] || Package;
}

export function AssetCategories() {
  const [categories, setCategories] = useState<AssetCategory[]>(mockCategories);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [addCategoryId, setAddCategoryId] = useState<string>("");

  // File picker refs
  const bulkUploadRef = useRef<HTMLInputElement>(null);
  const categoryUploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Fetch assets from API
  useEffect(() => {
    fetch("/api/v1/assets")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Asset[] = data.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            name: a.name as string,
            assetTag: (a.assetTag as string) || "",
            categoryId: a.categoryId as string,
            categoryName: (a.categoryName as string) || "",
            location: (a.location as string) || "",
            status: (a.status as "active" | "maintenance" | "inactive") || "active",
            maintenanceFrequency: (a.maintenanceFrequency as string) || "Monthly",
            lastChecked: (a.lastChecked as string) || "",
            serviceHistory: (a.serviceHistory as string) || "",
            qrCodeData: (a.qrCodeData as string) || `asset|${a.assetTag || a.id}`,
          }));
          setAssets(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch categories from API and build AssetCategory shape from raw + assets
  useEffect(() => {
    fetch("/api/v1/assets/categories")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const built: AssetCategory[] = data.map((cat: Record<string, unknown>) => {
            const catAssets = assets.filter((a) => a.categoryId === cat.id);
            const activeCount = catAssets.filter((a) => a.status === "active").length;
            const maintenanceCount = catAssets.filter((a) => a.status === "maintenance").length;
            const inactiveCount = catAssets.filter((a) => a.status === "inactive").length;
            const mostRecent = catAssets[catAssets.length - 1];
            return {
              id: cat.id as string,
              name: cat.name as string,
              icon: (cat.icon as string) || "Package",
              activeCount,
              maintenanceCount,
              inactiveCount,
              totalAssets: catAssets.length,
              mostRecentAsset: mostRecent
                ? { name: mostRecent.name, location: mostRecent.location }
                : { name: "-", location: "-" },
            };
          });
          setCategories(built);
        }
      })
      .catch(() => {});
  }, [assets]);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    assetTag: "",
    location: "",
    status: "active" as "active" | "maintenance" | "inactive",
    maintenanceFrequency: "Monthly",
    lastChecked: "",
    serviceHistory: "",
  });

  const openAddModal = (categoryId: string) => {
    setAddCategoryId(categoryId);
    setFormData({
      name: "",
      assetTag: "",
      location: "",
      status: "active",
      maintenanceFrequency: "Monthly",
      lastChecked: "",
      serviceHistory: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData({
      name: asset.name,
      assetTag: asset.assetTag,
      location: asset.location,
      status: asset.status,
      maintenanceFrequency: asset.maintenanceFrequency,
      lastChecked: asset.lastChecked,
      serviceHistory: asset.serviceHistory,
    });
    setShowEditModal(true);
  };

  const openQRModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowQRModal(true);
  };

  const handleAddAsset = async () => {
    const cat = categories.find((c) => c.id === addCategoryId);
    const localAsset: Asset = {
      id: `asset-${Date.now()}`,
      ...formData,
      categoryId: addCategoryId,
      categoryName: cat?.name || "",
      qrCodeData: `asset|${formData.assetTag}`,
    };

    try {
      const res = await fetch("/api/v1/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          assetTag: formData.assetTag,
          location: formData.location,
          status: formData.status,
          maintenanceFrequency: formData.maintenanceFrequency,
          lastChecked: formData.lastChecked || null,
          serviceHistory: formData.serviceHistory || null,
          categoryId: addCategoryId,
          qrCodeData: `asset|${formData.assetTag}`,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        const mapped: Asset = {
          id: created.id,
          name: created.name,
          assetTag: created.assetTag || "",
          categoryId: created.categoryId,
          categoryName: cat?.name || "",
          location: created.location || "",
          status: created.status || "active",
          maintenanceFrequency: created.maintenanceFrequency || "Monthly",
          lastChecked: created.lastChecked || "",
          serviceHistory: created.serviceHistory || "",
          qrCodeData: created.qrCodeData || `asset|${created.assetTag || created.id}`,
        };
        setAssets([...assets, mapped]);
        setShowAddModal(false);
        toast.success("Asset added successfully");
        return;
      }
    } catch {
      // Fall through to local-only
    }

    // Fallback: local state mutation
    setAssets([...assets, localAsset]);
    setShowAddModal(false);
    toast.success("Asset added locally");
  };

  const handleUpdateAsset = async () => {
    if (!selectedAsset) return;

    try {
      const res = await fetch(`/api/v1/assets/${selectedAsset.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          assetTag: formData.assetTag,
          location: formData.location,
          status: formData.status,
          maintenanceFrequency: formData.maintenanceFrequency,
          lastChecked: formData.lastChecked || null,
          serviceHistory: formData.serviceHistory || null,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAssets(
          assets.map((a) =>
            a.id === selectedAsset.id
              ? {
                  ...a,
                  name: updated.name || formData.name,
                  assetTag: updated.assetTag || formData.assetTag,
                  location: updated.location || formData.location,
                  status: updated.status || formData.status,
                  maintenanceFrequency: updated.maintenanceFrequency || formData.maintenanceFrequency,
                  lastChecked: updated.lastChecked || formData.lastChecked,
                  serviceHistory: updated.serviceHistory || formData.serviceHistory,
                }
              : a
          )
        );
        setShowEditModal(false);
        toast.success("Asset updated successfully");
        return;
      }
    } catch {
      // Fall through to local-only
    }

    // Fallback: local state mutation
    setAssets(
      assets.map((a) =>
        a.id === selectedAsset.id ? { ...a, ...formData } : a
      )
    );
    setShowEditModal(false);
    toast.success("Asset updated locally");
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      const res = await fetch(`/api/v1/assets/${assetId}`, { method: "DELETE" });
      if (res.ok) {
        setAssets(assets.filter((a) => a.id !== assetId));
        toast.success("Asset deleted successfully");
        return;
      }
    } catch {
      // Fall through to local-only
    }

    // Fallback: local state mutation
    setAssets(assets.filter((a) => a.id !== assetId));
    toast.success("Asset deleted locally");
  };

  const handleBulkUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`File "${file.name}" uploaded successfully`);
    if (bulkUploadRef.current) bulkUploadRef.current.value = "";
  };

  const handleCategoryUpload = (e: React.ChangeEvent<HTMLInputElement>, catId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.success(`File "${file.name}" uploaded for category`);
    const ref = categoryUploadRefs.current[catId];
    if (ref) ref.value = "";
  };

  const getCategoryAssets = (categoryId: string) =>
    assets.filter((a) => a.categoryId === categoryId);

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={bulkUploadRef}
        type="file"
        accept=".xlsx,.csv"
        className="hidden"
        onChange={handleBulkUpload}
      />

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          {categories.length} default categories + 1 custom categories
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5">
            <Download className="h-3 w-3 mr-1" />
            Download QRs
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5 bg-yellow-50 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
            onClick={() => bulkUploadRef.current?.click()}
          >
            <Upload className="h-3 w-3 mr-1" />
            Bulk Upload
          </Button>
          <Button size="sm" className="h-7 text-[11px] px-2.5 bg-green-600 hover:bg-green-700 text-white">
            <Plus className="h-3 w-3 mr-1" />
            Add Custom Category
          </Button>
          <Button variant="outline" size="icon" className="h-7 w-7">
            <Settings2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          return (
            <Card key={cat.id} className="shadow-none border-slate-200 hover:shadow-sm transition-shadow">
              <CardContent className="p-3">
                {/* Hidden file input per category */}
                <input
                  ref={(el) => { categoryUploadRefs.current[cat.id] = el; }}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleCategoryUpload(e, cat.id)}
                />
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-slate-100">
                      <Icon className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                    <h3 className="font-semibold text-[12px] text-slate-800">{cat.name}</h3>
                  </div>
                  <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-px rounded">
                    {cat.totalAssets}
                  </span>
                </div>

                {/* Status counts */}
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-2">
                  <span>
                    <span className="font-medium text-green-600">{cat.activeCount}</span> Active
                  </span>
                  <span>
                    <span className="font-medium text-yellow-600">{cat.maintenanceCount}</span> Maint.
                  </span>
                  <span>
                    <span className="font-medium text-red-500">{cat.inactiveCount}</span> Off
                  </span>
                </div>

                {/* Most Recent Asset */}
                <div className="border-t border-slate-100 pt-1.5 mb-2">
                  <p className="text-[12px] font-medium text-slate-600 truncate">
                    {cat.mostRecentAsset.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{cat.mostRecentAsset.location}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[10px] h-6 px-2"
                    onClick={() =>
                      setExpandedCategory(
                        expandedCategory === cat.id ? null : cat.id
                      )
                    }
                  >
                    <Eye className="h-3 w-3 mr-0.5" />
                    View
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 text-[10px] h-6 px-2 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => openAddModal(cat.id)}
                  >
                    <Plus className="h-3 w-3 mr-0.5" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[10px] h-6 px-2"
                    onClick={() => categoryUploadRefs.current[cat.id]?.click()}
                  >
                    <Upload className="h-3 w-3 mr-0.5" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assets in Category Dialog */}
      <Dialog
        open={!!expandedCategory}
        onOpenChange={(open) => {
          if (!open) setExpandedCategory(null);
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">
              Assets in &quot;{categories.find((c) => c.id === expandedCategory)?.name}&quot;
            </DialogTitle>
          </DialogHeader>

          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Name</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Tag</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Checked</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">QR</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expandedCategory &&
                  getCategoryAssets(expandedCategory).map((asset) => (
                    <TableRow key={asset.id} className="hover:bg-slate-50">
                      <TableCell className="text-sm font-medium text-slate-900">{asset.name}</TableCell>
                      <TableCell className="text-sm text-slate-500">{asset.assetTag}</TableCell>
                      <TableCell className="text-sm text-slate-500">{asset.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={asset.status} />
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {asset.maintenanceFrequency}
                      </TableCell>
                      <TableCell className="text-sm text-slate-500">{asset.lastChecked}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => openQRModal(asset)}
                        >
                          <QrCode className="h-4 w-4 text-slate-500" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditModal(asset)}
                          >
                            <Pencil className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleDeleteAsset(asset.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              {expandedCategory ? getCategoryAssets(expandedCategory).length : 0} assets found
            </p>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setExpandedCategory(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Asset Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              Add New Asset -{" "}
              {categories.find((c) => c.id === addCategoryId)?.name}
            </DialogTitle>
          </DialogHeader>
          <AssetForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleAddAsset}
            submitLabel="Add Asset"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Asset Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Asset - {selectedAsset?.name}</DialogTitle>
          </DialogHeader>
          <AssetForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdateAsset}
            submitLabel="Update Asset"
            onCancel={() => setShowEditModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">
              QR Code - {selectedAsset?.name}
            </DialogTitle>
          </DialogHeader>
          <QRCodeModal
            asset={selectedAsset}
            onClose={() => setShowQRModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------- QR Code Modal ----------
function QRCodeModal({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Generate a UUID-style asset identifier for the QR code
  const assetQRValue = asset
    ? `assetId=${asset.id}-${crypto.randomUUID().slice(0, 8)}-${asset.assetTag}`
    : "";

  const handleCopyInfo = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(assetQRValue);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for non-secure contexts
      const textarea = document.createElement("textarea");
      textarea.value = assetQRValue;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [assetQRValue]);

  const handleDownloadQR = useCallback(() => {
    if (!qrRef.current || !asset) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 512, 512);
        ctx.drawImage(img, 0, 0, 512, 512);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `QR-${asset.name.replace(/\s+/g, "-")}.png`;
      link.href = pngUrl;
      link.click();
      toast.success("QR code downloaded");
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  }, [asset]);

  if (!asset) return null;

  return (
    <div className="flex flex-col items-center py-4">
      {/* QR Code */}
      <div
        ref={qrRef}
        className="bg-white p-4 rounded-lg border-2 border-slate-200 mb-4"
      >
        <QRCodeSVG
          value={assetQRValue}
          size={200}
          level="M"
          includeMargin={false}
        />
      </div>

      {/* QR Code Info Label */}
      <p className="text-xs text-slate-400 font-medium mb-1">QR Code Info</p>
      <p className="text-[11px] text-slate-500 text-center mb-5 font-mono px-4 break-all leading-relaxed">
        {assetQRValue}
      </p>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          onClick={handleCopyInfo}
          className="bg-green-600 hover:bg-green-700 text-white px-5"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1.5" />
              Copy Info
            </>
          )}
        </Button>
        <Button
          size="sm"
          onClick={handleDownloadQR}
          className="bg-green-600 hover:bg-green-700 text-white px-5"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Download QR
        </Button>
      </div>
    </div>
  );
}

// ---------- Asset Form (shared between Add/Edit) ----------
function AssetForm({
  formData,
  setFormData,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  formData: {
    name: string;
    assetTag: string;
    location: string;
    status: "active" | "maintenance" | "inactive";
    maintenanceFrequency: string;
    lastChecked: string;
    serviceHistory: string;
  };
  setFormData: (data: typeof formData) => void;
  onSubmit: () => void;
  submitLabel: string;
  onCancel?: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Asset name is required";
    if (!formData.assetTag.trim()) newErrors.assetTag = "Asset tag is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit();
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <Label className="text-[11px] text-slate-500">Asset Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => { setFormData({ ...formData, name: e.target.value }); clearError("name"); }}
            placeholder="Enter name"
            className={`mt-0.5 h-8 text-[12px] ${errors.name ? "border-red-400 ring-1 ring-red-200" : ""}`}
          />
          {errors.name && <p className="text-[10px] text-red-500 mt-0.5">{errors.name}</p>}
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Asset Tag *</Label>
          <Input
            value={formData.assetTag}
            onChange={(e) => { setFormData({ ...formData, assetTag: e.target.value }); clearError("assetTag"); }}
            placeholder="Enter asset tag"
            className={`mt-0.5 h-8 text-[12px] ${errors.assetTag ? "border-red-400 ring-1 ring-red-200" : ""}`}
          />
          {errors.assetTag && <p className="text-[10px] text-red-500 mt-0.5">{errors.assetTag}</p>}
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Location *</Label>
          <Input
            value={formData.location}
            onChange={(e) => { setFormData({ ...formData, location: e.target.value }); clearError("location"); }}
            placeholder="Enter location"
            className={`mt-0.5 h-8 text-[12px] ${errors.location ? "border-red-400 ring-1 ring-red-200" : ""}`}
          />
          {errors.location && <p className="text-[10px] text-red-500 mt-0.5">{errors.location}</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <div>
          <Label className="text-[11px] text-slate-500">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(v) => {
              if (v) setFormData({
                ...formData,
                status: v as "active" | "maintenance" | "inactive",
              });
            }}
          >
            <SelectTrigger className="mt-0.5 h-8 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Maintenance Frequency</Label>
          <Select
            value={formData.maintenanceFrequency}
            onValueChange={(v) => {
              if (v) setFormData({ ...formData, maintenanceFrequency: v });
            }}
          >
            <SelectTrigger className="mt-0.5 h-8 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Daily">Daily</SelectItem>
              <SelectItem value="Weekly">Weekly</SelectItem>
              <SelectItem value="Monthly">Monthly</SelectItem>
              <SelectItem value="Quarterly">Quarterly</SelectItem>
              <SelectItem value="Half Yearly">Half Yearly</SelectItem>
              <SelectItem value="Yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-[11px] text-slate-500">Last Checked (Optional)</Label>
          <Input
            type="date"
            value={formData.lastChecked}
            onChange={(e) =>
              setFormData({ ...formData, lastChecked: e.target.value })
            }
            className="mt-0.5 h-8 text-[12px]"
          />
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-slate-500">Service History / Description</Label>
        <Textarea
          className="mt-0.5 min-h-[60px] text-[12px]"
          placeholder="Enter service history or notes..."
          value={formData.serviceHistory}
          onChange={(e) =>
            setFormData({ ...formData, serviceHistory: e.target.value })
          }
        />
      </div>

      <div className="flex justify-end gap-1.5 pt-1">
        {onCancel && (
          <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          size="sm"
          onClick={handleSubmit}
          className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white"
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}
