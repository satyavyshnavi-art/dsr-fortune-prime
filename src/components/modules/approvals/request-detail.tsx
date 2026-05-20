"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, CircleDot, User } from "lucide-react";
import { toast } from "sonner";
import type { ApprovalRequest, ApprovalStep } from "./mock-data";
import { REQUEST_TYPE_LABELS } from "./mock-data";

interface RequestDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ApprovalRequest | null;
}

export function RequestDetail({ open, onOpenChange, request }: RequestDetailProps) {
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const handleAction = async () => {
    if (!request || !actionType) return;

    try {
      const res = await fetch(`/api/v1/approvals/${request.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: actionType, comment }),
      });
      if (res.ok) {
        toast.success(
          actionType === "approve" ? "Request approved" : "Request rejected"
        );
      } else {
        throw new Error("API error");
      }
    } catch {
      toast.success(
        `Request ${actionType === "approve" ? "approved" : "rejected"} (offline)`
      );
    }

    setActionType(null);
    setComment("");
    onOpenChange(false);
  };

  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-5 max-h-[85vh] overflow-y-auto" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800">
            Request Detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Request Info */}
          <div className="bg-slate-50 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <StatusBadge
                status={REQUEST_TYPE_LABELS[request.type] ?? request.type}
                variant="info"
              />
              <StatusBadge
                status={request.status}
                variant={
                  request.status === "approved"
                    ? "success"
                    : request.status === "rejected"
                    ? "danger"
                    : "warning"
                }
              />
            </div>
            <p className="text-[13px] font-medium text-slate-800">{request.title}</p>
            <p className="text-[11px] text-slate-500">{request.description}</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Amount</p>
                <p className="text-[13px] font-semibold text-slate-800">
                  ₹{request.amount.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Requested By</p>
                <p className="text-[12px] text-slate-700">{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Date</p>
                <p className="text-[12px] text-slate-700">{request.requestedAt}</p>
              </div>
            </div>
          </div>

          {/* Approval Timeline */}
          <div>
            <h4 className="text-[12px] font-semibold text-slate-700 mb-3">
              Approval Chain
            </h4>
            <div className="space-y-0">
              {request.steps.map((step, idx) => (
                <StepItem
                  key={step.id}
                  step={step}
                  isLast={idx === request.steps.length - 1}
                />
              ))}
            </div>
          </div>

          {/* Action buttons (only for pending requests) */}
          {request.status === "pending" && (
            <div className="space-y-3 border-t border-slate-200 pt-3">
              {actionType ? (
                <>
                  <Label className="text-[11px] text-slate-500">
                    Comment ({actionType === "approve" ? "Approve" : "Reject"})
                  </Label>
                  <Textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[60px] text-[13px] rounded-lg"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="h-7 text-[11px] px-3"
                      onClick={() => {
                        setActionType(null);
                        setComment("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className={`h-7 text-[11px] px-3 text-white ${
                        actionType === "approve"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      onClick={handleAction}
                    >
                      Confirm {actionType === "approve" ? "Approval" : "Rejection"}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    className="h-8 text-[12px] px-4 gap-1.5 bg-green-600 hover:bg-green-700 text-white flex-1"
                    onClick={() => setActionType("approve")}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Approve
                  </Button>
                  <Button
                    className="h-8 text-[12px] px-4 gap-1.5 bg-red-600 hover:bg-red-700 text-white flex-1"
                    onClick={() => setActionType("reject")}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Reject
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StepItem({ step, isLast }: { step: ApprovalStep; isLast: boolean }) {
  const iconMap = {
    approved: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    rejected: <XCircle className="h-4 w-4 text-red-500" />,
    pending: <Clock className="h-4 w-4 text-amber-500" />,
    waiting: <CircleDot className="h-4 w-4 text-slate-300" />,
  };

  const lineColor =
    step.status === "approved"
      ? "bg-green-200"
      : step.status === "rejected"
      ? "bg-red-200"
      : "bg-slate-200";

  return (
    <div className="flex gap-3">
      {/* Timeline line + icon */}
      <div className="flex flex-col items-center">
        <div className="shrink-0">{iconMap[step.status]}</div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${lineColor}`} />}
      </div>

      {/* Content */}
      <div className={`pb-4 ${isLast ? "" : ""}`}>
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-slate-800">{step.role}</span>
          <StatusBadge
            status={step.status}
            variant={
              step.status === "approved"
                ? "success"
                : step.status === "rejected"
                ? "danger"
                : step.status === "pending"
                ? "warning"
                : "neutral"
            }
          />
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <User className="h-3 w-3 text-slate-400" />
          <span className="text-[11px] text-slate-500">{step.approverName}</span>
        </div>
        {step.actedAt && (
          <p className="text-[10px] text-slate-400 mt-0.5">{step.actedAt}</p>
        )}
        {step.comments && (
          <p className="text-[11px] text-slate-500 mt-0.5 italic">
            &ldquo;{step.comments}&rdquo;
          </p>
        )}
      </div>
    </div>
  );
}
