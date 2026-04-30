// ==================== POWER READINGS ====================

export const ebMeters = [
  { meterId: "GV-EM-002", location: "DG Incomer - LT Panel", previousKwh: 48543, currentKwh: 0, mf: 1, units: 0 },
  { meterId: "GV-EM-003", location: "Block B - LT Panel", previousKwh: 100908, currentKwh: 0, mf: 1, units: 0 },
  { meterId: "GV-EM-001", location: "Main Incomer - LT Panel - Block A", previousKwh: 127720, currentKwh: 0, mf: 1, units: 0 },
];

export const dgMeters = [
  { meterId: "TEST", location: "basement", previousKwh: 0, currentKwh: 0, mf: 1, units: 0 },
  { meterId: "TEST 01", location: "Basement", previousKwh: 0, currentKwh: 0, mf: 1, units: 0 },
];

// ==================== WATER READINGS ====================

export const waterTanks = [
  { source: "Overhead Tank - Tower A", type: "tank", previousL: 0, currentL: 0, levelPercent: 0, consumed: 0 },
  { source: "Overhead Tank - Tower B", type: "tank", previousL: 214664, currentL: 0, levelPercent: 0, consumed: 0 },
  { source: "Underground Tank - Main", type: "tank", previousL: 288037, currentL: 0, levelPercent: 0, consumed: 0 },
  { source: "Overhead Tank - Tower B", type: "tank", previousL: 213954, currentL: 0, levelPercent: 0, consumed: 0 },
  { source: "Overhead Tank - Tower A", type: "tank", previousL: 219057, currentL: 0, levelPercent: 0, consumed: 0 },
];

export const waterBorewells = [
  { source: "BW-01", type: "borewell", previousL: 127334, currentL: 0, levelPercent: 0, consumed: 0 },
  { source: "BW-02", type: "borewell", previousL: 119059, currentL: 0, levelPercent: 0, consumed: 0 },
  { source: "BW-01", type: "borewell", previousL: 135465, currentL: 0, levelPercent: 0, consumed: 0 },
];

export const waterCavern = [
  { source: "Cauvery / Municipal Supply", type: "cavern", previousL: 102873, currentL: 0, levelPercent: 0, consumed: 0 },
];

export const waterTanker = [
  { source: "Tanker Supply", type: "tanker", previousL: 0, currentL: 0, levelPercent: 0, consumed: 0 },
];

// ==================== WATER QUALITY ====================

export const waterQualityDefaults = {
  stp: { mlss: "2000-4000", backwash: "OFF", flowKL: 0 },
  pool: { phLevel: "7.2-7.6", chlorine: "1.0-3.0", backwash: "OFF", flowKL: 0 },
  ro: { inputTDS: "", outputTDS: "", usageHardness: "", regeneration: "OFF", regenFlowKL: 0 },
  wtp: { inputHardness: "", outputHardness: "", tdsPPM: "", usagePointHardness: "", regeneration: "OFF", regenFlowKL: 0 },
};

// ==================== HYGIENE ====================

export const hygieneCategories = ["Housekeeping", "Pest Control", "Gardening"];

export const housekeepingTasks = [
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
];

export const weeklyTasks = [
  "Deep Clean Carpets",
  "Window Cleaning (Interior & Exterior)",
  "Equipment Maintenance",
  "Inventory Check",
  "Floor Waxing And Polishing",
  "Deep Clean Kitchen Areas",
  "Sanitize All Touch Points",
];

export const monthlyTasks = [
  "Comprehensive Deep Cleaning",
  "Equipment Servicing",
  "Inventory Audit",
  "Staff Training",
  "Quality Assessment",
  "Maintenance Schedule Review",
];

// ==================== POWER CONSUMPTION ====================

export const powerConsumptionData = [
  {
    date: "11-Apr-26",
    meterId: "GV-EM-002",
    location: "DG Incomer - LT Panel",
    previousReading: "48021.00 kWh",
    currentReading: "48543.00 kWh",
    unitsConsumed: "522.00 kWh",
    mf: 1,
    recordedAt: "05:09 PM",
  },
  {
    date: "30-Mar-26",
    meterId: "EB-Main",
    location: "Unknown",
    previousReading: "1200.00 kWh",
    currentReading: "1500.00 kWh",
    unitsConsumed: "300.00 kWh",
    mf: 1,
    recordedAt: "07:52 PM",
  },
  {
    date: "28-Mar-26",
    meterId: "GV-EM-001",
    location: "Main Incomer - LT Panel - Block A",
    previousReading: "127680.00 kWh",
    currentReading: "127720.00 kWh",
    unitsConsumed: "40.00 kWh",
    mf: 1,
    recordedAt: "11:08 AM",
  },
];

// ==================== COMPLAINTS ====================

export type Complaint = {
  ticketId: string;
  title: string;
  status: "Open" | "In Progress" | "Resolved";
  assignedTo: string;
  date: string;
};

export const complaintsData: Complaint[] = [
  { ticketId: "GV-000061", title: "AC not cooling in Conference Room 3", status: "Open", assignedTo: "Unassigned", date: "26-Feb-26" },
  { ticketId: "GV-000062", title: "Water leakage near main entrance", status: "In Progress", assignedTo: "Unassigned", date: "25-Feb-26" },
  { ticketId: "GV-000063", title: "Lift 2 not responding to calls", status: "In Progress", assignedTo: "Unassigned", date: "24-Feb-26" },
  { ticketId: "GV-000064", title: "Housekeeping not done in restroom - 2nd floor", status: "Resolved", assignedTo: "Unassigned", date: "23-Feb-26" },
  { ticketId: "GV-000065", title: "Parking gate barrier not working", status: "Open", assignedTo: "Unassigned", date: "22-Feb-26" },
  { ticketId: "GV-000066", title: "Garden area needs pruning", status: "Open", assignedTo: "Unassigned", date: "21-Feb-26" },
  { ticketId: "GV-000067", title: "Power fluctuation in Block B", status: "In Progress", assignedTo: "Unassigned", date: "20-Feb-26" },
  { ticketId: "GV-000068", title: "Fire extinguisher expired - 3rd floor", status: "Open", assignedTo: "Unassigned", date: "19-Feb-26" },
  { ticketId: "GV-000069", title: "Water pressure low in Tower A", status: "In Progress", assignedTo: "Unassigned", date: "18-Feb-26" },
  { ticketId: "GV-000070", title: "CCTV camera offline - Parking area", status: "Open", assignedTo: "Unassigned", date: "17-Feb-26" },
  { ticketId: "GV-000071", title: "Intercom not working - 5th floor", status: "In Progress", assignedTo: "Unassigned", date: "16-Feb-26" },
  { ticketId: "GV-000072", title: "Broken tiles in lobby area", status: "Open", assignedTo: "Unassigned", date: "15-Feb-26" },
  { ticketId: "GV-000073", title: "Sewage smell near basement parking", status: "Resolved", assignedTo: "Unassigned", date: "14-Feb-26" },
  { ticketId: "GV-000074", title: "Common area lights not working", status: "Resolved", assignedTo: "Unassigned", date: "13-Feb-26" },
  { ticketId: "GV-000075", title: "Generator auto-start failure", status: "Open", assignedTo: "Unassigned", date: "12-Feb-26" },
];

// ==================== TASKS ====================

export type Task = {
  id: string;
  title: string;
  status: "Pending" | "Unassigned" | "In Progress" | "Completed";
  assignedTo: string;
  dueDate: string;
  priority: "Low" | "Medium" | "High" | "Critical";
};

export const tasksData: Task[] = [
  { id: "1", title: "Fix leakage issue in basement", status: "Pending", assignedTo: "Unassigned", dueDate: "11-Apr-26", priority: "High" },
  { id: "2", title: "Inspection Maintenance - Fire_hydrant_coupler_20", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "3", title: "Inspection Maintenance - Fire_hydrant_coupler_19", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "4", title: "Inspection Maintenance - Fire_hydrant_coupler_18", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "5", title: "Inspection Maintenance - Fire_hydrant_coupler_17", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "6", title: "Inspection Maintenance - Fire_hydrant_coupler_16", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "7", title: "Inspection Maintenance - Fire_hydrant_coupler_15", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "8", title: "Inspection Maintenance - Fire_hydrant_coupler_14", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "9", title: "Inspection Maintenance - Fire_hydrant_coupler_13", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
  { id: "10", title: "Inspection Maintenance - Fire_hydrant_coupler_12", status: "Pending", assignedTo: "Unassigned", dueDate: "09-Apr-26", priority: "Medium" },
];

// ==================== PROJECTS ====================

export type Project = {
  id: string;
  name: string;
  manager: string;
  dates: string;
  status: "Planning" | "On Hold" | "In Progress" | "Completed";
};

export const projectsData: Project[] = [
  { id: "1", name: "Landscaping and Garden Enhancement - Phase 9", manager: "Unassigned", dates: "13-Mar-26 - 17-Apr-26", status: "Planning" },
  { id: "2", name: "Fire Safety System Upgrade - Phase 11", manager: "Unassigned", dates: "23-Mar-26 - 22-May-26", status: "On Hold" },
  { id: "3", name: "Lift Modernization Project - Phase 10", manager: "Unassigned", dates: "18-Mar-26 - 26-Jun-26", status: "In Progress" },
  { id: "4", name: "Common Area Renovation - Phase 12", manager: "Unassigned", dates: "28-Mar-26 - 06-Jun-26", status: "Completed" },
  { id: "5", name: "Parking Management System - Phase 4", manager: "Unassigned", dates: "16-Feb-26 - 18-Mar-26", status: "Completed" },
  { id: "6", name: "Smart Building IoT Integration - Phase 7", manager: "Unassigned", dates: "03-Mar-26 - 22-Apr-26", status: "On Hold" },
  { id: "7", name: "Swimming Pool Renovation - Phase 8", manager: "Unassigned", dates: "08-Mar-26 - 02-May-26", status: "Completed" },
  { id: "8", name: "Facade Renovation and Painting - Phase 6", manager: "Unassigned", dates: "26-Feb-26 - 12-May-26", status: "In Progress" },
  { id: "9", name: "Waste Management Automation - Phase 5", manager: "Unassigned", dates: "21-Feb-26 - 02-Apr-26", status: "Planning" },
  { id: "10", name: "Security System Modernization - Phase 3", manager: "Unassigned", dates: "11-Feb-26 - 12-May-26", status: "On Hold" },
  { id: "11", name: "Solar Panel Installation - Phase 2", manager: "Unassigned", dates: "02-Feb-26 - 15-Apr-26", status: "In Progress" },
  { id: "12", name: "Rainwater Harvesting - Phase 1", manager: "Unassigned", dates: "20-Jan-26 - 20-Mar-26", status: "Completed" },
];

// ==================== VENDOR TICKETS ====================

export type VendorTicket = {
  id: string;
  ticketId: string;
  department: string;
  category: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved";
  description: string;
  serviceProvider: string;
  assignedTo: string;
  dueDate: string;
};

export const vendorTicketsData: VendorTicket[] = [
  { id: "1", ticketId: "GV-VT-0067", department: "Operations", category: "Electrical", priority: "Medium", status: "Open", description: "HVAC system maintenance and filter replacement. Check refrigerant levels and system efficiency.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "18/05/2026" },
  { id: "2", ticketId: "GV-VT-0068", department: "Operations", category: "Plumbing", priority: "High", status: "Open", description: "Swimming pool cleaning and chemical balancing. Check filtration system and water quality.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "01/05/2026" },
  { id: "3", ticketId: "GV-VT-0075", department: "Operations", category: "Plumbing", priority: "High", status: "In Progress", description: "Water leakage repair and pipe maintenance. Address reported leaks and pressure issues.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "16/05/2026" },
  { id: "4", ticketId: "GV-VT-0065", department: "Operations", category: "Gardening", priority: "Low", status: "Open", description: "Monthly landscaping and garden maintenance. Pruning, trimming, and plant care services.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "20/05/2026" },
  { id: "5", ticketId: "GV-VT-0069", department: "Operations", category: "Misc", priority: "Medium", status: "In Progress", description: "WTP system maintenance and filter replacement. Ensure water quality standards are met.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "05/05/2026" },
  { id: "6", ticketId: "GV-VT-0072", department: "Operations", category: "Safety", priority: "High", status: "In Progress", description: "Fire safety system inspection and maintenance. Test alarms, sprinklers, and extinguishers.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "12/05/2026" },
  { id: "7", ticketId: "GV-VT-0071", department: "Operations", category: "Electrical", priority: "Medium", status: "Open", description: "HT plant filter replacement and system servicing. Check TDS levels and membrane condition.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "08/05/2026" },
  { id: "8", ticketId: "GV-VT-0073", department: "Operations", category: "Pest Control", priority: "Low", status: "Open", description: "Quarterly pest control treatment for common areas and basement.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "25/05/2026" },
  { id: "9", ticketId: "GV-VT-0074", department: "Operations", category: "Electrical", priority: "Medium", status: "Open", description: "DG set servicing and load testing. Check fuel levels and auto-start mechanism.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "15/05/2026" },
  { id: "10", ticketId: "GV-VT-0076", department: "Operations", category: "Elevator", priority: "Critical", status: "In Progress", description: "Elevator annual maintenance contract inspection. Safety checks and certification renewal.", serviceProvider: "Service Provider", assignedTo: "Unassigned", dueDate: "10/05/2026" },
];
