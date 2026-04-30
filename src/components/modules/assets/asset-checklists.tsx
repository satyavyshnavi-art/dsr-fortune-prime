"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared";
import { mockCategories, type Checklist } from "./mock-data";
import { Search, Upload, Plus, Calendar, FileText, Trash2, Eye, X } from "lucide-react";
import { toast } from "sonner";

export function AssetChecklists() {
  const [selectedCategory, setSelectedCategory] = useState(
    mockCategories[4]?.id || ""
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(null);

  // Add checklist form
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadFileRef = useRef<HTMLInputElement>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

  const selectedCatName =
    mockCategories.find((c) => c.id === selectedCategory)?.name || "All";

  const filteredChecklists = checklists.filter((c) => {
    const matchCategory = !selectedCategory || c.categoryId === selectedCategory;
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
  };

  const handleAddChecklist = () => {
    const errs: Record<string, string> = {};
    if (!newName.trim()) errs.newName = "Checklist name is required";
    if (!newCategory) errs.newCategory = "Category is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const catObj = mockCategories.find((c) => c.id === newCategory);
    const newChecklist: Checklist = {
      id: `cl-${Date.now()}`,
      name: newName,
      categoryId: newCategory,
      categoryName: catObj?.name || "",
      fileUrl: newFileName || "",
      createdAt: new Date().toLocaleDateString("en-GB"),
    };
    setChecklists((prev) => [...prev, newChecklist]);
    setNewName("");
    setNewCategory("");
    setNewFileName("");
    setErrors({});
    setAddOpen(false);
    toast.success("Checklist added successfully");
  };

  const openView = (cl: Checklist) => {
    setSelectedChecklist(cl);
    setViewOpen(true);
  };

  const openDelete = (cl: Checklist) => {
    setSelectedChecklist(cl);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedChecklist) return;
    setChecklists((prev) => prev.filter((c) => c.id !== selectedChecklist.id));
    setDeleteOpen(false);
    toast.success("Checklist deleted successfully");
  };

  const handleUploadClick = () => {
    uploadFileRef.current?.click();
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Create a checklist from the uploaded file
    const catObj = mockCategories.find((c) => c.id === selectedCategory);
    const newChecklist: Checklist = {
      id: `cl-upload-${Date.now()}`,
      name: file.name.replace(/\.[^.]+$/, ""),
      categoryId: selectedCategory,
      categoryName: catObj?.name || "Uncategorized",
      fileUrl: file.name,
      createdAt: new Date().toLocaleDateString("en-GB"),
    };
    setChecklists((prev) => [...prev, newChecklist]);
    toast.success(`Checklist uploaded from "${file.name}"`);
    // Reset file input
    if (uploadFileRef.current) uploadFileRef.current.value = "";
  };

  const handleFormFileClick = () => {
    fileRef.current?.click();
  };

  const handleFormFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setNewFileName(file?.name || "");
  };

  return (
    <div className="space-y-4">
      {/* Hidden file inputs */}
      <input
        ref={uploadFileRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
        className="hidden"
        onChange={handleUploadFile}
      />
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFormFileSelect}
      />

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="flex h-9 w-44 rounded-lg border border-input bg-transparent px-3 text-[13px]"
          >
            <option value="">All Categories</option>
            {mockCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-56 h-9 text-[13px] rounded-lg"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="sm" className="h-7 text-[11px] px-2.5 bg-green-600 hover:bg-green-700 text-white">
            <Calendar className="h-3 w-3 mr-1" />
            Calendar View
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5"
            onClick={handleUploadClick}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
          <Button
            size="sm"
            className="h-7 text-[11px] px-2.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              setNewName("");
              setNewCategory(selectedCategory);
              setNewFileName("");
              setErrors({});
              setAddOpen(true);
            }}
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Checklist
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredChecklists.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No checklists found"
          description={`No checklists found${selectedCatName !== "All" ? ` for ${selectedCatName} category` : ""}.`}
          action={
            <button
              onClick={() => {
                setNewName("");
                setNewCategory(selectedCategory);
                setNewFileName("");
                setErrors({});
                setAddOpen(true);
              }}
              className="text-[11px] text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              Add your first checklist
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredChecklists.map((cl) => (
            <div
              key={cl.id}
              className="border border-slate-200 rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="p-1.5 bg-blue-50 rounded shrink-0">
                    <FileText className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-slate-700 truncate">{cl.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {cl.categoryName} | {cl.createdAt}
                    </p>
                    {cl.fileUrl && (
                      <p className="text-[10px] text-blue-500 mt-0.5 truncate">{cl.fileUrl}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 ml-2">
                  <button
                    onClick={() => openView(cl)}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                    title="View"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => openDelete(cl)}
                    className="h-6 w-6 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== ADD CHECKLIST DIALOG ===== */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Add Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-1">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Checklist Name *</Label>
              <Input
                value={newName}
                onChange={(e) => { setNewName(e.target.value); clearError("newName"); }}
                placeholder="Enter checklist name"
                className={`h-9 text-[13px] rounded-lg ${errors.newName ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.newName && <p className="text-[10px] text-red-500 mt-0.5">{errors.newName}</p>}
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Category *</Label>
              <select
                value={newCategory}
                onChange={(e) => { setNewCategory(e.target.value); clearError("newCategory"); }}
                className={`flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px] ${errors.newCategory ? "border-red-400 ring-1 ring-red-200" : ""}`}
              >
                <option value="">Select category</option>
                {mockCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.newCategory && <p className="text-[10px] text-red-500 mt-0.5">{errors.newCategory}</p>}
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">File (optional)</Label>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 text-[12px] rounded-lg" onClick={handleFormFileClick}>
                  Choose file
                </Button>
                <span className="text-[12px] text-slate-400 truncate max-w-[200px]">
                  {newFileName || "No file chosen"}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleAddChecklist}
                className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Checklist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== VIEW CHECKLIST DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Checklist Details</DialogTitle>
          </DialogHeader>
          {selectedChecklist && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Name</span>
                  <span className="text-[13px] font-medium text-slate-700">{selectedChecklist.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Category</span>
                  <span className="text-[13px] text-slate-700">{selectedChecklist.categoryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Created</span>
                  <span className="text-[13px] text-slate-700">{selectedChecklist.createdAt}</span>
                </div>
                {selectedChecklist.fileUrl && (
                  <div className="flex justify-between">
                    <span className="text-[11px] text-slate-400">File</span>
                    <span className="text-[13px] text-blue-600">{selectedChecklist.fileUrl}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CHECKLIST DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete <span className="font-semibold">&ldquo;{selectedChecklist?.name}&rdquo;</span>? This action cannot be undone.
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
