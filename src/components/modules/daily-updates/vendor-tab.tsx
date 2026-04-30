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
  Plus,
  Ticket,
  Upload as UploadIcon,
  FileText,
  Save,
  Search,
  Download,
  CheckCircle,
} from "lucide-react";
import { vendorTicketsData, type VendorTicket } from "./mock-data";

export function VendorTab() {
  const [tickets, setTickets] = useState<VendorTicket[]>(vendorTicketsData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Dialog states
  const [viewOpen, setViewOpen] = useState(false);
  const [resolveOpen, setResolveOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<VendorTicket | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  const [newTicket, setNewTicket] = useState({
    siteName: "GreenView Demo Park",
    department: "",
    description: "",
    expectedCompletion: "",
    priority: "Medium",
    status: "Open",
    serviceProvider: "",
    comments: "",
  });

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter !== "all" && t.status.toLowerCase().replace(" ", "_") !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority.toLowerCase() !== priorityFilter) return false;
    if (searchQuery && !t.description.toLowerCase().includes(searchQuery.toLowerCase()) && !t.ticketId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Action handlers
  const openView = (ticket: VendorTicket) => {
    setSelectedTicket(ticket);
    setViewOpen(true);
  };

  const openResolve = (ticket: VendorTicket) => {
    setSelectedTicket(ticket);
    setResolutionNotes("");
    setResolveOpen(true);
  };

  const handleResolve = () => {
    if (!selectedTicket) return;
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? { ...t, status: "Resolved" as const }
          : t
      )
    );
    setResolveOpen(false);
  };

  const handleCreateTicket = () => {
    if (!newTicket.department || !newTicket.description) return;
    const nextNum = tickets.length + 67; // continue from existing GV-VT-00XX numbering
    const id = `GV-VT-${String(nextNum).padStart(4, "0")}`;
    const created: VendorTicket = {
      id: `vt-${Date.now()}`,
      ticketId: id,
      department: newTicket.department,
      category: newTicket.department,
      priority: newTicket.priority as VendorTicket["priority"],
      status: newTicket.status as VendorTicket["status"],
      description: newTicket.description,
      serviceProvider: newTicket.serviceProvider || "Unassigned",
      assignedTo: "Unassigned",
      dueDate: newTicket.expectedCompletion
        ? new Date(newTicket.expectedCompletion).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/")
        : "—",
    };
    setTickets((prev) => [created, ...prev]);
    setNewTicket({
      siteName: "GreenView Demo Park",
      department: "",
      description: "",
      expectedCompletion: "",
      priority: "Medium",
      status: "Open",
      serviceProvider: "",
      comments: "",
    });
  };

  return (
    <div className="space-y-4">
      {/* Create Support Ticket Form */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <h4 className="text-[13px] font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Ticket className="h-4 w-4" />
          Create Support Ticket
        </h4>

        <div className="space-y-3">
          {/* Row 1: Site Name + Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px] text-slate-500">Site Name</Label>
              <Input value={newTicket.siteName} readOnly className="mt-1 h-8 text-[12px] bg-slate-50" />
            </div>
            <div>
              <Label className="text-[11px] text-slate-500">Department *</Label>
              <select
                value={newTicket.department}
                onChange={(e) => setNewTicket({ ...newTicket, department: e.target.value })}
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-[12px]"
              >
                <option value="">Select Department</option>
                <option value="Operations">Operations</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Security">Security</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
              </select>
            </div>
          </div>

          {/* Ticket Description */}
          <div>
            <Label className="text-[11px] text-slate-500">Ticket Description *</Label>
            <textarea
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Describe the issue or support request in detail..."
              rows={3}
              className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-[12px]"
            />
          </div>

          {/* Row 3: Expected Completion + Priority + Status + Service Provider */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-[11px] text-slate-500">Expected Completion Date</Label>
              <Input
                type="date"
                value={newTicket.expectedCompletion}
                onChange={(e) => setNewTicket({ ...newTicket, expectedCompletion: e.target.value })}
                className="mt-1 h-8 text-[12px]"
              />
            </div>
            <div>
              <Label className="text-[11px] text-slate-500">Ticket Priority</Label>
              <select
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-[12px]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <Label className="text-[11px] text-slate-500">Ticket Status</Label>
              <select
                value={newTicket.status}
                onChange={(e) => setNewTicket({ ...newTicket, status: e.target.value })}
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-[12px]"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
            <div>
              <Label className="text-[11px] text-slate-500">Assigned Service Provider</Label>
              <select
                value={newTicket.serviceProvider}
                onChange={(e) => setNewTicket({ ...newTicket, serviceProvider: e.target.value })}
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-transparent px-2 text-[12px]"
              >
                <option value="">Select Service Provider</option>
                <option value="ABC Services">ABC Services</option>
                <option value="XYZ Maintenance">XYZ Maintenance</option>
              </select>
            </div>
          </div>

          {/* Upload Files */}
          <div>
            <Label className="text-[11px] text-slate-500">Upload Files</Label>
            <div className="mt-1 flex flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 p-5 text-center">
              <UploadIcon className="h-5 w-5 text-slate-300 mb-1" />
              <p className="text-[12px] text-blue-600 font-medium">
                Click to upload{" "}
                <span className="text-slate-400 font-normal">or drag and drop files</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">Images, PDFs, Documents up to 10MB each.</p>
              <Button variant="outline" size="sm" className="mt-2 h-7 text-[11px]">
                <FileText className="h-3 w-3 mr-1" />
                Choose Files
              </Button>
            </div>
          </div>

          {/* Comments */}
          <div>
            <Label className="text-[11px] text-slate-500">Comments & Resolution Notes</Label>
            <textarea
              value={newTicket.comments}
              onChange={(e) => setNewTicket({ ...newTicket, comments: e.target.value })}
              placeholder="Add comments, updates, or resolution notes..."
              rows={2}
              className="mt-1 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-[12px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleCreateTicket}
              className="bg-green-600 hover:bg-green-700 text-white h-7 text-[11px]"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create Ticket
            </Button>
            <Button variant="outline" className="h-7 text-[11px]">
              <Save className="h-3 w-3 mr-1" />
              Save Draft
            </Button>
          </div>
        </div>
      </div>

      {/* Active Support Tickets */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[13px] font-semibold text-slate-800 flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Active Support Tickets ({filteredTickets.length})
          </h4>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="pl-8 w-44 h-7 text-[12px]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-7 rounded-md border border-input bg-transparent px-2 text-[12px]"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
            <Button variant="outline" size="sm" className="h-7 text-[11px]">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Ticket Cards */}
        <div className="space-y-2">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="rounded-md border border-slate-200 p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[12px] font-semibold text-slate-800">{ticket.ticketId}</span>
                    <StatusBadge
                      status={ticket.priority}
                      variant={
                        ticket.priority === "Critical"
                          ? "danger"
                          : ticket.priority === "High"
                          ? "danger"
                          : ticket.priority === "Medium"
                          ? "warning"
                          : "neutral"
                      }
                    />
                    <StatusBadge
                      status={ticket.status}
                      variant={
                        ticket.status === "Open"
                          ? "info"
                          : ticket.status === "In Progress"
                          ? "warning"
                          : "success"
                      }
                    />
                  </div>
                  <p className="text-[12px] text-slate-600 mb-1.5 line-clamp-1">{ticket.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400">
                    <span>Department: {ticket.department}</span>
                    <span>Category: {ticket.category}</span>
                    <span>Service Provider: {ticket.serviceProvider}</span>
                    <span>Assigned: {ticket.assignedTo}</span>
                    <span>Due: {ticket.dueDate}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[10px] px-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => openView(ticket)}
                  >
                    <Eye className="h-2.5 w-2.5 mr-0.5" />
                    View
                  </Button>
                  {ticket.status !== "Resolved" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 text-[10px] px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => openResolve(ticket)}
                    >
                      <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <p className="text-center text-[12px] text-slate-400 py-6">No tickets match your filters.</p>
          )}
        </div>
      </div>

      {/* ===== VIEW TICKET DIALOG ===== */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-3 pt-2">
              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Ticket ID</span>
                  <span className="text-[13px] font-semibold text-slate-800">{selectedTicket.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Department</span>
                  <span className="text-[13px] text-slate-700">{selectedTicket.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Category</span>
                  <span className="text-[13px] text-slate-700">{selectedTicket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Priority</span>
                  <StatusBadge
                    status={selectedTicket.priority}
                    variant={
                      selectedTicket.priority === "Critical"
                        ? "danger"
                        : selectedTicket.priority === "High"
                        ? "danger"
                        : selectedTicket.priority === "Medium"
                        ? "warning"
                        : "neutral"
                    }
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Status</span>
                  <StatusBadge
                    status={selectedTicket.status}
                    variant={
                      selectedTicket.status === "Open"
                        ? "info"
                        : selectedTicket.status === "In Progress"
                        ? "warning"
                        : "success"
                    }
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Service Provider</span>
                  <span className="text-[13px] text-slate-700">{selectedTicket.serviceProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Assigned To</span>
                  <span className="text-[13px] text-slate-700">{selectedTicket.assignedTo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[11px] text-slate-400">Due Date</span>
                  <span className="text-[13px] text-slate-700">{selectedTicket.dueDate}</span>
                </div>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 mb-1">Description</p>
                <p className="text-[13px] text-slate-800">{selectedTicket.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== RESOLVE TICKET DIALOG ===== */}
      <Dialog open={resolveOpen} onOpenChange={setResolveOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Resolve Ticket - {selectedTicket?.ticketId}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            {selectedTicket && (
              <div className="bg-slate-50 rounded-lg p-3 space-y-1.5">
                <p className="text-[12px] text-slate-600 font-medium">{selectedTicket.description}</p>
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={selectedTicket.priority}
                    variant={
                      selectedTicket.priority === "Critical"
                        ? "danger"
                        : selectedTicket.priority === "High"
                        ? "danger"
                        : selectedTicket.priority === "Medium"
                        ? "warning"
                        : "neutral"
                    }
                  />
                  <StatusBadge
                    status={selectedTicket.status}
                    variant={
                      selectedTicket.status === "Open"
                        ? "info"
                        : selectedTicket.status === "In Progress"
                        ? "warning"
                        : "success"
                    }
                  />
                </div>
              </div>
            )}
            <div>
              <Label className="text-[12px] text-slate-600 mb-1.5 block">Resolution Notes</Label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe what was done to resolve this ticket..."
                rows={4}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-[13px]"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setResolveOpen(false)} className="h-9 text-[13px] rounded-lg">
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                className="h-9 text-[13px] rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
