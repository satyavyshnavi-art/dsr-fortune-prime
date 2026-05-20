export type ReqStatus = "open" | "in_progress" | "filled" | "cancelled";
export type CandidateStatus = "applied" | "interviewed" | "offered" | "joined" | "rejected";
export type EvalLevel = "self" | "ops_head" | "hr" | "management";
export type EventType = "joining" | "confirmation" | "promotion" | "warning" | "separation";

export interface JobRequirement {
  id: string;
  title: string;
  department: string;
  positions: number;
  filled: number;
  status: ReqStatus;
  postedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  requirementId: string;
  requirementTitle: string;
  status: CandidateStatus;
  appliedAt: string;
  interviewDate: string | null;
  interviewScore: number | null;
  recommendation: "strong_yes" | "yes" | "maybe" | "no" | null;
}

export interface GoalEvaluation {
  level: EvalLevel;
  score: number;
  comments: string;
}

export interface EmployeeGoal {
  id: string;
  employeeId: string;
  employeeName: string;
  empId: string;
  goalTitle: string;
  targetDate: string;
  status: "in_progress" | "completed" | "overdue";
  evaluations: GoalEvaluation[];
}

export interface LifecycleEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  empId: string;
  type: EventType;
  date: string;
  description: string;
}

export const DEPARTMENTS = [
  "Operations",
  "Housekeeping",
  "Security",
  "Electrical",
  "Plumbing",
  "Maintenance",
  "Administration",
  "HR",
] as const;

export const EVAL_LEVEL_LABELS: Record<EvalLevel, string> = {
  self: "Self",
  ops_head: "Ops Head",
  hr: "HR",
  management: "Management",
};

export const MOCK_REQUIREMENTS: JobRequirement[] = [
  { id: "req-1", title: "Housekeeping Staff", department: "Housekeeping", positions: 5, filled: 3, status: "in_progress", postedAt: "2026-05-01" },
  { id: "req-2", title: "Security Guard", department: "Security", positions: 3, filled: 3, status: "filled", postedAt: "2026-04-15" },
  { id: "req-3", title: "Electrical Technician", department: "Electrical", positions: 2, filled: 0, status: "open", postedAt: "2026-05-10" },
  { id: "req-4", title: "Site Supervisor", department: "Operations", positions: 1, filled: 0, status: "open", postedAt: "2026-05-15" },
  { id: "req-5", title: "Plumber", department: "Plumbing", positions: 2, filled: 1, status: "in_progress", postedAt: "2026-04-20" },
  { id: "req-6", title: "Admin Assistant", department: "Administration", positions: 1, filled: 0, status: "cancelled", postedAt: "2026-03-01" },
];

export const MOCK_CANDIDATES: Candidate[] = [
  { id: "cand-1", name: "Ravi Kumar", email: "ravi@example.com", phone: "+91-9876543210", requirementId: "req-1", requirementTitle: "Housekeeping Staff", status: "joined", appliedAt: "2026-05-02", interviewDate: "2026-05-05", interviewScore: 85, recommendation: "yes" },
  { id: "cand-2", name: "Meena S", email: "meena@example.com", phone: "+91-9876543211", requirementId: "req-1", requirementTitle: "Housekeeping Staff", status: "interviewed", appliedAt: "2026-05-03", interviewDate: "2026-05-08", interviewScore: 72, recommendation: "maybe" },
  { id: "cand-3", name: "Arjun P", email: "arjun@example.com", phone: "+91-9876543212", requirementId: "req-3", requirementTitle: "Electrical Technician", status: "applied", appliedAt: "2026-05-12", interviewDate: null, interviewScore: null, recommendation: null },
  { id: "cand-4", name: "Divya M", email: "divya@example.com", phone: "+91-9876543213", requirementId: "req-4", requirementTitle: "Site Supervisor", status: "offered", appliedAt: "2026-05-16", interviewDate: "2026-05-18", interviewScore: 92, recommendation: "strong_yes" },
  { id: "cand-5", name: "Suresh R", email: "suresh@example.com", phone: "+91-9876543214", requirementId: "req-1", requirementTitle: "Housekeeping Staff", status: "rejected", appliedAt: "2026-05-04", interviewDate: "2026-05-06", interviewScore: 40, recommendation: "no" },
  { id: "cand-6", name: "Lakshmi V", email: "lakshmi@example.com", phone: "+91-9876543215", requirementId: "req-5", requirementTitle: "Plumber", status: "joined", appliedAt: "2026-04-22", interviewDate: "2026-04-25", interviewScore: 78, recommendation: "yes" },
];

export const MOCK_GOALS: EmployeeGoal[] = [
  {
    id: "goal-1", employeeId: "emp-1", employeeName: "Naveen Kumar", empId: "EMP0004",
    goalTitle: "Complete safety training certification", targetDate: "2026-06-30", status: "in_progress",
    evaluations: [
      { level: "self", score: 80, comments: "On track to complete by deadline" },
      { level: "ops_head", score: 75, comments: "Good progress, needs to attend 2 more sessions" },
    ],
  },
  {
    id: "goal-2", employeeId: "emp-2", employeeName: "Venkatesh N", empId: "EMP0005",
    goalTitle: "Reduce asset downtime by 15%", targetDate: "2026-06-30", status: "in_progress",
    evaluations: [
      { level: "self", score: 70, comments: "Implemented preventive schedule" },
      { level: "ops_head", score: 65, comments: "Partial improvement, needs more focus" },
      { level: "hr", score: 68, comments: "Acceptable progress" },
    ],
  },
  {
    id: "goal-3", employeeId: "emp-3", employeeName: "Kumar A", empId: "EMP0001",
    goalTitle: "Improve complaint resolution time to < 24hrs", targetDate: "2026-05-31", status: "completed",
    evaluations: [
      { level: "self", score: 90, comments: "Achieved target consistently" },
      { level: "ops_head", score: 88, comments: "Excellent improvement" },
      { level: "hr", score: 85, comments: "Met all KPIs" },
      { level: "management", score: 87, comments: "Well done" },
    ],
  },
  {
    id: "goal-4", employeeId: "emp-4", employeeName: "Govindaraju Reddy", empId: "EMP0003",
    goalTitle: "Implement new vendor onboarding process", targetDate: "2026-04-30", status: "overdue",
    evaluations: [
      { level: "self", score: 50, comments: "Delayed due to vendor availability" },
      { level: "ops_head", score: 45, comments: "Needs to escalate blockers" },
    ],
  },
];

export const MOCK_LIFECYCLE_EVENTS: LifecycleEvent[] = [
  { id: "evt-1", employeeId: "emp-1", employeeName: "Naveen Kumar", empId: "EMP0004", type: "joining", date: "2025-03-15", description: "Joined as Housekeeping Executive" },
  { id: "evt-2", employeeId: "emp-1", employeeName: "Naveen Kumar", empId: "EMP0004", type: "confirmation", date: "2025-09-15", description: "Confirmed after probation" },
  { id: "evt-3", employeeId: "emp-2", employeeName: "Venkatesh N", empId: "EMP0005", type: "joining", date: "2024-06-01", description: "Joined as Site Supervisor" },
  { id: "evt-4", employeeId: "emp-2", employeeName: "Venkatesh N", empId: "EMP0005", type: "promotion", date: "2025-06-01", description: "Promoted to Site Manager" },
  { id: "evt-5", employeeId: "emp-3", employeeName: "Kumar A", empId: "EMP0001", type: "joining", date: "2023-01-10", description: "Joined as Operations Supervisor" },
  { id: "evt-6", employeeId: "emp-3", employeeName: "Kumar A", empId: "EMP0001", type: "promotion", date: "2024-04-01", description: "Promoted to Operations Head" },
  { id: "evt-7", employeeId: "emp-4", employeeName: "Nataraj P", empId: "EMP0006", type: "joining", date: "2025-11-01", description: "Joined as Plumber" },
  { id: "evt-8", employeeId: "emp-4", employeeName: "Nataraj P", empId: "EMP0006", type: "warning", date: "2026-02-15", description: "Warning for repeated late attendance" },
  { id: "evt-9", employeeId: "emp-5", employeeName: "Alok Kumar Malik", empId: "EMP0007", type: "joining", date: "2024-08-20", description: "Joined as Electrical Technician" },
  { id: "evt-10", employeeId: "emp-5", employeeName: "Alok Kumar Malik", empId: "EMP0007", type: "separation", date: "2026-05-10", description: "Resigned — personal reasons" },
];
