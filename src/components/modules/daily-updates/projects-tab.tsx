"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Eye,
  Pencil,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderKanban,
  Upload as UploadIcon,
} from "lucide-react";
import { projectsData, type Project } from "./mock-data";

export function ProjectsTab() {
  const [activeView, setActiveView] = useState<"list" | "add">("list");
  const [projects, setProjects] = useState(projectsData);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Action dialog states
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editForm, setEditForm] = useState({ name: "", manager: "", status: "", startDate: "", endDate: "" });

  const totalProjects = projects.length;
  const paginatedProjects = projects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(totalProjects / pageSize);

  // Action handlers
  const openView = (p: Project) => {
    setSelectedProject(p);
    setViewOpen(true);
  };

  const openEditDialog = (p: Project) => {
    setSelectedProject(p);
    // Parse dates from "13-Mar-26 - 17-Apr-26" format
    const dateParts = p.dates.split(" - ");
    setEditForm({
      name: p.name,
      manager: p.manager,
      status: p.status,
      startDate: dateParts[0] || "",
      endDate: dateParts[1] || "",
    });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!selectedProject) return;
    const dates = `${editForm.startDate} - ${editForm.endDate}`;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === selectedProject.id
          ? { ...p, name: editForm.name, manager: editForm.manager, status: editForm.status as Project["status"], dates }
          : p
      )
    );
    setEditOpen(false);
  };

  const handleDuplicate = (p: Project) => {
    const copy: Project = { ...p, id: `project-copy-${Date.now()}`, name: `${p.name} (Copy)` };
    setProjects((prev) => [copy, ...prev]);
  };

  const openDeleteDialog = (p: Project) => {
    setSelectedProject(p);
    setDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedProject) return;
    setProjects((prev) => prev.filter((p) => p.id !== selectedProject.id));
    setDeleteOpen(false);
  };

  // New project form
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    manager: "",
    startDate: "",
    endDate: "",
    status: "Planning",
    dependencies: "",
    approvalMechanism: "Single Level",
  });

  const [milestones, setMilestones] = useState([
    { description: "", targetDate: "" },
  ]);

  const addMilestone = () => {
    setMilestones([...milestones, { description: "", targetDate: "" }]);
  };

  const updateMilestone = (
    idx: number,
    field: "description" | "targetDate",
    value: string
  ) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );
  };

  const handleAddProject = () => {
    if (!newProject.name) return;
    const formatDate = (d: string) => {
      if (!d) return "—";
      const date = new Date(d);
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    };
    const dates = `${formatDate(newProject.startDate)} - ${formatDate(newProject.endDate)}`;
    setProjects((prev) => [
      {
        id: `project-${Date.now()}`,
        name: newProject.name,
        manager: newProject.manager || "Unassigned",
        dates,
        status: newProject.status as Project["status"],
      },
      ...prev,
    ]);
    setNewProject({
      name: "", description: "", manager: "", startDate: "", endDate: "",
      status: "Planning", dependencies: "", approvalMechanism: "Single Level",
    });
    setMilestones([{ description: "", targetDate: "" }]);
    setActiveView("list");
  };

  return (
    <div className="space-y-4">
      <h3 className="text-[15px] font-semibold text-slate-900">Projects</h3>

      {/* Sub-nav */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-0">
        <button
          onClick={() => setActiveView("list")}
          className={`flex items-center gap-1.5 px-1 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
            activeView === "list"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FolderKanban className="h-3.5 w-3.5" />
          View Projects
        </button>
        <button
          onClick={() => setActiveView("add")}
          className={`flex items-center gap-1.5 px-1 py-1.5 text-[12px] font-medium border-b-2 transition-colors ${
            activeView === "add"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Add New Project
        </button>
      </div>

      {activeView === "list" ? (
        <>
          {/* Projects Table */}
          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full table-fixed">
              <colgroup>
                <col style={{ width: "32%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "20%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">PROJECT NAME</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">MANAGER</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">DATES</th>
                  <th className="text-left py-3 px-3 text-[11px] font-medium text-slate-400">STATUS</th>
                  <th className="text-center py-3 px-3 text-[11px] font-medium text-slate-400">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paginatedProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50/40">
                    <td className="py-3.5 px-3 text-[13px] text-slate-800 font-medium truncate">{project.name}</td>
                    <td className="py-3.5 px-3 text-[13px] text-slate-400">{project.manager}</td>
                    <td className="py-3.5 px-3 text-[13px] text-slate-400">{project.dates}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge
                        status={project.status.replace(" ", "_").toLowerCase()}
                        variant={
                          project.status === "Completed"
                            ? "success"
                            : project.status === "In Progress"
                            ? "info"
                            : project.status === "On Hold"
                            ? "warning"
                            : "neutral"
                        }
                      />
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openView(project)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-blue-600 hover:bg-blue-50 transition-colors"
                          title="View"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditDialog(project)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(project)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
                          title="Duplicate"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(project)}
                          className="h-7 w-7 rounded-md flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-slate-400">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, totalProjects)} of {totalProjects} projects
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-7 text-[11px]"
              >
                <ChevronLeft className="h-3 w-3 mr-0.5" /> Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-7 w-7 text-[11px]"
                >
                  {page}
                </Button>
              ))}
              {totalPages > 3 && <span className="text-[11px] text-slate-400">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-7 text-[11px]"
              >
                Next <ChevronRight className="h-3 w-3 ml-0.5" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        /* Add New Project Form */
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h4 className="text-[14px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <FolderKanban className="h-4 w-4" />
            Add New Project
          </h4>
          <div className="space-y-3">
            {/* Row 1: Name + Manager */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Project Name *</Label>
                <Input
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Project Manager *</Label>
                <select
                  value={newProject.manager}
                  onChange={(e) => setNewProject({ ...newProject, manager: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                >
                  <option value="">Select a Manager</option>
                  <option value="Facility Manager">Facility Manager</option>
                  <option value="Operations Head">Operations Head</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Project Description *</Label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]"
              />
            </div>

            {/* Row 3: Start Date + End Date + Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Start Date *</Label>
                <Input
                  type="date"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject({ ...newProject, startDate: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">End Date *</Label>
                <Input
                  type="date"
                  value={newProject.endDate}
                  onChange={(e) => setNewProject({ ...newProject, endDate: e.target.value })}
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                >
                  <option value="Planning">Planning</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Milestones */}
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Milestones</Label>
              <div className="space-y-1.5">
                {milestones.map((ms, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      value={ms.description}
                      onChange={(e) => updateMilestone(idx, "description", e.target.value)}
                      placeholder="Milestone description"
                      className="flex-1 h-9 text-[13px] rounded-lg"
                    />
                    <Input
                      type="date"
                      value={ms.targetDate}
                      onChange={(e) => updateMilestone(idx, "targetDate", e.target.value)}
                      className="w-36 h-9 text-[13px] rounded-lg"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={addMilestone}
                className="mt-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-medium flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />
                Add Milestone
              </button>
            </div>

            {/* Dependencies + Approval */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Dependencies</Label>
                <Input
                  value={newProject.dependencies}
                  onChange={(e) => setNewProject({ ...newProject, dependencies: e.target.value })}
                  placeholder="List project dependencies..."
                  className="h-9 text-[13px] rounded-lg"
                />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Approval Mechanism *</Label>
                <select
                  value={newProject.approvalMechanism}
                  onChange={(e) => setNewProject({ ...newProject, approvalMechanism: e.target.value })}
                  className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]"
                >
                  <option value="Single Level">Single Level</option>
                  <option value="Multi Level">Multi Level</option>
                </select>
              </div>
            </div>

            {/* Upload Photos */}
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Upload Photos</Label>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 p-6 text-center">
                <UploadIcon className="h-6 w-6 text-slate-300 mb-1.5" />
                <p className="text-[12px] text-blue-600 font-medium">
                  Click to upload{" "}
                  <span className="text-slate-400 font-normal">or drag and drop</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Submit */}
            <Button onClick={handleAddProject} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-[13px] rounded-lg">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Project
            </Button>
          </div>
        </div>
      )}

      {/* ===== VIEW PROJECT DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Project Details</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Name</span>
                  <span className="text-[13px] font-semibold text-slate-800 text-right max-w-[60%]">{selectedProject.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Manager</span>
                  <span className="text-[13px] text-slate-700">{selectedProject.manager}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Dates</span>
                  <span className="text-[13px] text-slate-700">{selectedProject.dates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Status</span>
                  <StatusBadge
                    status={selectedProject.status.replace(" ", "_").toLowerCase()}
                    variant={
                      selectedProject.status === "Completed"
                        ? "success"
                        : selectedProject.status === "In Progress"
                        ? "info"
                        : selectedProject.status === "On Hold"
                        ? "warning"
                        : "neutral"
                    }
                  />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== EDIT PROJECT DIALOG ===== */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Project Name</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-9 text-[13px] rounded-lg" />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Manager</Label>
              <Input value={editForm.manager} onChange={(e) => setEditForm({ ...editForm, manager: e.target.value })} className="h-9 text-[13px] rounded-lg" />
            </div>
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Status</Label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })} className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 text-[13px]">
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">Start Date</Label>
                <Input value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} className="h-9 text-[13px] rounded-lg" placeholder="e.g. 13-Mar-26" />
              </div>
              <div>
                <Label className="text-[12px] text-slate-600 mb-1.5 block">End Date</Label>
                <Input value={editForm.endDate} onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })} className="h-9 text-[13px] rounded-lg" placeholder="e.g. 17-Apr-26" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setEditOpen(false)} className="h-9 text-[13px] rounded-lg">Cancel</Button>
              <Button onClick={handleEdit} className="h-9 text-[13px] rounded-lg bg-blue-600 hover:bg-blue-700 text-white">Update Project</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== DELETE CONFIRMATION DIALOG ===== */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Delete Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <p className="text-[13px] text-slate-600">
              Are you sure you want to delete <span className="font-semibold">&ldquo;{selectedProject?.name}&rdquo;</span>? This action cannot be undone.
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
