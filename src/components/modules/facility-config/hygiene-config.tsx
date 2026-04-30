"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  Pencil,
  Trash2,
  SprayCan,
  Bug,
} from "lucide-react";

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

const mockHygieneData: HygieneCategory[] = [
  {
    name: "Housekeeping",
    icon: <SprayCan className="h-4 w-4 text-blue-600" />,
    sections: [
      {
        title: "Daily Checklist",
        templateCount: 5,
        templates: [
          { id: "1", name: "HOUSEKEEPING CHECKLIST", tasks: 18, version: 3 },
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
          {
            id: "6",
            name: "HOUSEKEEPING_Weekly_Template.xlsx",
            tasks: 8,
            version: 1,
          },
        ],
      },
      {
        title: "Monthly Checklist",
        templateCount: 1,
        templates: [
          {
            id: "7",
            name: "HOUSEKEEPING_Monthly_Template.xlsx",
            tasks: 6,
            version: 1,
          },
        ],
      },
    ],
  },
  {
    name: "Pest Control",
    icon: <Bug className="h-4 w-4 text-orange-600" />,
    sections: [
      {
        title: "Daily Checklist",
        templateCount: 1,
        templates: [
          {
            id: "8",
            name: "PEST_CONTROL_Daily_Template.xlsx",
            tasks: 7,
            version: 1,
          },
        ],
      },
      {
        title: "Weekly Checklist",
        templateCount: 1,
        templates: [
          {
            id: "9",
            name: "PEST_CONTROL_Weekly_Template.xlsx",
            tasks: 7,
            version: 1,
          },
        ],
      },
      {
        title: "Monthly Checklist",
        templateCount: 1,
        templates: [
          {
            id: "10",
            name: "PEST_CONTROL_Monthly_Template.xlsx",
            tasks: 5,
            version: 1,
          },
        ],
      },
    ],
  },
];

function TemplateRow({ template }: { template: TemplateFile }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-2">
        <FileSpreadsheet className="h-3.5 w-3.5 text-green-600 shrink-0" />
        <div>
          <p className="text-[12px] font-medium text-slate-700 leading-tight">{template.name}</p>
          <p className="text-[10px] text-slate-400">{template.tasks} tasks</p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-slate-400 mr-0.5">v{template.version}</span>
        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
          <Pencil className="h-3 w-3" />
        </button>
        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
          <Download className="h-3 w-3" />
        </button>
        <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function ChecklistSectionCard({ section }: { section: ChecklistSection }) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between px-1">
        <h4 className="text-[11px] font-semibold text-slate-600">
          {section.title}
        </h4>
        <span className="text-[10px] text-slate-400">
          {section.templateCount} template{section.templateCount !== 1 ? "s" : ""}
        </span>
      </div>
      <div>
        {section.templates.map((template) => (
          <TemplateRow key={template.id} template={template} />
        ))}
      </div>
      <div className="flex items-center gap-3 pt-0.5 px-1">
        <button className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="h-3 w-3" />
          Add Template
        </button>
        <button className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 font-medium">
          <RefreshCw className="h-3 w-3" />
          Replace All
        </button>
      </div>
    </div>
  );
}

export function HygieneConfig() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button
          variant="outline"
          className="h-7 text-[11px] gap-1.5 text-blue-600 border-blue-200 hover:bg-blue-50 px-2.5"
        >
          <Download className="h-3.5 w-3.5" />
          Template Download
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {mockHygieneData.map((category) => (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {category.icon}
                <h3 className="text-[13px] font-semibold text-slate-800">
                  {category.name}
                </h3>
              </div>
              <button className="flex items-center gap-1 text-[10px] text-blue-600 hover:text-blue-700 font-medium">
                <Download className="h-3 w-3" />
                Download QRs
              </button>
            </div>

            <Card className="shadow-none border-slate-200">
              <CardContent className="p-3 space-y-3">
                {category.sections.map((section) => (
                  <ChecklistSectionCard key={section.title} section={section} />
                ))}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
