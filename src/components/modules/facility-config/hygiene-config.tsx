"use client";

import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  Plus,
  RefreshCw,
  FileText,
  Pencil,
  Trash2,
  SprayCan,
  Bug,
  Loader2,
  CheckCircle2,
  Printer,
  QrCode,
  ChevronDown,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";

interface TemplateFile {
  id: string;
  name: string;
  tasks: number;
  version: number;
}

interface ChecklistSection {
  title: string;
  templateCount: number;
  templates: TemplateFile[];
}

interface HygieneCategory {
  name: string;
  icon: React.ReactNode;
  sections: ChecklistSection[];
}

// Map DB rows to category structure
function mapDbTemplates(rows: Record<string, unknown>[]): HygieneCategory[] {
  const categoryMap = new Map<string, ChecklistSection[]>();

  for (const row of rows) {
    const category = (row.category as string) ?? "Housekeeping";
    const items = (row.items as Record<string, unknown>[]) ?? [];
    const name = (row.name as string) ?? "Template";

    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }

    // Group by frequency if available, otherwise put in "Daily Checklist"
    const sectionTitle = "Daily Checklist";
    const sections = categoryMap.get(category)!;
    let section = sections.find((s) => s.title === sectionTitle);
    if (!section) {
      section = { title: sectionTitle, templateCount: 0, templates: [] };
      sections.push(section);
    }

    section.templates.push({
      id: row.id as string,
      name,
      tasks: Array.isArray(items) ? items.length : 0,
      version: 1,
    });
    section.templateCount = section.templates.length;
  }

  const iconMap: Record<string, React.ReactNode> = {
    Housekeeping: <SprayCan className="h-5 w-5 text-blue-600" />,
    "Pest Control": <Bug className="h-5 w-5 text-orange-600" />,
  };

  return Array.from(categoryMap.entries()).map(([name, sections]) => ({
    name,
    icon: iconMap[name] ?? <SprayCan className="h-5 w-5 text-blue-600" />,
    sections,
  }));
}

const mockHygieneData: HygieneCategory[] = [
  {
    name: "Housekeeping",
    icon: <SprayCan className="h-5 w-5 text-blue-600" />,
    sections: [
      {
        title: "Daily Checklist",
        templateCount: 5,
        templates: [
          { id: "1", name: "HOUSEKEEPING CHECKLIST", tasks: 13, version: 3 },
          { id: "2", name: "CLUB-HOUSE CHECKLIST", tasks: 10, version: 3 },
          { id: "3", name: "BLOCK CHECKLIST", tasks: 14, version: 3 },
          { id: "4", name: "BASEMENT CHECKLIST", tasks: 11, version: 3 },
          { id: "5", name: "Washroom Checklist", tasks: 11, version: 3 },
        ],
      },
      {
        title: "Weekly Checklist",
        templateCount: 1,
        templates: [
          { id: "6", name: "HOUSEKEEPING_Weekly_Template.xlsx", tasks: 8, version: 1 },
        ],
      },
      {
        title: "Monthly Checklist",
        templateCount: 1,
        templates: [
          { id: "7", name: "HOUSEKEEPING_Monthly_Template.xlsx", tasks: 6, version: 1 },
        ],
      },
    ],
  },
  {
    name: "Pest Control",
    icon: <Bug className="h-5 w-5 text-orange-600" />,
    sections: [
      {
        title: "Daily Checklist",
        templateCount: 1,
        templates: [
          { id: "8", name: "PEST_CONTROL_Daily_Template.xlsx", tasks: 7, version: 1 },
        ],
      },
      {
        title: "Weekly Checklist",
        templateCount: 1,
        templates: [
          { id: "9", name: "PEST_CONTROL_Weekly_Template.xlsx", tasks: 7, version: 1 },
        ],
      },
      {
        title: "Monthly Checklist",
        templateCount: 1,
        templates: [
          { id: "10", name: "PEST_CONTROL_Monthly_Template.xlsx", tasks: 5, version: 1 },
        ],
      },
    ],
  },
];

function getFrequencyFromTitle(title: string): string {
  if (title.toLowerCase().includes("daily")) return "Daily";
  if (title.toLowerCase().includes("weekly")) return "Weekly";
  if (title.toLowerCase().includes("monthly")) return "Monthly";
  return "Daily";
}

function TemplateRow({
  template,
  onEdit,
  onDelete,
  onView,
}: {
  template: TemplateFile;
  onEdit: (t: TemplateFile) => void;
  onDelete: (t: TemplateFile) => void;
  onView: (t: TemplateFile) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
      <div
        className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
        onClick={() => onView(template)}
      >
        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-800 leading-tight truncate">
            {template.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {template.tasks} tasks
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0 ml-3">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700">
          v{template.version}
        </span>
        <button
          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors"
          title="View QR code"
          onClick={() => onView(template)}
        >
          <QrCode className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors"
          title="Edit template"
          onClick={() => onEdit(template)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-500 transition-colors"
          title="Download template"
          onClick={() => toast.success(`Downloading ${template.name}...`)}
        >
          <Download className="h-3.5 w-3.5" />
        </button>
        <button
          className="p-1.5 rounded-md hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
          title="Delete template"
          onClick={() => onDelete(template)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ChecklistSectionCard({
  section,
  onEdit,
  onDelete,
  onView,
}: {
  section: ChecklistSection;
  onEdit: (t: TemplateFile) => void;
  onDelete: (t: TemplateFile) => void;
  onView: (t: TemplateFile) => void;
}) {
  return (
    <Card className="shadow-none border border-slate-200 rounded-lg overflow-hidden">
      {/* Section header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
        <h4 className="text-[13px] font-semibold text-slate-700">
          {section.title}
        </h4>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-700">
            <span>v3</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <span className="text-[11px] text-slate-400">
            {section.templateCount} template{section.templateCount !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Template rows */}
      <div>
        {section.templates.map((template) => (
          <TemplateRow
            key={template.id}
            template={template}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-t border-slate-100">
        <button
          className="inline-flex items-center gap-1 px-3 py-1 text-[11px] text-blue-600 font-medium border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".xlsx,.xls,.csv";
            input.onchange = () => toast.success("Template uploaded");
            input.click();
          }}
        >
          <Plus className="h-3 w-3" />
          Add Template
        </button>
        <button
          className="inline-flex items-center gap-1 px-3 py-1 text-[11px] text-blue-600 font-medium border border-blue-200 rounded-full hover:bg-blue-50 transition-colors"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".xlsx,.xls,.csv";
            input.multiple = true;
            input.onchange = () => toast.success("Templates replaced");
            input.click();
          }}
        >
          <RefreshCw className="h-3 w-3" />
          Replace All
        </button>
      </div>
    </Card>
  );
}

export function HygieneConfig() {
  const [categories, setCategories] = useState<HygieneCategory[]>(mockHygieneData);
  const [loading, setLoading] = useState(true);

  const handleEditTemplate = (template: TemplateFile) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = () => {
      if (input.files?.[0]) {
        toast.success(`Template "${template.name}" replaced with "${input.files[0].name}"`);
      }
    };
    input.click();
  };

  const handleDeleteTemplate = (template: TemplateFile) => {
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        sections: cat.sections.map((sec) => ({
          ...sec,
          templates: sec.templates.filter((t) => t.id !== template.id),
          templateCount: sec.templates.filter((t) => t.id !== template.id).length,
        })),
      }))
    );
    toast.success(`Template "${template.name}" deleted`);
  };

  // View template detail modal
  const [viewTemplate, setViewTemplate] = useState<{
    template: TemplateFile;
    categoryName: string;
    sectionTitle: string;
  } | null>(null);

  const handleViewTemplate = (template: TemplateFile) => {
    // Find which category and section this template belongs to
    let foundCategory = "Housekeeping";
    let foundSection = "Daily Checklist";
    for (const cat of categories) {
      for (const sec of cat.sections) {
        if (sec.templates.some((t) => t.id === template.id)) {
          foundCategory = cat.name;
          foundSection = sec.title;
          break;
        }
      }
    }
    setViewTemplate({
      template,
      categoryName: foundCategory,
      sectionTitle: foundSection,
    });
  };

  // Sample task names per template (would come from DB in production)
  const getTasksForTemplate = (template: TemplateFile): string[] => {
    const taskMap: Record<string, string[]> = {
      "HOUSEKEEPING CHECKLIST": [
        "Check the deployment and availability of manpower on your floor",
        "Grooming of employees on floor and quality of the tools they use",
        "Availability of Floor mops, Bucket and Wipers",
        "All the respective floors is been swepted properly",
        "Garbage is collected from each flat",
        "All floors are well mopped",
        "Dusting of all fire safety equipments",
        "Have a closer look at the flooring, walls, window glasses",
        "Light fittings and fixtures are clean and working",
        "Look down at all common corridors for stains on the flooring area",
        "Check dustbins are not overflowing",
        "Lift lobby area is clean",
        "Staircase cleaning done",
      ],
      "CLUB-HOUSE CHECKLIST": [
        "Swimming pool area cleaning",
        "Gym equipment wiped",
        "Reception area tidy",
        "Restrooms cleaned",
        "Common hall mopped",
        "Windows cleaned",
        "AC vents dusted",
        "Furniture arranged",
        "Lobby flowers refreshed",
        "Parking area swept",
      ],
      "BLOCK CHECKLIST": [
        "Corridor mopping",
        "Staircase cleaning",
        "Lift area cleaned",
        "Terrace swept",
        "Basement parking",
        "Fire exit clear",
        "Notice board updated",
        "Mailbox area clean",
        "Entry gate clean",
        "Intercom panel wiped",
        "Transformer room checked",
        "Meter room swept",
        "Garden pathway",
        "Compound wall clean",
      ],
    };
    return (
      taskMap[template.name] ||
      Array.from({ length: template.tasks }, (_, i) => `Task ${i + 1}`)
    );
  };

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/facilities/config/hygiene-templates");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setCategories(mapDbTemplates(data));
      }
      // If empty, keep mock data as fallback
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-[13px] text-slate-500">
          Loading hygiene templates...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {categories.map((category) => (
          <div key={category.name} className="space-y-4">
            {/* Category header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {category.icon}
                <h3 className="text-[15px] font-semibold text-slate-800">
                  {category.name}
                </h3>
              </div>
              <button
                className="flex items-center gap-1.5 text-[12px] text-blue-600 hover:text-blue-700 font-medium hover:underline"
                onClick={() =>
                  toast.success(
                    `Downloading QR codes for ${category.name}...`
                  )
                }
              >
                <Download className="h-3.5 w-3.5" />
                Download QRs
              </button>
            </div>

            {/* Section cards */}
            <div className="space-y-4">
              {category.sections.map((section) => (
                <ChecklistSectionCard
                  key={section.title}
                  section={section}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                  onView={handleViewTemplate}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ===== QR TEMPLATE DETAIL MODAL ===== */}
      <Dialog
        open={!!viewTemplate}
        onOpenChange={(open) => {
          if (!open) setViewTemplate(null);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          {viewTemplate &&
            (() => {
              const { template, categoryName, sectionTitle } = viewTemplate;
              const frequency = getFrequencyFromTitle(sectionTitle);
              const sheetName = template.name.replace(/\s+/g, "_").toUpperCase();
              const qrId = `template_${template.id}_${sheetName}_${categoryName.replace(/\s+/g, "_")}`;
              const qrUrl = `https://dss.spotworks.io/hygiene-scan/${qrId}`;
              const tasks = getTasksForTemplate(template);

              return (
                <>
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-50">
                        <QrCode className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <DialogTitle className="text-[15px] font-bold text-slate-800">
                          {template.name} - {categoryName}
                        </DialogTitle>
                        <p className="text-[12px] text-slate-500 mt-1">
                          {frequency} Tasks &middot; {template.tasks} active
                          tasks &middot; 1 Template QR Code &middot; Sheet:{" "}
                          {sheetName}
                        </p>
                      </div>
                    </div>
                  </DialogHeader>

                  <div className="space-y-5 pt-3">
                    {/* QR Code section */}
                    <div className="bg-slate-50 rounded-xl p-6 text-center">
                      <h4 className="text-[14px] font-semibold text-slate-700 mb-1">
                        QR Code
                      </h4>
                      <p className="text-[12px] text-slate-400 mb-5">
                        Scan this QR code to access all tasks in this{" "}
                        {frequency.toLowerCase()} template
                      </p>
                      <div className="inline-block bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                        <QRCodeSVG value={qrUrl} size={180} level="M" />
                      </div>
                      <div className="mt-4 space-y-1.5 text-left px-2">
                        <p className="text-[11px] text-slate-500 font-mono break-all">
                          <span className="font-semibold text-slate-600">
                            QR ID:
                          </span>{" "}
                          {qrId}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono break-all">
                          <span className="font-semibold text-slate-600">
                            URL:
                          </span>{" "}
                          {qrUrl}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600">
                            Department:
                          </span>{" "}
                          {categoryName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600">
                            Frequency:
                          </span>{" "}
                          {frequency}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3">
                      <Button
                        className="flex-1 h-10 text-[13px] bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        onClick={() => toast.success("QR code downloaded")}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download QR (PNG)
                      </Button>
                      <Button
                        className="flex-1 h-10 text-[13px] bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
                        onClick={() => {
                          const w = window.open("", "_blank");
                          if (w) {
                            w.document.write(
                              `<html><head><title>QR - ${template.name}</title><style>body{font-family:Arial;text-align:center;padding:20px}h2{font-size:14px}p{font-size:11px;color:#666}</style></head><body><h2>${template.name}</h2><p>${categoryName}</p><img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrUrl)}" /><p style="margin-top:10px;font-size:9px">${qrId}</p></body></html>`
                            );
                            w.document.close();
                            setTimeout(() => w.print(), 500);
                          }
                        }}
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Print Sticker (4&quot; x 1&quot;)
                      </Button>
                    </div>

                    {/* Task List */}
                    <div>
                      <h4 className="text-[14px] font-semibold text-slate-700 mb-3">
                        Tasks in this Template ({tasks.length})
                      </h4>
                      <div className="space-y-0.5">
                        {tasks.map((task, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-[12px] text-slate-400 font-medium mt-0.5 w-5 shrink-0 text-right">
                              {idx + 1}.
                            </span>
                            <p className="text-[13px] text-slate-700 flex-1 leading-snug">
                              {task}
                            </p>
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
