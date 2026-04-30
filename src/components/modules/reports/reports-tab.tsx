"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  ClipboardList,
  Droplets,
  Zap,
  AlertTriangle,
  Leaf,
  FileDown,
} from "lucide-react";
import { reportTemplates, type ReportTemplate } from "./mock-data";
import { toast } from "sonner";

const iconMap: Record<ReportTemplate["icon"], React.ElementType> = {
  chart: BarChart3,
  clipboard: ClipboardList,
  droplet: Droplets,
  zap: Zap,
  alert: AlertTriangle,
  leaf: Leaf,
};

const iconColorMap: Record<ReportTemplate["icon"], string> = {
  chart: "text-blue-500",
  clipboard: "text-indigo-500",
  droplet: "text-cyan-500",
  zap: "text-amber-500",
  alert: "text-red-500",
  leaf: "text-green-500",
};

function ReportCard({ report }: { report: ReportTemplate }) {
  const Icon = iconMap[report.icon];
  const iconColor = iconColorMap[report.icon];

  const handleDownload = () => {
    toast.success(`Generating ${report.name} PDF...`);
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html><html><head><title>${report.name}</title>
        <style>body{font-family:Arial,sans-serif;margin:40px;} h1{font-size:18px;color:#1a1a1a;} p{font-size:12px;color:#666;}</style>
        </head><body><h1>${report.name}</h1><p>${report.description}</p><p>Generated on ${new Date().toLocaleString("en-IN")}</p></body></html>
      `);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  return (
    <Card className="shadow-none border-slate-200 hover:border-slate-300 transition-colors">
      <CardContent className="px-3 py-3 space-y-2.5">
        <div className="flex items-start gap-2.5">
          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${iconColor}`} />
          <div className="min-w-0">
            <h3 className="text-[12px] font-semibold text-slate-700 leading-tight">
              {report.name}
            </h3>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              {report.description}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full h-7 text-[11px]"
          onClick={handleDownload}
        >
          <FileDown className="h-3 w-3 mr-1" />
          PDF
        </Button>
      </CardContent>
    </Card>
  );
}

export function ReportsTab() {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="px-4 py-3">
        <h3 className="text-[13px] font-semibold text-slate-700 mb-3">
          Generate Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTemplates.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
