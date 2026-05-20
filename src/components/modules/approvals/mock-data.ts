export type RequestType = "advance" | "uniform" | "petty_cash" | "po" | "invoice" | "salary_revision";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalStep {
  id: string;
  role: string;
  approverName: string;
  status: ApprovalStatus | "waiting";
  actedAt: string | null;
  comments: string;
}

export interface ApprovalRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string;
  amount: number;
  requestedBy: string;
  requestedAt: string;
  status: ApprovalStatus;
  currentStep: number;
  steps: ApprovalStep[];
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  advance: "Salary Advance",
  uniform: "Uniform Request",
  petty_cash: "Petty Cash",
  po: "Purchase Order",
  invoice: "Invoice Approval",
  salary_revision: "Salary Revision",
};

export const MOCK_REQUESTS: ApprovalRequest[] = [
  {
    id: "apr-1",
    type: "advance",
    title: "Salary advance for medical expenses",
    description: "Need salary advance of Rs 15,000 for hospital admission.",
    amount: 15000,
    requestedBy: "Naveen Kumar",
    requestedAt: "2026-05-19",
    status: "pending",
    currentStep: 1,
    steps: [
      { id: "s1", role: "Supervisor", approverName: "Kumar A", status: "approved", actedAt: "2026-05-19", comments: "Approved" },
      { id: "s2", role: "Site Manager", approverName: "Venkatesh N", status: "pending", actedAt: null, comments: "" },
      { id: "s3", role: "Accounts", approverName: "Sudhir Kumar", status: "waiting", actedAt: null, comments: "" },
    ],
  },
  {
    id: "apr-2",
    type: "po",
    title: "Purchase Order — Cleaning Supplies Q2",
    description: "Quarterly cleaning supplies for Block A and B.",
    amount: 45000,
    requestedBy: "Kumar A",
    requestedAt: "2026-05-18",
    status: "pending",
    currentStep: 0,
    steps: [
      { id: "s4", role: "Operations Head", approverName: "Govindaraju Reddy", status: "pending", actedAt: null, comments: "" },
      { id: "s5", role: "Management", approverName: "Admin", status: "waiting", actedAt: null, comments: "" },
    ],
  },
  {
    id: "apr-3",
    type: "uniform",
    title: "New uniform sets for housekeeping",
    description: "10 housekeeping uniform sets for new joiners.",
    amount: 8000,
    requestedBy: "Sanjeevini G",
    requestedAt: "2026-05-17",
    status: "approved",
    currentStep: 2,
    steps: [
      { id: "s6", role: "Supervisor", approverName: "Kumar A", status: "approved", actedAt: "2026-05-17", comments: "Approved" },
      { id: "s7", role: "HR", approverName: "Bhagyalaxmi D", status: "approved", actedAt: "2026-05-18", comments: "Confirmed requirement" },
    ],
  },
  {
    id: "apr-4",
    type: "petty_cash",
    title: "Petty cash — plumbing emergency repair",
    description: "Emergency plumbing repair in Block C washroom.",
    amount: 3500,
    requestedBy: "Nataraj P",
    requestedAt: "2026-05-16",
    status: "approved",
    currentStep: 1,
    steps: [
      { id: "s8", role: "Site Manager", approverName: "Venkatesh N", status: "approved", actedAt: "2026-05-16", comments: "Urgent — approved" },
    ],
  },
  {
    id: "apr-5",
    type: "invoice",
    title: "Vendor invoice — Electrical supplies",
    description: "Invoice from ElectroParts for MCBs and wiring.",
    amount: 28000,
    requestedBy: "Alok Kumar Malik",
    requestedAt: "2026-05-15",
    status: "rejected",
    currentStep: 1,
    steps: [
      { id: "s9", role: "Operations Head", approverName: "Govindaraju Reddy", status: "approved", actedAt: "2026-05-15", comments: "OK" },
      { id: "s10", role: "Accounts", approverName: "Sudhir Kumar", status: "rejected", actedAt: "2026-05-16", comments: "Invoice amount mismatch with PO" },
    ],
  },
  {
    id: "apr-6",
    type: "salary_revision",
    title: "Salary revision — Janmejay M",
    description: "Performance-based increment after annual review.",
    amount: 5000,
    requestedBy: "Bhagyalaxmi D",
    requestedAt: "2026-05-14",
    status: "pending",
    currentStep: 1,
    steps: [
      { id: "s11", role: "HR", approverName: "Bhagyalaxmi D", status: "approved", actedAt: "2026-05-14", comments: "Recommended" },
      { id: "s12", role: "Operations Head", approverName: "Govindaraju Reddy", status: "pending", actedAt: null, comments: "" },
      { id: "s13", role: "Management", approverName: "Admin", status: "waiting", actedAt: null, comments: "" },
    ],
  },
  {
    id: "apr-7",
    type: "advance",
    title: "Advance for travel — Prakash Reddy",
    description: "Travel advance for site inspection trip.",
    amount: 10000,
    requestedBy: "Prakash Reddy",
    requestedAt: "2026-05-12",
    status: "approved",
    currentStep: 2,
    steps: [
      { id: "s14", role: "Site Manager", approverName: "Venkatesh N", status: "approved", actedAt: "2026-05-12", comments: "Approved" },
      { id: "s15", role: "Accounts", approverName: "Sudhir Kumar", status: "approved", actedAt: "2026-05-13", comments: "Processed" },
    ],
  },
];
