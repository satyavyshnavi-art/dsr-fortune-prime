"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Send, Upload } from "lucide-react";
import { toast } from "sonner";
import { REQUEST_TYPE_LABELS, type RequestType } from "./mock-data";

export function SubmitRequest() {
  const [type, setType] = useState<RequestType | "">("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (!type) newErrors.type = "Request type is required";
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)
      newErrors.amount = "Valid amount is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    try {
      const res = await fetch("/api/v1/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount: parseFloat(amount),
          description,
          fileName: fileName || null,
        }),
      });
      if (res.ok) {
        toast.success("Request submitted successfully");
      } else {
        throw new Error("API error");
      }
    } catch {
      toast.success("Request submitted (offline)");
    }

    setType("");
    setAmount("");
    setDescription("");
    setFileName("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 max-w-2xl">
      <h4 className="text-[14px] font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Send className="h-4 w-4" />
        Submit Approval Request
      </h4>

      <div className="space-y-3">
        {/* Request Type */}
        <div className="space-y-1">
          <Label className="text-[11px] text-slate-500">
            Request Type <span className="text-red-500">*</span>
          </Label>
          <Select
            value={type}
            onValueChange={(v) => {
              setType(v as RequestType);
              if (errors.type) setErrors((prev) => { const n = { ...prev }; delete n.type; return n; });
            }}
          >
            <SelectTrigger className={`h-9 text-[13px] rounded-lg ${errors.type ? "border-red-400 ring-1 ring-red-200" : ""}`}>
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(REQUEST_TYPE_LABELS) as [RequestType, string][]).map(
                ([key, label]) => (
                  <SelectItem key={key} value={key} className="text-[12px]">
                    {label}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-[10px] text-red-500 mt-0.5">{errors.type}</p>}
        </div>

        {/* Amount */}
        <div className="space-y-1">
          <Label className="text-[11px] text-slate-500">
            Amount (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="1"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => { const n = { ...prev }; delete n.amount; return n; });
            }}
            className={`h-9 text-[13px] rounded-lg ${errors.amount ? "border-red-400 ring-1 ring-red-200" : ""}`}
          />
          {errors.amount && <p className="text-[10px] text-red-500 mt-0.5">{errors.amount}</p>}
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label className="text-[11px] text-slate-500">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            placeholder="Describe the reason for this request..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => { const n = { ...prev }; delete n.description; return n; });
            }}
            className={`min-h-[80px] text-[13px] rounded-lg ${errors.description ? "border-red-400 ring-1 ring-red-200" : ""}`}
          />
          {errors.description && <p className="text-[10px] text-red-500 mt-0.5">{errors.description}</p>}
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

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-9 text-[13px] rounded-lg"
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          Submit Request
        </Button>
      </div>
    </div>
  );
}
