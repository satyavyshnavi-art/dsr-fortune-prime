"use client";

import { useState, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Edit, Eye, Save } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/hooks/use-api";
import type { TaskTemplate, TaskFrequency } from "./mock-data";
import { MOCK_TEMPLATES, FREQUENCY_LABELS } from "./mock-data";

interface TaskTemplatesProps {
  facilityId?: string | null;
  orgId?: string | null;
}

export function TaskTemplates({ facilityId, orgId }: TaskTemplatesProps) {
  const {
    data: apiTemplates,
    loading,
    error: apiError,
    fetchData: refetchTemplates,
  } = useApi<TaskTemplate[]>({
    url: "/api/v1/task-templates",
    initialData: [],
  });

  const templates: TaskTemplate[] = useMemo(() => {
    if (apiError) return MOCK_TEMPLATES;
    if (!apiTemplates || apiTemplates.length === 0) return MOCK_TEMPLATES;
    return apiTemplates;
  }, [apiTemplates, apiError]);

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<TaskFrequency>("one_time");
  const [isExternal, setIsExternal] = useState(false);
  const [checklistItems, setChecklistItems] = useState<string[]>([""]);

  const openCreateForm = () => {
    setEditingTemplate(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setFrequency("one_time");
    setIsExternal(false);
    setChecklistItems([""]);
    setShowForm(true);
  };

  const openEditForm = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setTitle(template.title);
    setDescription(template.description);
    setCategory(template.category);
    setFrequency(template.frequency);
    setIsExternal(template.isExternal);
    setChecklistItems(template.sopChecklist.length > 0 ? [...template.sopChecklist] : [""]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (editingTemplate) {
      try {
        const res = await fetch(`/api/v1/task-templates/${editingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            category,
            frequency,
            isExternal,
            sopChecklist: checklistItems.filter((item) => item.trim() !== ""),
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          const message =
            err?.error?.message || err?.error || `Request failed (${res.status})`;
          toast.error(typeof message === "string" ? message : "Request failed");
          return;
        }
        toast.success("Template updated");
        await refetchTemplates();
        setShowForm(false);
      } catch {
        toast.error("Network error — could not reach API");
      }
      return;
    }
    if (!facilityId || !orgId) {
      toast.error("Facility not loaded yet. Please try again.");
      return;
    }
    try {
      const res = await fetch("/api/v1/task-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orgId,
          facilityId,
          title: title.trim(),
          description: description.trim(),
          category,
          frequency,
          isExternal,
          sopChecklist: checklistItems.filter((item) => item.trim() !== ""),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err?.error?.message || err?.error || `Request failed (${res.status})`;
        toast.error(typeof message === "string" ? message : "Request failed");
        return;
      }
      toast.success("Template created");
      await refetchTemplates();
      setShowForm(false);
    } catch {
      toast.error("Network error — could not reach API");
    }
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, ""]);
  };

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length <= 1) return;
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, value: string) => {
    const updated = [...checklistItems];
    updated[index] = value;
    setChecklistItems(updated);
  };

  const columns: ColumnDef<TaskTemplate>[] = [
    {
      accessorKey: "title",
      header: "Template",
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-[12px] text-slate-900">{row.original.title}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[250px]">{row.original.description}</p>
        </div>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.category}</span>
      ),
    },
    {
      accessorKey: "frequency",
      header: "Frequency",
      cell: ({ row }) => (
        <StatusBadge status={row.original.frequency} variant="info" />
      ),
    },
    {
      id: "checklistCount",
      header: "Checklist Items",
      cell: ({ row }) => (
        <span className="text-[12px] text-slate-600">{row.original.sopChecklist.length}</span>
      ),
    },
    {
      accessorKey: "isExternal",
      header: "External",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.isExternal ? "Yes" : "No"}
          variant={row.original.isExternal ? "info" : "neutral"}
        />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => openEditForm(row.original)}
        >
          <Edit className="h-3 w-3 text-blue-500" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] text-slate-500">{templates.length} templates available</p>
        <Button
          className="h-8 text-[12px] px-3 gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          onClick={openCreateForm}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          New Template
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-teal-600" />
            <span className="text-[11px] text-slate-400">Loading templates...</span>
          </div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={templates}
          searchKey="title"
          searchPlaceholder="Search templates..."
          pageSize={10}
        />
      )}

      {apiError && (
        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-1.5">
          API unavailable — showing mock data.
        </p>
      )}

      {/* Template Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[520px] p-5 max-h-[85vh] overflow-y-auto" showCloseButton>
          <DialogHeader className="pb-1">
            <DialogTitle className="text-[14px] font-semibold text-slate-800">
              {editingTemplate ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Template title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-9 text-[13px] rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Description</Label>
              <Textarea
                placeholder="Describe the template..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[60px] text-[13px] rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-500">Category</Label>
                <Input
                  placeholder="e.g. Cleaning, Security"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-slate-500">Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v as TaskFrequency)}>
                  <SelectTrigger className="h-9 text-[13px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.entries(FREQUENCY_LABELS) as [TaskFrequency, string][]).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-[12px]">{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isExternal} onCheckedChange={setIsExternal} size="sm" />
              <Label className="text-[12px] text-slate-600">External (vendor/third party)</Label>
            </div>

            {/* Checklist Builder */}
            <div className="space-y-1.5">
              <Label className="text-[11px] text-slate-500">SOP Checklist</Label>
              <div className="space-y-1.5">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 w-5 text-right shrink-0">{index + 1}.</span>
                    <Input
                      placeholder="Checklist item..."
                      value={item}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                      className="h-8 text-[12px] rounded-lg flex-1"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-slate-400 hover:text-red-500"
                      onClick={() => removeChecklistItem(index)}
                      disabled={checklistItems.length <= 1}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className="h-7 text-[11px] px-2.5 gap-1"
                onClick={addChecklistItem}
              >
                <PlusCircle className="h-3 w-3" />
                Add Item
              </Button>
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white h-9 text-[13px] rounded-lg"
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
