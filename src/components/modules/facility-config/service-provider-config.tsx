"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Truck, Plus, Pencil, Trash2, Loader2, Search, Phone, Mail, Tag } from "lucide-react";

type ServiceProvider = {
  id: string;
  name: string;
  contact: string | null;
  email: string | null;
  categories: string[] | null;
  createdAt: string;
};

const CATEGORY_OPTIONS = [
  "Electrical",
  "Plumbing",
  "HVAC",
  "Elevator",
  "Fire Safety",
  "Pest Control",
  "Gardening",
  "Security",
  "Housekeeping",
  "Civil Work",
  "Painting",
  "IT / Networking",
  "Waste Management",
  "Water Treatment",
];

const demoProviders: ServiceProvider[] = [
  { id: "demo-1", name: "ElectroCare Solutions Pvt Ltd", contact: "+91-9900100001", email: "ops@electrocare.in", categories: ["Electrical", "HVAC"], createdAt: "2026-01-05T09:00:00Z" },
  { id: "demo-2", name: "AquaFix Plumbing Services", contact: "+91-9900100002", email: "service@aquafix.in", categories: ["Plumbing", "Water Treatment"], createdAt: "2026-01-05T09:00:00Z" },
  { id: "demo-3", name: "SafeGuard Fire & Safety", contact: "+91-9900100003", email: "info@safeguardfs.com", categories: ["Fire Safety"], createdAt: "2026-01-10T09:00:00Z" },
  { id: "demo-4", name: "GreenScape Landscaping", contact: "+91-9900100004", email: "hello@greenscape.co.in", categories: ["Gardening"], createdAt: "2026-01-10T09:00:00Z" },
  { id: "demo-5", name: "PestShield India", contact: "+91-9900100005", email: "support@pestshield.in", categories: ["Pest Control"], createdAt: "2026-01-15T09:00:00Z" },
  { id: "demo-6", name: "LiftTech Elevators", contact: "+91-9900100006", email: "amc@lifttech.in", categories: ["Elevator"], createdAt: "2026-01-15T09:00:00Z" },
  { id: "demo-7", name: "CleanStar Facility Services", contact: "+91-9900100007", email: "ops@cleanstar.in", categories: ["Housekeeping", "Waste Management"], createdAt: "2026-02-01T09:00:00Z" },
  { id: "demo-8", name: "SecureVision Systems", contact: "+91-9900100008", email: "projects@securevision.com", categories: ["Security", "IT / Networking"], createdAt: "2026-02-01T09:00:00Z" },
  { id: "demo-9", name: "BuildRight Civil Contractors", contact: "+91-9900100009", email: "enquiry@buildright.in", categories: ["Civil Work", "Painting"], createdAt: "2026-02-10T09:00:00Z" },
  { id: "demo-10", name: "CoolBreeze HVAC Solutions", contact: "+91-9900100010", email: "service@coolbreeze.co.in", categories: ["HVAC"], createdAt: "2026-02-10T09:00:00Z" },
];

const emptyForm = {
  name: "",
  contact: "",
  email: "",
  categories: [] as string[],
};

export function ServiceProviderConfig() {
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<ServiceProvider | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/facilities")
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setFacilityId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/service-providers");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setProviders(Array.isArray(data) && data.length > 0 ? data : demoProviders);
    } catch {
      setProviders(demoProviders);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const filtered = providers.filter((p) => {
    if (catFilter !== "all") {
      const cats = Array.isArray(p.categories) ? p.categories : [];
      if (!cats.includes(catFilter)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.email?.toLowerCase().includes(q) ?? false);
    }
    return true;
  });

  const allCategories = [...new Set(providers.flatMap(p => Array.isArray(p.categories) ? p.categories : []))].sort();
  const isDemo = (id: string) => id.startsWith("demo-");

  const handleAdd = () => {
    setEditingProvider(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const handleEdit = (p: ServiceProvider) => {
    setEditingProvider(p);
    setForm({
      name: p.name,
      contact: p.contact || "",
      email: p.email || "",
      categories: Array.isArray(p.categories) ? p.categories : [],
    });
    setDialogOpen(true);
  };

  const toggleCategory = (cat: string) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(cat)
        ? f.categories.filter(c => c !== cat)
        : [...f.categories, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Provider name is required");
      return;
    }

    if (editingProvider && isDemo(editingProvider.id)) {
      setProviders(prev => prev.map(p => p.id === editingProvider.id ? { ...p, ...form } : p));
      toast.success("Provider updated");
      setDialogOpen(false);
      return;
    }

    setSaving(true);
    try {
      if (editingProvider) {
        const res = await fetch(`/api/v1/service-providers/${editingProvider.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("Provider updated");
      } else {
        const res = await fetch("/api/v1/service-providers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, facilityId }),
        });
        if (!res.ok) throw new Error();
        toast.success("Provider added");
      }
      await fetchProviders();
    } catch {
      const newProvider: ServiceProvider = {
        id: `demo-${Date.now()}`,
        ...form,
        createdAt: new Date().toISOString(),
      };
      if (editingProvider) {
        setProviders(prev => prev.map(p => p.id === editingProvider.id ? { ...newProvider, id: editingProvider.id } : p));
        toast.success("Provider updated (local)");
      } else {
        setProviders(prev => [...prev, newProvider]);
        toast.success("Provider added (local)");
      }
    } finally {
      setSaving(false);
      setDialogOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDemo(id)) {
      setProviders(prev => prev.filter(p => p.id !== id));
      toast.success("Provider deleted");
      setDeleteConfirmId(null);
      return;
    }
    try {
      const res = await fetch(`/api/v1/service-providers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Provider deleted");
      await fetchProviders();
    } catch {
      setProviders(prev => prev.filter(p => p.id !== id));
      toast.success("Provider deleted (local)");
    }
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold text-slate-800">Service Provider Management</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">{filtered.length} providers configured</p>
        </div>
        <Button size="sm" onClick={handleAdd} className="h-8 text-[12px] px-4 bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Provider
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-8 h-8 text-[12px]"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-transparent px-2 text-[12px]"
        >
          <option value="all">All Categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          <span className="ml-2 text-[13px] text-slate-500">Loading providers...</span>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No service providers found" description="Try adjusting your search or add a new provider." />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: "24%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "32%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Provider Name</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Contact</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Email</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-medium text-slate-400">Categories</th>
                <th className="text-center py-2.5 px-3 text-[11px] font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => {
                const cats = Array.isArray(p.categories) ? p.categories : [];
                return (
                  <tr key={p.id} className="hover:bg-slate-50/40 group">
                    <td className="py-3 px-3 text-[13px] text-slate-800 font-medium truncate">{p.name}</td>
                    <td className="py-3 px-3 text-[12px] text-slate-500">
                      {p.contact ? (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {p.contact}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-3 px-3 text-[12px] text-slate-500 truncate">
                      {p.email ? (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {p.email}
                        </span>
                      ) : "-"}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {cats.length > 0 ? cats.map(cat => (
                          <span key={cat} className="inline-block rounded bg-green-50 text-green-600 text-[10px] font-medium px-1.5 py-0.5">
                            {cat}
                          </span>
                        )) : <span className="text-[12px] text-slate-400">-</span>}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="p-1 rounded hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setDeleteConfirmId(p.id)} className="p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingProvider ? "Edit Service Provider" : "Add Service Provider"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1 block">Provider Name *</label>
              <Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Company name" className="text-[13px]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Contact</label>
                <Input value={form.contact} onChange={(e) => setForm(f => ({ ...f, contact: e.target.value }))} placeholder="+91-XXXXXXXXXX" className="text-[13px]" />
              </div>
              <div>
                <label className="text-[12px] font-medium text-slate-600 mb-1 block">Email</label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} placeholder="email@example.com" className="text-[13px]" />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-medium text-slate-600 mb-1.5 block">
                <Tag className="h-3 w-3 inline mr-1" />
                Service Categories
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_OPTIONS.map(cat => {
                  const selected = form.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-full text-[11px] font-medium px-2.5 py-1 border transition-colors ${
                        selected
                          ? "bg-blue-50 border-blue-200 text-blue-600"
                          : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="text-[13px]">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white text-[13px]">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
              {editingProvider ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Service Provider</DialogTitle>
          </DialogHeader>
          <p className="text-[13px] text-slate-600 py-2">Are you sure you want to delete this provider? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)} className="text-[13px]">Cancel</Button>
            <Button onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)} className="bg-red-600 hover:bg-red-700 text-white text-[13px]">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
