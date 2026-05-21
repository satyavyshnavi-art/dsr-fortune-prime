// ==================== TYPES ====================

export type TaskStatus = "pending" | "unassigned" | "in_progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskFrequency = "one_time" | "daily" | "weekly" | "fortnightly" | "monthly" | "quarterly" | "half_yearly" | "yearly";

export interface ChecklistItem {
  id: string;
  label: string;
  isChecked: boolean;
  checkedAt: string | null;
  checkedBy: string | null;
}

export interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  body: string;
  attachmentUrl: string | null;
  createdAt: string;
}

export interface TaskEscalation {
  id: string;
  taskId: string;
  escalatedTo: string;
  escalatedToName: string;
  escalatedAt: string;
  reason: string;
  resolvedAt: string | null;
}

export interface Task {
  id: string;
  facilityId: string;
  title: string;
  description: string;
  department: string;
  responsibility: string;
  priority: TaskPriority;
  source: string;
  eisenhowerMatrix: string;
  dueDate: string;
  status: TaskStatus;
  assignedTo: string;
  assignedBy: string;
  attachments: string[];
  createdAt: string;
  isExternal: boolean;
  category: string;
  frequency: TaskFrequency;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  escalations: TaskEscalation[];
}

export interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  sopChecklist: string[];
  category: string;
  frequency: TaskFrequency;
  isExternal: boolean;
  createdAt: string;
}

// ==================== LABELS ====================

export const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  unassigned: "Unassigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

export const FREQUENCY_LABELS: Record<TaskFrequency, string> = {
  one_time: "One Time",
  daily: "Daily",
  weekly: "Weekly",
  fortnightly: "Fortnightly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  half_yearly: "Half Yearly",
  yearly: "Yearly",
};

export const DEPARTMENTS = [
  "Housekeeping",
  "Security",
  "Maintenance",
  "Electrical",
  "Plumbing",
  "Landscaping",
  "Administration",
  "Finance",
];

export const SOURCES = [
  "Resident Complaint",
  "Scheduled Maintenance",
  "Management Directive",
  "Audit Finding",
  "Vendor Follow-up",
  "Self-Identified",
];

export const EMPLOYEES = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Neha Gupta",
  "Suresh Reddy",
  "Kavita Singh",
  "Manoj Tiwari",
  "Anita Desai",
  "Vikram Joshi",
  "Deepa Nair",
];

// ==================== MOCK DATA ====================

export const MOCK_TASKS: Task[] = [
  {
    id: "t-001",
    facilityId: "f-001",
    title: "Deep clean lobby area and reception",
    description: "Complete deep cleaning of the main lobby including marble polishing, glass cleaning, and furniture sanitization.",
    department: "Housekeeping",
    responsibility: "Supervisor",
    priority: "high",
    source: "Management Directive",
    eisenhowerMatrix: "Urgent & Important",
    dueDate: "2026-05-18",
    status: "in_progress",
    assignedTo: "Rajesh Kumar",
    assignedBy: "Priya Sharma",
    attachments: [],
    createdAt: "2026-05-15",
    isExternal: false,
    category: "Cleaning",
    frequency: "weekly",
    checklist: [
      { id: "cl-001", label: "Marble floor polishing", isChecked: true, checkedAt: "2026-05-16T10:30:00", checkedBy: "Rajesh Kumar" },
      { id: "cl-002", label: "Glass door cleaning", isChecked: true, checkedAt: "2026-05-16T11:00:00", checkedBy: "Rajesh Kumar" },
      { id: "cl-003", label: "Furniture sanitization", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-004", label: "Carpet vacuuming", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [
      { id: "cm-001", userId: "u-002", userName: "Priya Sharma", body: "Please prioritize the marble polishing first.", attachmentUrl: null, createdAt: "2026-05-15T09:00:00" },
      { id: "cm-002", userId: "u-001", userName: "Rajesh Kumar", body: "Marble polishing completed. Moving to glass doors next.", attachmentUrl: null, createdAt: "2026-05-16T10:35:00" },
    ],
    escalations: [],
  },
  {
    id: "t-002",
    facilityId: "f-001",
    title: "Fix water leakage in Block B parking",
    description: "Persistent water leakage reported near parking slot B-42. Needs immediate plumbing inspection and repair.",
    department: "Plumbing",
    responsibility: "Technician",
    priority: "critical",
    source: "Resident Complaint",
    eisenhowerMatrix: "Urgent & Important",
    dueDate: "2026-05-19",
    status: "in_progress",
    assignedTo: "Amit Patel",
    assignedBy: "Priya Sharma",
    attachments: ["leakage-photo.jpg"],
    createdAt: "2026-05-14",
    isExternal: false,
    category: "Repair",
    frequency: "one_time",
    checklist: [
      { id: "cl-005", label: "Inspect pipe joints", isChecked: true, checkedAt: "2026-05-15T14:00:00", checkedBy: "Amit Patel" },
      { id: "cl-006", label: "Replace damaged gaskets", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-007", label: "Pressure test after repair", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [
      { id: "cm-003", userId: "u-003", userName: "Amit Patel", body: "Identified the source of leakage. Gasket replacement needed.", attachmentUrl: null, createdAt: "2026-05-15T14:30:00" },
    ],
    escalations: [
      { id: "e-001", taskId: "t-002", escalatedTo: "u-005", escalatedToName: "Suresh Reddy", escalatedAt: "2026-05-17T09:00:00", reason: "Parts not available in stock, needs urgent procurement", resolvedAt: null },
    ],
  },
  {
    id: "t-003",
    facilityId: "f-001",
    title: "Monthly fire extinguisher inspection",
    description: "Conduct monthly inspection of all fire extinguishers across the facility. Check pressure gauges, seals, and expiry dates.",
    department: "Security",
    responsibility: "Supervisor",
    priority: "high",
    source: "Scheduled Maintenance",
    eisenhowerMatrix: "Not Urgent & Important",
    dueDate: "2026-05-25",
    status: "pending",
    assignedTo: "Kavita Singh",
    assignedBy: "Neha Gupta",
    attachments: [],
    createdAt: "2026-05-10",
    isExternal: false,
    category: "Inspection",
    frequency: "monthly",
    checklist: [
      { id: "cl-008", label: "Check all Block A extinguishers", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-009", label: "Check all Block B extinguishers", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-010", label: "Check all Block C extinguishers", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-011", label: "Update inspection log", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-012", label: "Report expired units", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [],
    escalations: [],
  },
  {
    id: "t-004",
    facilityId: "f-001",
    title: "Replace burnt-out corridor lights Block A",
    description: "Multiple corridor lights on floors 3 and 5 of Block A are not working. Replace bulbs and check wiring.",
    department: "Electrical",
    responsibility: "Technician",
    priority: "medium",
    source: "Resident Complaint",
    eisenhowerMatrix: "Urgent & Not Important",
    dueDate: "2026-05-21",
    status: "pending",
    assignedTo: "Manoj Tiwari",
    assignedBy: "Suresh Reddy",
    attachments: [],
    createdAt: "2026-05-16",
    isExternal: false,
    category: "Repair",
    frequency: "one_time",
    checklist: [
      { id: "cl-013", label: "Procure LED bulbs (12 units)", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-014", label: "Replace Floor 3 corridor lights", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-015", label: "Replace Floor 5 corridor lights", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-016", label: "Check wiring connections", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [],
    escalations: [],
  },
  {
    id: "t-005",
    facilityId: "f-001",
    title: "Quarterly pest control treatment",
    description: "Schedule and coordinate quarterly pest control service for the entire facility including common areas and basements.",
    department: "Housekeeping",
    responsibility: "Manager",
    priority: "medium",
    source: "Scheduled Maintenance",
    eisenhowerMatrix: "Not Urgent & Important",
    dueDate: "2026-05-30",
    status: "pending",
    assignedTo: "Neha Gupta",
    assignedBy: "Priya Sharma",
    attachments: [],
    createdAt: "2026-05-12",
    isExternal: true,
    category: "Vendor Coordination",
    frequency: "quarterly",
    checklist: [
      { id: "cl-017", label: "Contact pest control vendor", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-018", label: "Schedule date with vendor", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-019", label: "Send resident notification", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-020", label: "Supervise treatment execution", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-021", label: "Collect completion certificate", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [
      { id: "cm-004", userId: "u-004", userName: "Neha Gupta", body: "Vendor confirmed availability for May 28th.", attachmentUrl: null, createdAt: "2026-05-13T11:00:00" },
    ],
    escalations: [],
  },
  {
    id: "t-006",
    facilityId: "f-001",
    title: "CCTV camera maintenance and cleanup",
    description: "Clean all CCTV cameras, check recording status, and ensure all cameras are operational.",
    department: "Security",
    responsibility: "Technician",
    priority: "low",
    source: "Scheduled Maintenance",
    eisenhowerMatrix: "Not Urgent & Not Important",
    dueDate: "2026-05-28",
    status: "completed",
    assignedTo: "Vikram Joshi",
    assignedBy: "Kavita Singh",
    attachments: [],
    createdAt: "2026-05-08",
    isExternal: false,
    category: "Maintenance",
    frequency: "monthly",
    checklist: [
      { id: "cl-022", label: "Clean all outdoor cameras", isChecked: true, checkedAt: "2026-05-14T09:00:00", checkedBy: "Vikram Joshi" },
      { id: "cl-023", label: "Clean all indoor cameras", isChecked: true, checkedAt: "2026-05-14T11:00:00", checkedBy: "Vikram Joshi" },
      { id: "cl-024", label: "Verify recording status", isChecked: true, checkedAt: "2026-05-14T14:00:00", checkedBy: "Vikram Joshi" },
      { id: "cl-025", label: "Report non-functional units", isChecked: true, checkedAt: "2026-05-14T15:00:00", checkedBy: "Vikram Joshi" },
    ],
    comments: [
      { id: "cm-005", userId: "u-009", userName: "Vikram Joshi", body: "All 24 cameras cleaned and operational. Camera #18 has slight image blur - may need lens replacement.", attachmentUrl: null, createdAt: "2026-05-14T15:30:00" },
    ],
    escalations: [],
  },
  {
    id: "t-007",
    facilityId: "f-001",
    title: "Landscape garden bed renovation",
    description: "Renovate the main garden bed near the entrance. Remove dead plants, add new seasonal flowers, and mulch.",
    department: "Landscaping",
    responsibility: "Supervisor",
    priority: "low",
    source: "Management Directive",
    eisenhowerMatrix: "Not Urgent & Not Important",
    dueDate: "2026-05-15",
    status: "completed",
    assignedTo: "Deepa Nair",
    assignedBy: "Priya Sharma",
    attachments: ["garden-before.jpg", "garden-after.jpg"],
    createdAt: "2026-05-05",
    isExternal: false,
    category: "Landscaping",
    frequency: "quarterly",
    checklist: [
      { id: "cl-026", label: "Remove dead plants", isChecked: true, checkedAt: "2026-05-10T08:00:00", checkedBy: "Deepa Nair" },
      { id: "cl-027", label: "Prepare soil bed", isChecked: true, checkedAt: "2026-05-10T10:00:00", checkedBy: "Deepa Nair" },
      { id: "cl-028", label: "Plant new seasonal flowers", isChecked: true, checkedAt: "2026-05-11T09:00:00", checkedBy: "Deepa Nair" },
      { id: "cl-029", label: "Apply mulch layer", isChecked: true, checkedAt: "2026-05-11T14:00:00", checkedBy: "Deepa Nair" },
    ],
    comments: [],
    escalations: [],
  },
  {
    id: "t-008",
    facilityId: "f-001",
    title: "Elevator annual maintenance contract renewal",
    description: "Coordinate with elevator vendor for AMC renewal. Review contract terms and negotiate pricing.",
    department: "Administration",
    responsibility: "Manager",
    priority: "high",
    source: "Vendor Follow-up",
    eisenhowerMatrix: "Urgent & Important",
    dueDate: "2026-05-16",
    status: "cancelled",
    assignedTo: "Anita Desai",
    assignedBy: "Priya Sharma",
    attachments: ["amc-draft.pdf"],
    createdAt: "2026-05-01",
    isExternal: true,
    category: "Contract",
    frequency: "yearly",
    checklist: [
      { id: "cl-030", label: "Review existing AMC terms", isChecked: true, checkedAt: "2026-05-02T10:00:00", checkedBy: "Anita Desai" },
      { id: "cl-031", label: "Get competitive quotes", isChecked: true, checkedAt: "2026-05-05T16:00:00", checkedBy: "Anita Desai" },
      { id: "cl-032", label: "Negotiate terms with vendor", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [
      { id: "cm-006", userId: "u-008", userName: "Anita Desai", body: "Vendor has been changed. This task is no longer relevant.", attachmentUrl: null, createdAt: "2026-05-10T09:00:00" },
    ],
    escalations: [],
  },
  {
    id: "t-009",
    facilityId: "f-001",
    title: "STP plant weekly parameter check",
    description: "Check STP plant parameters including BOD, COD, pH, and TSS. Record readings and compare with CPCB norms.",
    department: "Maintenance",
    responsibility: "Technician",
    priority: "high",
    source: "Scheduled Maintenance",
    eisenhowerMatrix: "Not Urgent & Important",
    dueDate: "2026-05-22",
    status: "pending",
    assignedTo: "Suresh Reddy",
    assignedBy: "Neha Gupta",
    attachments: [],
    createdAt: "2026-05-18",
    isExternal: false,
    category: "Inspection",
    frequency: "weekly",
    checklist: [
      { id: "cl-033", label: "Check BOD levels", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-034", label: "Check COD levels", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-035", label: "Check pH levels", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-036", label: "Check TSS levels", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-037", label: "Record in log book", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [],
    escalations: [],
  },
  {
    id: "t-010",
    facilityId: "f-001",
    title: "Common area Wi-Fi access point check",
    description: "Check and reset all common area Wi-Fi access points. Verify signal strength and connectivity.",
    department: "Maintenance",
    responsibility: "Technician",
    priority: "low",
    source: "Self-Identified",
    eisenhowerMatrix: "Not Urgent & Not Important",
    dueDate: "2026-05-26",
    status: "unassigned",
    assignedTo: "",
    assignedBy: "Suresh Reddy",
    attachments: [],
    createdAt: "2026-05-17",
    isExternal: false,
    category: "Maintenance",
    frequency: "monthly",
    checklist: [
      { id: "cl-038", label: "Check AP-1 (Lobby)", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-039", label: "Check AP-2 (Clubhouse)", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-040", label: "Check AP-3 (Pool area)", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-041", label: "Run speed tests", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [],
    escalations: [],
  },
  {
    id: "t-011",
    facilityId: "f-001",
    title: "Audit vendor payment reconciliation",
    description: "Reconcile all vendor payments for Q1 2026. Match invoices with payments and flag discrepancies.",
    department: "Finance",
    responsibility: "Manager",
    priority: "medium",
    source: "Audit Finding",
    eisenhowerMatrix: "Urgent & Important",
    dueDate: "2026-05-10",
    status: "in_progress",
    assignedTo: "Anita Desai",
    assignedBy: "Priya Sharma",
    attachments: ["q1-invoices.xlsx"],
    createdAt: "2026-05-03",
    isExternal: false,
    category: "Audit",
    frequency: "quarterly",
    checklist: [
      { id: "cl-042", label: "Collect all Q1 invoices", isChecked: true, checkedAt: "2026-05-04T10:00:00", checkedBy: "Anita Desai" },
      { id: "cl-043", label: "Match with payment records", isChecked: true, checkedAt: "2026-05-06T14:00:00", checkedBy: "Anita Desai" },
      { id: "cl-044", label: "Flag discrepancies", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-045", label: "Prepare reconciliation report", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [
      { id: "cm-007", userId: "u-008", userName: "Anita Desai", body: "Found 3 discrepancies so far. Investigating further.", attachmentUrl: null, createdAt: "2026-05-07T16:00:00" },
    ],
    escalations: [
      { id: "e-002", taskId: "t-011", escalatedTo: "u-002", escalatedToName: "Priya Sharma", escalatedAt: "2026-05-12T10:00:00", reason: "Overdue - requires management attention for vendor dispute resolution", resolvedAt: null },
    ],
  },
  {
    id: "t-012",
    facilityId: "f-001",
    title: "Swimming pool chemical balancing",
    description: "Test and balance pool water chemistry. Adjust chlorine, pH, and alkalinity as needed.",
    department: "Maintenance",
    responsibility: "Technician",
    priority: "medium",
    source: "Scheduled Maintenance",
    eisenhowerMatrix: "Not Urgent & Important",
    dueDate: "2026-05-20",
    status: "completed",
    assignedTo: "Suresh Reddy",
    assignedBy: "Neha Gupta",
    attachments: [],
    createdAt: "2026-05-18",
    isExternal: false,
    category: "Maintenance",
    frequency: "weekly",
    checklist: [
      { id: "cl-046", label: "Test chlorine levels", isChecked: true, checkedAt: "2026-05-19T07:00:00", checkedBy: "Suresh Reddy" },
      { id: "cl-047", label: "Test pH levels", isChecked: true, checkedAt: "2026-05-19T07:15:00", checkedBy: "Suresh Reddy" },
      { id: "cl-048", label: "Adjust chemicals", isChecked: true, checkedAt: "2026-05-19T08:00:00", checkedBy: "Suresh Reddy" },
      { id: "cl-049", label: "Record in maintenance log", isChecked: true, checkedAt: "2026-05-19T08:30:00", checkedBy: "Suresh Reddy" },
    ],
    comments: [],
    escalations: [],
  },
  {
    id: "t-013",
    facilityId: "f-001",
    title: "Prepare monthly MIS report for May",
    description: "Compile monthly MIS report including attendance, complaints, vendor performance, and financial summary.",
    department: "Administration",
    responsibility: "Manager",
    priority: "medium",
    source: "Management Directive",
    eisenhowerMatrix: "Not Urgent & Important",
    dueDate: "2026-06-02",
    status: "pending",
    assignedTo: "Priya Sharma",
    assignedBy: "Priya Sharma",
    attachments: [],
    createdAt: "2026-05-19",
    isExternal: false,
    category: "Reporting",
    frequency: "monthly",
    checklist: [
      { id: "cl-050", label: "Compile attendance data", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-051", label: "Compile complaint summary", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-052", label: "Compile vendor performance", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-053", label: "Compile financial summary", isChecked: false, checkedAt: null, checkedBy: null },
      { id: "cl-054", label: "Review and submit to management", isChecked: false, checkedAt: null, checkedBy: null },
    ],
    comments: [],
    escalations: [],
  },
];

// ==================== MOCK TEMPLATES ====================

export const MOCK_TEMPLATES: TaskTemplate[] = [
  {
    id: "tmpl-001",
    title: "Daily Housekeeping Checklist",
    description: "Standard daily housekeeping routine for common areas",
    sopChecklist: ["Sweep and mop lobby", "Clean elevators", "Clean staircases", "Clean washrooms", "Empty trash bins", "Dust furniture"],
    category: "Cleaning",
    frequency: "daily",
    isExternal: false,
    createdAt: "2026-01-15",
  },
  {
    id: "tmpl-002",
    title: "Weekly Security Audit",
    description: "Weekly security equipment and patrol audit",
    sopChecklist: ["Check all CCTV cameras", "Verify access control logs", "Inspect fire equipment", "Check emergency lighting", "Review guard patrol records"],
    category: "Security",
    frequency: "weekly",
    isExternal: false,
    createdAt: "2026-01-20",
  },
  {
    id: "tmpl-003",
    title: "Monthly Electrical Inspection",
    description: "Monthly inspection of electrical panels and equipment",
    sopChecklist: ["Check main panel readings", "Inspect DG sets", "Check transformer oil level", "Test emergency backup", "Verify earthing", "Update log book"],
    category: "Maintenance",
    frequency: "monthly",
    isExternal: false,
    createdAt: "2026-02-01",
  },
  {
    id: "tmpl-004",
    title: "Quarterly Pest Control",
    description: "Coordinate quarterly pest control treatment with external vendor",
    sopChecklist: ["Contact vendor for scheduling", "Send resident notification", "Prepare common areas", "Supervise treatment", "Collect completion certificate", "Record in maintenance log"],
    category: "Vendor Coordination",
    frequency: "quarterly",
    isExternal: true,
    createdAt: "2026-02-10",
  },
  {
    id: "tmpl-005",
    title: "Annual Fire Safety Drill",
    description: "Organize and conduct annual fire safety drill for all residents",
    sopChecklist: ["Coordinate with fire department", "Send advance notification to residents", "Brief security team", "Test fire alarm system", "Conduct evacuation drill", "Debrief and document", "Submit report to management"],
    category: "Safety",
    frequency: "yearly",
    isExternal: false,
    createdAt: "2026-03-01",
  },
];
