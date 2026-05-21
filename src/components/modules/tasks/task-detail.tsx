"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  MessageSquare,
  Clock,
  Send,
  User,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, TaskStatus } from "./mock-data";
import { EMPLOYEES } from "./mock-data";

interface TaskDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void | Promise<void>;
  onStatusChange?: (taskId: string, status: TaskStatus) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "neutral",
  medium: "purple",
  high: "warning",
  critical: "danger",
};

export function TaskDetail({
  open,
  onOpenChange,
  task,
  onEdit,
  onDelete,
  onStatusChange,
  onRefresh,
}: TaskDetailProps) {
  const [newComment, setNewComment] = useState("");
  const [postingComment, setPostingComment] = useState(false);
  const [showEscalateForm, setShowEscalateForm] = useState(false);
  const [escalateReason, setEscalateReason] = useState("");
  const [escalateTo, setEscalateTo] = useState<string>("");
  const [submittingEscalation, setSubmittingEscalation] = useState(false);

  if (!task) return null;

  const checklist = task.checklist;
  const comments = task.comments;
  const checkedCount = checklist.filter((c) => c.isChecked).length;
  const totalChecklist = checklist.length;
  const progressPct = totalChecklist > 0 ? Math.round((checkedCount / totalChecklist) * 100) : 0;
  const today = new Date().toISOString().split("T")[0];
  const isOverdue = task.dueDate < today && task.status !== "completed" && task.status !== "cancelled";

  const handleAddComment = async () => {
    const body = newComment.trim();
    if (!body) return;
    setPostingComment(true);
    try {
      const res = await fetch(`/api/v1/tasks/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err?.error?.message ||
          (typeof err?.error === "string" ? err.error : null) ||
          `Failed to post comment (${res.status})`;
        toast.error(typeof message === "string" ? message : "Failed to post comment");
        return;
      }
      setNewComment("");
      toast.success("Comment posted");
      if (onRefresh) await onRefresh();
    } catch {
      toast.error("Network error — could not reach API");
    } finally {
      setPostingComment(false);
    }
  };

  const handleMarkComplete = async () => {
    if (onStatusChange) await onStatusChange(task.id, "completed");
    onOpenChange(false);
  };

  const openEscalateForm = () => {
    setEscalateReason("");
    setEscalateTo("");
    setShowEscalateForm(true);
  };

  const handleEscalateSubmit = async () => {
    const reason = escalateReason.trim();
    if (!reason) {
      toast.error("Reason is required");
      return;
    }
    setSubmittingEscalation(true);
    try {
      // TODO: send escalatedTo when employees expose UUIDs
      const res = await fetch(`/api/v1/tasks/${task.id}/escalations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const message =
          err?.error?.message ||
          (typeof err?.error === "string" ? err.error : null) ||
          `Failed to escalate (${res.status})`;
        toast.error(typeof message === "string" ? message : "Failed to escalate");
        return;
      }
      toast.success("Task escalated");
      setShowEscalateForm(false);
      setEscalateReason("");
      setEscalateTo("");
      if (onRefresh) await onRefresh();
    } catch {
      toast.error("Network error — could not reach API");
    } finally {
      setSubmittingEscalation(false);
    }
  };

  const handleDelete = async () => {
    if (onDelete) await onDelete(task.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-5 max-h-[85vh] overflow-y-auto" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800">
            Task Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Header */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <StatusBadge status={task.status} />
                <StatusBadge
                  status={task.priority}
                  variant={PRIORITY_COLORS[task.priority] as "warning" | "danger" | "neutral" | "purple" | undefined}
                />
              </div>
              {isOverdue && (
                <span className="text-[10px] font-medium text-red-600 bg-red-50 border border-red-200 rounded px-1.5 py-0.5 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </span>
              )}
            </div>
            <p className="text-[13px] font-medium text-slate-800">{task.title}</p>
            <p className="text-[11px] text-slate-500">{task.description}</p>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Department</p>
                <p className="text-[12px] text-slate-700">{task.department}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Assigned To</p>
                <p className="text-[12px] text-slate-700">{task.assignedTo || "Unassigned"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Assigned By</p>
                <p className="text-[12px] text-slate-700">{task.assignedBy}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Created</p>
                <p className="text-[12px] text-slate-700">{task.createdAt}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Due Date</p>
                <p className={`text-[12px] ${isOverdue ? "text-red-600 font-semibold" : "text-slate-700"}`}>
                  {task.dueDate}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Source</p>
                <p className="text-[12px] text-slate-700">{task.source}</p>
              </div>
              {task.eisenhowerMatrix && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase">Eisenhower</p>
                  <p className="text-[12px] text-slate-700">{task.eisenhowerMatrix}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Frequency</p>
                <p className="text-[12px] text-slate-700 capitalize">{task.frequency.replace(/_/g, " ")}</p>
              </div>
            </div>
          </div>

          {/* SOP Checklist */}
          {checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[12px] font-semibold text-slate-700">
                  SOP Checklist
                </h4>
                <span className="text-[10px] text-slate-400">
                  {checkedCount} of {totalChecklist} completed
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full mb-2">
                <div
                  className="h-1.5 bg-green-500 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="space-y-1.5">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-2 py-1 px-2 rounded hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={item.isChecked}
                      disabled
                      className="mt-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-[12px] ${item.isChecked ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {item.label}
                      </p>
                      {item.isChecked && item.checkedAt && (
                        <p className="text-[10px] text-slate-400">
                          Checked by {item.checkedBy} on {new Date(item.checkedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Comments */}
          <div>
            <h4 className="text-[12px] font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Comments ({comments.length})
            </h4>
            {comments.length > 0 ? (
              <div className="space-y-2 mb-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-slate-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <User className="h-3 w-3 text-slate-400" />
                      <span className="text-[11px] font-medium text-slate-700">{comment.userName}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600">{comment.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mb-3">No comments yet.</p>
            )}
            <div className="flex gap-2">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[50px] text-[12px] rounded-lg flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 shrink-0 self-end"
                onClick={handleAddComment}
                disabled={!newComment.trim() || postingComment}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Escalation History */}
          {task.escalations.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-[12px] font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Escalation History
                </h4>
                <div className="space-y-2">
                  {task.escalations.map((esc) => (
                    <div key={esc.id} className="bg-amber-50/60 border border-amber-100 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        <span className="text-[11px] text-amber-700 font-medium">
                          {new Date(esc.escalatedAt).toLocaleDateString()}
                        </span>
                        <StatusBadge
                          status={esc.resolvedAt ? "Resolved" : "Open"}
                          variant={esc.resolvedAt ? "success" : "warning"}
                        />
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Escalated to <span className="font-medium">{esc.escalatedToName}</span>
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{esc.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Inline Escalate form */}
          {showEscalateForm && (
            <>
              <Separator />
              <div className="bg-amber-50/40 border border-amber-100 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-semibold text-amber-700 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Escalate Task
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-slate-400 hover:text-slate-700"
                    onClick={() => setShowEscalateForm(false)}
                    disabled={submittingEscalation}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">
                    Escalate To
                  </label>
                  {/* TODO: send escalatedTo when employees expose UUIDs */}
                  <Select value={escalateTo} onValueChange={(v) => setEscalateTo(v ?? "")}>
                    <SelectTrigger className="h-8 text-[12px] rounded-lg bg-white">
                      <SelectValue placeholder="Select employee (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEES.map((emp) => (
                        <SelectItem key={emp} value={emp} className="text-[12px]">
                          {emp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Why is this being escalated?"
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    className="min-h-[60px] text-[12px] rounded-lg bg-white"
                  />
                </div>
                <div className="flex items-center gap-2 justify-end pt-1">
                  <Button
                    variant="outline"
                    className="h-7 text-[11px] px-3"
                    onClick={() => setShowEscalateForm(false)}
                    disabled={submittingEscalation}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="h-7 text-[11px] px-3 bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleEscalateSubmit}
                    disabled={!escalateReason.trim() || submittingEscalation}
                  >
                    {submittingEscalation ? "Submitting..." : "Submit Escalation"}
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 border-t border-slate-200 pt-3 flex-wrap">
            {task.status !== "completed" && task.status !== "cancelled" && (
              <Button
                className="h-8 text-[12px] px-3 gap-1.5 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleMarkComplete}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
            )}
            {task.status !== "completed" && task.status !== "cancelled" && (
              <Button
                variant="outline"
                className="h-8 text-[12px] px-3 gap-1.5"
                onClick={openEscalateForm}
                disabled={showEscalateForm}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Escalate
              </Button>
            )}
            <Button
              variant="outline"
              className="h-8 text-[12px] px-3 gap-1.5"
              onClick={() => {
                if (onEdit) onEdit(task);
                onOpenChange(false);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              className="h-8 text-[12px] px-3 gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
