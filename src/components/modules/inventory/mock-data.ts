export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentQty: number;
  reorderLevel: number;
  unitCost: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  type: "IN" | "OUT" | "ADJUST";
  quantity: number;
  date: string;
  performedBy: string;
  notes: string;
}

export interface UniformIssue {
  id: string;
  employeeId: string;
  employeeName: string;
  empId: string;
  itemName: string;
  quantity: number;
  issueDate: string;
  deductionAmount: number;
  deductionStatus: "pending" | "deducted";
}

export const CATEGORIES = [
  "Cleaning Supplies",
  "Electrical",
  "Plumbing",
  "Safety Equipment",
  "Office Supplies",
  "Uniforms",
  "Tools",
  "Consumables",
] as const;

export const MOCK_ITEMS: InventoryItem[] = [
  { id: "inv-1", name: "Floor Cleaner (5L)", category: "Cleaning Supplies", unit: "Bottles", currentQty: 45, reorderLevel: 20, unitCost: 350, status: "in_stock" },
  { id: "inv-2", name: "Glass Cleaner (1L)", category: "Cleaning Supplies", unit: "Bottles", currentQty: 12, reorderLevel: 15, unitCost: 180, status: "low_stock" },
  { id: "inv-3", name: "LED Tube Light 4ft", category: "Electrical", unit: "Pieces", currentQty: 30, reorderLevel: 10, unitCost: 220, status: "in_stock" },
  { id: "inv-4", name: "MCB 32A Switch", category: "Electrical", unit: "Pieces", currentQty: 5, reorderLevel: 8, unitCost: 450, status: "low_stock" },
  { id: "inv-5", name: "PVC Pipe 1 inch (10ft)", category: "Plumbing", unit: "Pieces", currentQty: 20, reorderLevel: 5, unitCost: 120, status: "in_stock" },
  { id: "inv-6", name: "Safety Helmet", category: "Safety Equipment", unit: "Pieces", currentQty: 0, reorderLevel: 10, unitCost: 280, status: "out_of_stock" },
  { id: "inv-7", name: "Fire Extinguisher (5kg)", category: "Safety Equipment", unit: "Pieces", currentQty: 8, reorderLevel: 5, unitCost: 1800, status: "in_stock" },
  { id: "inv-8", name: "A4 Paper Ream", category: "Office Supplies", unit: "Reams", currentQty: 25, reorderLevel: 10, unitCost: 320, status: "in_stock" },
  { id: "inv-9", name: "Supervisor Uniform Set", category: "Uniforms", unit: "Sets", currentQty: 3, reorderLevel: 5, unitCost: 1200, status: "low_stock" },
  { id: "inv-10", name: "Housekeeping Uniform Set", category: "Uniforms", unit: "Sets", currentQty: 15, reorderLevel: 10, unitCost: 800, status: "in_stock" },
  { id: "inv-11", name: "Adjustable Wrench", category: "Tools", unit: "Pieces", currentQty: 6, reorderLevel: 3, unitCost: 450, status: "in_stock" },
  { id: "inv-12", name: "Hand Wash Liquid (5L)", category: "Consumables", unit: "Bottles", currentQty: 8, reorderLevel: 10, unitCost: 250, status: "low_stock" },
];

export const MOCK_TRANSACTIONS: InventoryTransaction[] = [
  { id: "txn-1", itemId: "inv-1", type: "IN", quantity: 20, date: "2026-05-20", performedBy: "Kumar A", notes: "Monthly restock" },
  { id: "txn-2", itemId: "inv-2", type: "OUT", quantity: 5, date: "2026-05-19", performedBy: "Naveen Kumar", notes: "Issued to Block A" },
  { id: "txn-3", itemId: "inv-6", type: "OUT", quantity: 10, date: "2026-05-18", performedBy: "Venkatesh N", notes: "Issued to new joiners" },
  { id: "txn-4", itemId: "inv-9", type: "OUT", quantity: 2, date: "2026-05-18", performedBy: "Sanjeevini G", notes: "Issued to supervisors" },
  { id: "txn-5", itemId: "inv-3", type: "ADJUST", quantity: -2, date: "2026-05-17", performedBy: "Kumar A", notes: "Damaged items removed" },
  { id: "txn-6", itemId: "inv-8", type: "IN", quantity: 50, date: "2026-05-16", performedBy: "Sudhir Kumar", notes: "Quarterly order" },
];

export const MOCK_UNIFORM_ISSUES: UniformIssue[] = [
  { id: "uni-1", employeeId: "emp-1", employeeName: "Naveen Kumar", empId: "EMP0004", itemName: "Housekeeping Uniform Set", quantity: 2, issueDate: "2026-05-15", deductionAmount: 1600, deductionStatus: "deducted" },
  { id: "uni-2", employeeId: "emp-2", employeeName: "Venkatesh N", empId: "EMP0005", itemName: "Supervisor Uniform Set", quantity: 1, issueDate: "2026-05-14", deductionAmount: 1200, deductionStatus: "pending" },
  { id: "uni-3", employeeId: "emp-3", employeeName: "Govindaraju Reddy", empId: "EMP0003", itemName: "Housekeeping Uniform Set", quantity: 1, issueDate: "2026-05-10", deductionAmount: 800, deductionStatus: "deducted" },
  { id: "uni-4", employeeId: "emp-4", employeeName: "Nataraj P", empId: "EMP0006", itemName: "Safety Helmet", quantity: 1, issueDate: "2026-05-08", deductionAmount: 280, deductionStatus: "pending" },
  { id: "uni-5", employeeId: "emp-5", employeeName: "Alok Kumar Malik", empId: "EMP0007", itemName: "Supervisor Uniform Set", quantity: 1, issueDate: "2026-05-05", deductionAmount: 1200, deductionStatus: "deducted" },
];
