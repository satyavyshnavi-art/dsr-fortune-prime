"use client";

import { useState, useEffect } from "react";
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
import { PlusCircle, Trash2, Upload, Save } from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskPriority, TaskFrequency } from "./mock-data";
import {
  DEPARTMENTS,
  SOURCES,
  EMPLOYEES,
  PRIORITY_LABELS,
  FREQUENCY_LABELS,
  MOCK_TEMPLATES,
} from "./mock-data";

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  facilityId?: string | null;
  onSave?: (data: Record<string, unknown>) => void;
  onSaved?: () => void | Promise<void>;
}

export function TaskForm({ open, onOpenChange, task, facilityId, onSave, onSaved }: TaskFormProps) {
  const isEditing = !!task;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [source, setSource] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isExternal, setIsExternal] = useState(false);
  const [category, setCategory] = useState("");
  const [frequency, setFrequency] = useState<TaskFrequency>("one_time");
  const [checklistItems, setChecklistItems] = useState<string[]>([""]);
  const [fileName, setFileName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill on edit
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDepartment(task.department);
      setPriority(task.priority);
      setSource(task.source);
      setDueDate(task.dueDate);
      setAssignedTo(task.assignedTo);
      setIsExternal(task.isExternal);
      setCategory(task.category);
      setFrequency(task.frequency);
      setChecklistItems(
        task.checklist.length > 0
          ? task.checklist.map((c) => c.label)
          : [""]
      );
    } else {
      resetForm();
    }
  }, [task, open]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDepartment("");
    setPriority("medium");
    setSource("");
    setDueDate("");
    setAssignedTo("");
    setIsExternal(false);
    setCategory("");
    setFrequency("one_time");
    setChecklistItems([""]);
    setFileName("");
    setSelectedTemplate("");
    setErrors({});
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tmpl = MOCK_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setTitle(tmpl.title);
      setDescription(tmpl.description);
      setCategory(tmpl.category);
      setFrequency(tmpl.frequency);
      setIsExternal(tmpl.isExternal);
      setChecklistItems(tmpl.sopChecklist.length > 0 ? [...tmpl.sopChecklist] : [""]);
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

  const handleFileSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx";
    input.onchange = () => {
      if (input.files?.[0]) {
        setFileName(input.files[0].name);
      }
    };
    input.click();
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!department) newErrors.department = "Department is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    if (!isEditing && !facilityId) {
      newErrors.facility = "Facility not loaded yet. Please try again.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    const body: Record<string, unknown> = {
      title: title.trim(),
      description: description.trim(),
      department,
      priority,
      source,
      dueDate,
      assignedTo,
      isExternal,
      category,
      frequency,
      sopChecklist: checklistItems.filter((item) => item.trim() !== ""),
      attachment: fileName || null,
    };
    if (!isEditing && facilityId) body.facilityId = facilityId;

    try {
      const url = isEditing ? `/api/v1/tasks/${task.id}` : "/api/v1/tasks";
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(isEditing ? "Task updated successfully" : "Task created successfully");
        if (onSaved) await onSaved();
      } else {
        const err = await res.json().catch(() => ({}));
        const message =
          err?.error?.message || err?.error || `Request failed (${res.status})`;
        toast.error(typeof message === "string" ? message : "Request failed");
        return;
      }
    } catch {
      toast.error("Network error — could not reach API");
      return;
    }

    if (onSave) onSave(body);
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-5 max-h-[85vh] overflow-y-auto" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800">
            {isEditing ? "Edit Task" : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Template Selector */}
          {!isEditing && (
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Pre-fill from Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_TEMPLATES.map((tmpl) => (
                    <SelectItem key={tmpl.id} value={tmpl.id} className="text-[12px]">
                      {tmpl.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Task title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => { const n = { ...prev }; delete n.title; return n; });
              }}
              className={`h-9 text-[13px] rounded-lg ${errors.title ? "border-red-400 ring-1 ring-red-200" : ""}`}
            />
            {errors.title && <p className="text-[10px] text-red-500 mt-0.5">{errors.title}</p>}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Description</Label>
            <Textarea
              placeholder="Describe the task..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[60px] text-[13px] rounded-lg"
            />
          </div>

          {/* Two-column fields */}
          <div className="grid grid-cols-2 gap-3">
            {/* Department */}
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={department}
                onValueChange={(v) => {
                  setDepartment(v);
                  if (errors.department) setErrors((prev) => { const n = { ...prev }; delete n.department; return n; });
                }}
              >
                <SelectTrigger className={`h-9 text-[13px] rounded-lg ${errors.department ? "border-red-400 ring-1 ring-red-200" : ""}`}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d} value={d} className="text-[12px]">{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && <p className="text-[10px] text-red-500 mt-0.5">{errors.department}</p>}
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([key, label]) => (
                    <SelectItem key={key} value={key} className="text-[12px]">{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Source */}
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Source</Label>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {SOURCES.map((s) => (
                    <SelectItem key={s} value={s} className="text-[12px]">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  if (errors.dueDate) setErrors((prev) => { const n = { ...prev }; delete n.dueDate; return n; });
                }}
                className={`h-9 text-[13px] rounded-lg ${errors.dueDate ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.dueDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.dueDate}</p>}
            </div>

            {/* Assigned To */}
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">Assigned To</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger className="h-9 text-[13px] rounded-lg">
                  <SelectValue placeholder="Select employee..." />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYEES.map((emp) => (
                    <SelectItem key={emp} value={emp} className="text-[12px]">{emp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Frequency */}
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

          {/* Category */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Category</Label>
            <Input
              placeholder="e.g. Cleaning, Repair, Inspection"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 text-[13px] rounded-lg"
            />
          </div>

          {/* Is External Toggle */}
          <div className="flex items-center gap-3">
            <Switch
              checked={isExternal}
              onCheckedChange={setIsExternal}
              size="sm"
            />
            <Label className="text-[12px] text-slate-600">External Task (involves vendor/third party)</Label>
          </div>

          {/* SOP Checklist Builder */}
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

          {/* File Upload */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Attachment (optional)</Label>
            <div
              onClick={handleFileSelect}
              className="flex items-center gap-2 border border-dashed border-slate-300 rounded-lg px-3 py-2.5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <Upload className="h-4 w-4 text-slate-400" />
              <span className="text-[12px] text-slate-500">
                {fileName || "Click to upload a file (PDF, images, docs)"}
              </span>
            </div>
          </div>

          {!isEditing && !facilityId && (
            <p className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-1">
              Loading facility… create will be enabled in a moment.
            </p>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!isEditing && !facilityId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-[13px] rounded-lg disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5 mr-1.5" />
            {isEditing ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
