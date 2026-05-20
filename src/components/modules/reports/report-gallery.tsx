"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared";
import { FileText, Play, Pencil, Loader2 } from "lucide-react";
import { useApi } from "@/hooks/use-api";
import { toast } from "sonner";

interface ReportTemplate {
  id: string;
  name: string;
  module: string;
  fieldSelection: string[] | null;
  filters: Record<string, any> | null;
  createdAt: string;
}

const mockTemplates: ReportTemplate[] = [
  { id: "1", name: "Monthly Attendance Summary", module: "attendance", fieldSelection: ["employeeName", "date", "status", "checkIn", "checkOut"], filters: null, createdAt: "2026-04-15" },
  { id: "2", name: "Task Completion Report", module: "tasks", fieldSelection: ["title", "assignee", "status", "completedAt"], filters: null, createdAt: "2026-04-10" },
  { id: "3", name: "Asset Maintenance Log", module: "assets", fieldSelection: ["name", "category", "status", "lastServiceDate"], filters: null, createdAt: "2026-04-05" },
  { id: "4", name: "Complaint Analysis", module: "complaints", fieldSelection: ["subject", "severity", "status", "createdAt"], filters: null, createdAt: "2026-03-28" },
  { id: "5", name: "Inventory Status", module: "inventory", fieldSelection: ["itemName", "currentStock", "reorderLevel", "unit"], filters: null, createdAt: "2026-03-20" },
  { id: "6", name: "Power Consumption", module: "power", fieldSelection: ["meterName", "readingDate", "kwh"], filters: null, createdAt: "2026-03-15" },
];

function TemplateCard({
  template,
  onGenerate,
}: {
  template: ReportTemplate;
  onGenerate: (t: ReportTemplate) => void;
}) {
  const fieldCount = template.fieldSelection?.length ?? 0;

  return (
    <Card className="shadow-none border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="px-3 py-3 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <FileText className="h-4 w-4 mt-0.5 shrink-0 text-blue-500" />
          <div className="min-w-0">
            <h3 className="text-[12px] font-semibold text-slate-700 leading-tight">
              {template.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <StatusBadge status={template.module} variant="info" />
              <span className="text-[10px] text-slate-400">
                {fieldCount} field{fieldCount !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="default"
            size="sm"
            className="flex-1 h-7 text-[11px]"
            onClick={() => onGenerate(template)}
          >
            <Play className="h-3 w-3 mr-1" />
            Generate
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] px-2">
            <Pencil className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ReportGallery() {
  const [generating, setGenerating] = useState<string | null>(null);

  const { data } = useApi<ReportTemplate[]>({
    url: "/api/v1/reports/templates",
    initialData: mockTemplates,
  });

  const templates = data ?? mockTemplates;

  const handleGenerate = async (template: ReportTemplate) => {
    setGenerating(template.id);
    try {
      const res = await fetch("/api/v1/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: template.id,
          module: template.module,
          fields: template.fieldSelection ?? [],
          filters: template.filters ?? {},
          format: "pdf",
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const result = await res.json();
      toast.success(`Generated ${template.name}`);
      if (result.fileUrl) window.open(result.fileUrl, "_blank");
    } catch {
      toast.error("Failed to generate report");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="px-4 py-3">
        <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
          Saved Report Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onGenerate={handleGenerate}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
