// Mock KPI data matching the screenshots

export type KPIStatus = "green" | "red" | "blue";

export interface KPIItem {
  id: string;
  name: string;
  category: string;
  actualValue: number;
  targetValue: number;
  unit: string;
  status: KPIStatus;
}

export interface KPICategorySummary {
  category: string;
  percentage: number;
  label: string;
}

export interface TimelinePoint {
  date: string;
  value: number;
  target: number;
}

export interface InsightItem {
  type: "positive" | "improving" | "stable" | "warning";
  text: string;
}

// 18 KPIs across 6 categories
export const kpiData: KPIItem[] = [
  // Attendance
  { id: "att-1", name: "Attendance Percentage", category: "Attendance", actualValue: 100, targetValue: 95, unit: "%", status: "green" },
  { id: "att-2", name: "Punctuality of Staff", category: "Attendance", actualValue: 100, targetValue: 90, unit: "%", status: "green" },
  { id: "att-3", name: "Briefing & Grooming", category: "Attendance", actualValue: 100, targetValue: 85, unit: "%", status: "green" },

  // Operations
  { id: "ops-1", name: "HK Schedule", category: "Operations", actualValue: 2.7, targetValue: 95, unit: "%", status: "red" },
  { id: "ops-2", name: "Garden Schedule", category: "Operations", actualValue: 2.7, targetValue: 90, unit: "%", status: "red" },
  { id: "ops-3", name: "Pest Control Schedule", category: "Operations", actualValue: 2.7, targetValue: 95, unit: "%", status: "red" },

  // Utilities
  { id: "utl-1", name: "Power Consumption", category: "Utilities", actualValue: 0, targetValue: 16, unit: "kWh", status: "red" },
  { id: "utl-2", name: "Water Consumption", category: "Utilities", actualValue: 0, targetValue: 1, unit: "KL", status: "red" },
  { id: "utl-3", name: "MLSS", category: "Utilities", actualValue: 0, targetValue: 3500, unit: "mg/L", status: "red" },

  // Maintenance
  { id: "mnt-1", name: "WTP Hardness", category: "Maintenance", actualValue: 0, targetValue: 200, unit: "mg/L", status: "red" },
  { id: "mnt-2", name: "Swimming Pool pH", category: "Maintenance", actualValue: 0, targetValue: 7.4, unit: "pH", status: "red" },
  { id: "mnt-3", name: "Swimming Pool Chlorine", category: "Maintenance", actualValue: 0, targetValue: 2, unit: "mg/L", status: "red" },
  { id: "mnt-4", name: "Usage Point Hardness", category: "Maintenance", actualValue: 0, targetValue: 200, unit: "mg/L", status: "red" },
  { id: "mnt-5", name: "PPM Completion Rate", category: "Maintenance", actualValue: 2.7, targetValue: 90, unit: "%", status: "red" },

  // Quality
  { id: "qlt-1", name: "Complaint Resolution TAT", category: "Quality", actualValue: 0, targetValue: 4, unit: "hours", status: "green" },
  { id: "qlt-2", name: "Task Resolution TAT", category: "Quality", actualValue: 0, targetValue: 3, unit: "hours", status: "red" },
  { id: "qlt-3", name: "Vendor Tickets TAT", category: "Quality", actualValue: 0, targetValue: 4, unit: "hours", status: "red" },

  // Safety
  { id: "sft-1", name: "Safety Incidents", category: "Safety", actualValue: 0, targetValue: 3, unit: "/period", status: "red" },
];

export const categorySummaries: KPICategorySummary[] = [
  { category: "Attendance", percentage: 100, label: "100% of KPIs on or close to target" },
  { category: "Operations", percentage: 3, label: "3% of KPIs on or close to target" },
  { category: "Utilities", percentage: 0, label: "0% of KPIs on or close to target" },
  { category: "Maintenance", percentage: 0, label: "0% of KPIs on or close to target" },
  { category: "Quality", percentage: 1, label: "1% of KPIs on or close to target" },
  { category: "Safety", percentage: 0, label: "0% of KPIs on or close to target" },
];

// Timeline data for Attendance Percentage over selected period
export const timelineData: TimelinePoint[] = [
  { date: "29 Mar", value: 0, target: 95 },
  { date: "31 Mar", value: 85, target: 95 },
  { date: "03 Apr", value: 90, target: 95 },
  { date: "05 Apr", value: 92, target: 95 },
  { date: "07 Apr", value: 88, target: 95 },
  { date: "09 Apr", value: 70, target: 95 },
  { date: "12 Apr", value: 20, target: 95 },
  { date: "14 Apr", value: 15, target: 95 },
  { date: "17 Apr", value: 10, target: 95 },
  { date: "19 Apr", value: 8, target: 95 },
  { date: "22 Apr", value: 5, target: 95 },
];

// Timeline data for all KPIs (keyed by KPI id)
export const allTimelineData: Record<string, TimelinePoint[]> = {
  "att-1": timelineData,
  "att-2": [
    { date: "29 Mar", value: 0, target: 90 },
    { date: "03 Apr", value: 88, target: 90 },
    { date: "07 Apr", value: 92, target: 90 },
    { date: "12 Apr", value: 85, target: 90 },
    { date: "17 Apr", value: 90, target: 90 },
    { date: "22 Apr", value: 91, target: 90 },
  ],
  "att-3": [
    { date: "29 Mar", value: 0, target: 85 },
    { date: "03 Apr", value: 80, target: 85 },
    { date: "07 Apr", value: 85, target: 85 },
    { date: "12 Apr", value: 82, target: 85 },
    { date: "17 Apr", value: 88, target: 85 },
    { date: "22 Apr", value: 86, target: 85 },
  ],
};

export const kpiStatusDistribution = {
  excellent: 3,
  good: 1,
  poor: 14,
};

export const keyInsights: InsightItem[] = [
  { type: "positive", text: "Attendance is 100.0%, above target of 95%." },
  { type: "positive", text: "Water consumption is -100.0% below target - good energy management." },
  { type: "improving", text: "Complaint resolution TAT is 0.0h vs target 4.0h - meeting expectations." },
  { type: "stable", text: "Safety incidents are 0 against target 3, indicating effective safety controls." },
];

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: "chart" | "clipboard" | "droplet" | "zap" | "alert" | "leaf";
}

export const reportTemplates: ReportTemplate[] = [
  { id: "facility-metrics", name: "Facility Metrics Report", description: "Overall attendance, operations and utilities performance.", icon: "chart" },
  { id: "ppm", name: "PPM Report", description: "Preventive maintenance schedules and completion status.", icon: "clipboard" },
  { id: "water", name: "Water Consumption Report", description: "Water usage and conservation metrics.", icon: "droplet" },
  { id: "power", name: "Power Consumption Report", description: "Energy usage and efficiency trends.", icon: "zap" },
  { id: "attrition", name: "Attrition Report", description: "Staff turnover and retention metrics.", icon: "alert" },
  { id: "soft-services", name: "Soft Services Report", description: "Housekeeping, gardening and other soft services.", icon: "leaf" },
];
