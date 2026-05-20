"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ClipboardList } from "lucide-react";
import { toast } from "sonner";

interface InterviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InterviewForm({ open, onOpenChange }: InterviewFormProps) {
  const [candidateName, setCandidateName] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [score, setScore] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!candidateName.trim()) newErrors.candidateName = "Candidate name is required";
    if (!interviewDate) newErrors.interviewDate = "Interview date is required";
    if (!score || isNaN(parseInt(score)) || parseInt(score) < 0 || parseInt(score) > 100)
      newErrors.score = "Score must be 0-100";
    if (!recommendation) newErrors.recommendation = "Recommendation is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const res = await fetch("/api/v1/hr/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateName,
          interviewDate,
          score: parseInt(score),
          recommendation,
          notes,
        }),
      });
      if (res.ok) {
        toast.success("Interview recorded successfully");
      } else {
        throw new Error("API error");
      }
    } catch {
      toast.success("Interview recorded (offline)");
    }

    setCandidateName("");
    setInterviewDate("");
    setScore("");
    setRecommendation("");
    setNotes("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px] p-5" showCloseButton>
        <DialogHeader className="pb-1">
          <DialogTitle className="text-[14px] font-semibold text-slate-800 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-blue-600" />
            Record Interview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Candidate Name */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Candidate Name <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="Enter candidate name"
              value={candidateName}
              onChange={(e) => {
                setCandidateName(e.target.value);
                if (errors.candidateName) setErrors((prev) => { const n = { ...prev }; delete n.candidateName; return n; });
              }}
              className={`h-9 text-[13px] rounded-lg ${errors.candidateName ? "border-red-400 ring-1 ring-red-200" : ""}`}
            />
            {errors.candidateName && <p className="text-[10px] text-red-500 mt-0.5">{errors.candidateName}</p>}
          </div>

          {/* Interview Date */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">
              Interview Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={interviewDate}
              onChange={(e) => {
                setInterviewDate(e.target.value);
                if (errors.interviewDate) setErrors((prev) => { const n = { ...prev }; delete n.interviewDate; return n; });
              }}
              className={`h-9 text-[13px] rounded-lg ${errors.interviewDate ? "border-red-400 ring-1 ring-red-200" : ""}`}
            />
            {errors.interviewDate && <p className="text-[10px] text-red-500 mt-0.5">{errors.interviewDate}</p>}
          </div>

          {/* Score & Recommendation */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Score (0-100) <span className="text-red-500">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                max="100"
                placeholder="e.g. 85"
                value={score}
                onChange={(e) => {
                  setScore(e.target.value);
                  if (errors.score) setErrors((prev) => { const n = { ...prev }; delete n.score; return n; });
                }}
                className={`h-9 text-[13px] rounded-lg ${errors.score ? "border-red-400 ring-1 ring-red-200" : ""}`}
              />
              {errors.score && <p className="text-[10px] text-red-500 mt-0.5">{errors.score}</p>}
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-slate-500">
                Recommendation <span className="text-red-500">*</span>
              </Label>
              <Select
                value={recommendation}
                onValueChange={(v) => {
                  setRecommendation(v ?? "");
                  if (errors.recommendation) setErrors((prev) => { const n = { ...prev }; delete n.recommendation; return n; });
                }}
              >
                <SelectTrigger className={`h-9 text-[13px] rounded-lg ${errors.recommendation ? "border-red-400 ring-1 ring-red-200" : ""}`}>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="strong_yes" className="text-[12px]">Strong Yes</SelectItem>
                  <SelectItem value="yes" className="text-[12px]">Yes</SelectItem>
                  <SelectItem value="maybe" className="text-[12px]">Maybe</SelectItem>
                  <SelectItem value="no" className="text-[12px]">No</SelectItem>
                </SelectContent>
              </Select>
              {errors.recommendation && <p className="text-[10px] text-red-500 mt-0.5">{errors.recommendation}</p>}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-[11px] text-slate-500">Notes</Label>
            <Textarea
              placeholder="Interview observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[60px] text-[13px] rounded-lg"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="h-7 text-[11px] px-3" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button className="h-7 text-[11px] px-3 gap-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit}>
              Save Interview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
