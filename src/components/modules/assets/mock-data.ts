// ==================== ASSET MANAGEMENT MOCK DATA ====================

export interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  activeCount: number;
  maintenanceCount: number;
  inactiveCount: number;
  totalAssets: number;
  mostRecentAsset: {
    name: string;
    location: string;
  };
}

export interface Asset {
  id: string;
  name: string;
  assetTag: string;
  categoryId: string;
  categoryName: string;
  location: string;
  status: "active" | "maintenance" | "inactive";
  maintenanceFrequency: string;
  lastChecked: string;
  serviceHistory: string;
  qrCodeData: string;
}

export interface AMCContract {
  id: string;
  _dbId?: string;
  contractId: string;
  vendorName: string;
  description: string;
  contractType: string;
  serviceProvider: string;
  contractValue: number;
  validUntil: string;
  status: "active" | "expiring" | "expired";
}

export interface BreakdownRecord {
  id: string;
  _dbId?: string;
  title: string;
  type: "Inspection" | "Replacement" | "Maintenance";
  serviceProvider: string;
  asset: string;
  serviceId: string;
  date: string;
  cost: number;
  status: "Completed" | "In Progress" | "Pending";
}

export interface GatePass {
  id: string;
  _dbId?: string;
  assetName: string;
  assetTag: string;
  gatePassType: string;
  status: "Out" | "Returned" | "Approved" | "Pending";
  dateTimeOut: string;
  serviceProvider: string;
}

export interface PPMTask {
  id: string;
  assetName: string;
  categoryName: string;
  weekNumber: number;
  status: "completed" | "overdue" | "in_progress" | "scheduled";
  scheduledDate: string;
}

export interface AuditScanRecord {
  id: string;
  assetTag: string;
  assetName: string;
  blockType: string;
  block: string;
  floor: string;
  condition: "Good" | "Needs Repair" | "Damaged" | "Missing" | "";
  scannedBy: string;
  dateTime: string;
  notes: string;
  gps: boolean;
}

export interface AuditConfig {
  id: string;
  category: string;
  frequency: "Monthly" | "Quarterly" | "Half Yearly" | "Yearly";
  created: string;
}

export interface IncidentReport {
  id: string;
  title: string;
  description: string;
  fiveWhys: string[];
  correctiveAction: string;
  preventiveAction: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
}

// ---------- Categories ----------
export const mockCategories: AssetCategory[] = [
  {
    id: "cat-1",
    name: "Earthing pits",
    icon: "Zap",
    activeCount: 1,
    maintenanceCount: 1,
    inactiveCount: 0,
    totalAssets: 2,
    mostRecentAsset: { name: "Earthing Pit - Tower A", location: "Parking Area" },
  },
  {
    id: "cat-2",
    name: "HVAC",
    icon: "Wind",
    activeCount: 116,
    maintenanceCount: 3,
    inactiveCount: 0,
    totalAssets: 119,
    mostRecentAsset: { name: "AC OUTDOOR UNIT", location: "MASSAGE ROOM" },
  },
  {
    id: "cat-3",
    name: "Fire safety",
    icon: "Flame",
    activeCount: 40,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 40,
    mostRecentAsset: { name: "FAPA PANELRFD", location: "PANCHAYATHI 3" },
  },
  {
    id: "cat-4",
    name: "Tanks",
    icon: "Container",
    activeCount: 1,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 1,
    mostRecentAsset: { name: "Overhead Water Tank - Tower A", location: "Roof Top" },
  },
  {
    id: "cat-5",
    name: "Electric panels",
    icon: "PlugZap",
    activeCount: 8,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 8,
    mostRecentAsset: { name: "Club house panel room", location: "Electrical room" },
  },
  {
    id: "cat-6",
    name: "Pumps",
    icon: "Droplets",
    activeCount: 30,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 30,
    mostRecentAsset: { name: "SWIMMING POOL PUMP", location: "PUMP ROOM" },
  },
  {
    id: "cat-7",
    name: "Motors",
    icon: "Cog",
    activeCount: 8,
    maintenanceCount: 0,
    inactiveCount: 1,
    totalAssets: 9,
    mostRecentAsset: { name: "STP Blower Unit - Primary", location: "Basement 1" },
  },
  {
    id: "cat-8",
    name: "Lifts",
    icon: "ArrowUpDown",
    activeCount: 10,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 10,
    mostRecentAsset: { name: "Passenger Lift", location: "" },
  },
  {
    id: "cat-9",
    name: "DGs",
    icon: "Battery",
    activeCount: 6,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 6,
    mostRecentAsset: { name: "DG Set - Primary", location: "DG Room" },
  },
  {
    id: "cat-10",
    name: "Transformers",
    icon: "Zap",
    activeCount: 4,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 4,
    mostRecentAsset: { name: "Distribution Transformer - Block A", location: "" },
  },
  {
    id: "cat-11",
    name: "Miscellaneous",
    icon: "Package",
    activeCount: 12,
    maintenanceCount: 0,
    inactiveCount: 0,
    totalAssets: 12,
    mostRecentAsset: { name: "CCTV Camera - Entrance", location: "Gate 1" },
  },
];

// ---------- Assets ----------
export const mockAssets: Asset[] = [
  {
    id: "asset-1",
    name: "Earthing Pit - Tower A",
    assetTag: "GV-EARTH-02",
    categoryId: "cat-1",
    categoryName: "Earthing pits",
    location: "Tower A, Ground, Parking Area",
    status: "maintenance",
    maintenanceFrequency: "Quarterly",
    lastChecked: "17/06/2025",
    serviceHistory: "Earthing pit for Tower A electrical system",
    qrCodeData: "assetId=49634a71-78bab69b8d820e-83-63876-GV-EARTH-02",
  },
  {
    id: "asset-2",
    name: "Earthing Pit - Main Building",
    assetTag: "GV-EARTH-01",
    categoryId: "cat-1",
    categoryName: "Earthing pits",
    location: "Main Building, Ground, Parking Area",
    status: "active",
    maintenanceFrequency: "Quarterly",
    lastChecked: "01/07/2026",
    serviceHistory: "",
    qrCodeData: "assetId=58723b82-92cab79c9e931f-45-74987-GV-EARTH-01",
  },
  {
    id: "asset-3",
    name: "AC OUTDOOR UNIT",
    assetTag: "GV-HVAC-001",
    categoryId: "cat-2",
    categoryName: "HVAC",
    location: "MASSAGE ROOM",
    status: "active",
    maintenanceFrequency: "Monthly",
    lastChecked: "17/04/2026",
    serviceHistory: "Regular maintenance completed",
    qrCodeData: "asset|gv-hvac-001",
  },
  {
    id: "asset-4",
    name: "AC SPLIT INDOOR UNIT",
    assetTag: "GV-HVAC-002",
    categoryId: "cat-2",
    categoryName: "HVAC",
    location: "MASSAGE ROOM",
    status: "active",
    maintenanceFrequency: "Monthly",
    lastChecked: "17/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-hvac-002",
  },
  {
    id: "asset-5",
    name: "FAPA PANELRFD",
    assetTag: "GV-FIRE-001",
    categoryId: "cat-3",
    categoryName: "Fire safety",
    location: "PANCHAYATHI 3",
    status: "active",
    maintenanceFrequency: "Monthly",
    lastChecked: "15/03/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-fire-001",
  },
  {
    id: "asset-6",
    name: "Overhead Water Tank - Tower A",
    assetTag: "GV-TANK-001",
    categoryId: "cat-4",
    categoryName: "Tanks",
    location: "Roof Top",
    status: "active",
    maintenanceFrequency: "Monthly",
    lastChecked: "10/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-tank-001",
  },
  {
    id: "asset-7",
    name: "Club house panel room",
    assetTag: "GV-ELEC-001",
    categoryId: "cat-5",
    categoryName: "Electric panels",
    location: "Electrical room",
    status: "active",
    maintenanceFrequency: "Quarterly",
    lastChecked: "01/03/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-elec-001",
  },
  {
    id: "asset-8",
    name: "SWIMMING POOL PUMP",
    assetTag: "GV-PUMP-001",
    categoryId: "cat-6",
    categoryName: "Pumps",
    location: "PUMP ROOM",
    status: "active",
    maintenanceFrequency: "Weekly",
    lastChecked: "20/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-pump-001",
  },
  {
    id: "asset-9",
    name: "STP Blower Unit - Primary",
    assetTag: "GV-MOT-001",
    categoryId: "cat-7",
    categoryName: "Motors",
    location: "Basement 1",
    status: "active",
    maintenanceFrequency: "Monthly",
    lastChecked: "15/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-mot-001",
  },
  {
    id: "asset-10",
    name: "Passenger Lift",
    assetTag: "GV-LIFT-001",
    categoryId: "cat-8",
    categoryName: "Lifts",
    location: "Tower A",
    status: "active",
    maintenanceFrequency: "Monthly",
    lastChecked: "20/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-lift-001",
  },
  {
    id: "asset-11",
    name: "Domestic Water Pump - Tower A",
    assetTag: "GV-PUMP-002",
    categoryId: "cat-6",
    categoryName: "Pumps",
    location: "Pump Room, Tower A",
    status: "active",
    maintenanceFrequency: "Weekly",
    lastChecked: "18/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-pump-002",
  },
  {
    id: "asset-12",
    name: "Fire Hydrant System",
    assetTag: "GV-FIRE-002",
    categoryId: "cat-3",
    categoryName: "Fire safety",
    location: "Tower A, Basement",
    status: "active",
    maintenanceFrequency: "Quarterly",
    lastChecked: "01/04/2026",
    serviceHistory: "",
    qrCodeData: "asset|gv-fire-002",
  },
];

// ---------- AMC Contracts ----------
export const mockAMCContracts: AMCContract[] = [
  {
    id: "amc-1",
    contractId: "AMC-2026-001001",
    vendorName: "Comprehensive AMC - Carrier HVAC Services",
    description: "Annual maintenance contract for All HVAC Maintenance, Chiller Servicing, AHU Repair",
    contractType: "Comprehensive AMC",
    serviceProvider: "Carrier HVAC Services",
    contractValue: 1156168,
    validUntil: "01/12/2026",
    status: "active",
  },
  {
    id: "amc-2",
    contractId: "AMC-2026-001002",
    vendorName: "Annual Service Contract - GreenView AMC Services",
    description: "Annual maintenance contract for Comprehensive AMC, Preventive Maintenance, Emergency Services",
    contractType: "Annual Service Contract",
    serviceProvider: "GreenView AMC Services",
    contractValue: 168700,
    validUntil: "01/09/2026",
    status: "active",
  },
  {
    id: "amc-3",
    contractId: "AMC-2026-001003",
    vendorName: "Breakdown Maintenance - ABB Electrical Services",
    description: "Annual maintenance contract for Transformer Maintenance, Panel Servicing, Electrical Works",
    contractType: "Breakdown Maintenance",
    serviceProvider: "ABB Electrical Services",
    contractValue: 406234,
    validUntil: "15/09/2026",
    status: "active",
  },
  {
    id: "amc-4",
    contractId: "AMC-2026-001004",
    vendorName: "Preventive Maintenance - Kirloskar Pump Services",
    description: "Annual maintenance contract for Pump Maintenance, Motor Repair, Water System Services",
    contractType: "Preventive Maintenance",
    serviceProvider: "Kirloskar Pump Services",
    contractValue: 526252,
    validUntil: "01/12/2026",
    status: "active",
  },
  {
    id: "amc-5",
    contractId: "AMC-2026-001005",
    vendorName: "Comprehensive AMC - Honeywell Fire Safety",
    description: "Annual maintenance contract for Fire Alarm Maintenance, Systems, Fire Safety, Inspection",
    contractType: "Comprehensive AMC",
    serviceProvider: "Honeywell Fire Safety",
    contractValue: 471561,
    validUntil: "01/07/2026",
    status: "active",
  },
  {
    id: "amc-6",
    contractId: "AMC-2026-001006",
    vendorName: "Annual Service Contract - Otis Elevator Services",
    description: "Annual maintenance contract for Lift Maintenance, Lift Safety",
    contractType: "Annual Service Contract",
    serviceProvider: "Otis Elevator Services",
    contractValue: 512515,
    validUntil: "01/07/2026",
    status: "active",
  },
];

// ---------- Breakdown Records ----------
export const mockBreakdowns: BreakdownRecord[] = [
  {
    id: "bd-1",
    title: "Inspection - Domestic Water Pump - Tower A",
    type: "Inspection",
    serviceProvider: "Honeywell Fire Safety",
    asset: "Domestic Water Pump - Tower A",
    serviceId: "SRV-20260226-003",
    date: "27-Feb-26",
    cost: 37971,
    status: "Completed",
  },
  {
    id: "bd-2",
    title: "Replacement - Fire Hydrant System",
    type: "Replacement",
    serviceProvider: "Otis Elevator Services",
    asset: "Fire Hydrant System",
    serviceId: "SRV-20260226-020",
    date: "27-Feb-26",
    cost: 37446,
    status: "Completed",
  },
  {
    id: "bd-3",
    title: "Maintenance - Fire Alarm Panel - Main Building",
    type: "Maintenance",
    serviceProvider: "Otis Elevator Services",
    asset: "Fire Alarm Panel - Main Building",
    serviceId: "SRV-20260226-002",
    date: "10-Feb-26",
    cost: 5382,
    status: "Completed",
  },
];

// ---------- Gate Passes ----------
export const mockGatePasses: GatePass[] = [
  {
    id: "gp-1",
    assetName: "Access Control System",
    assetTag: "GV-MISC-003",
    gatePassType: "Demonstration",
    status: "Out",
    dateTimeOut: "27-Feb-26 7:43 AM",
    serviceProvider: "Kirloskar Pump Services",
  },
  {
    id: "gp-2",
    assetName: "Fire Hydrant System",
    assetTag: "GV-FIRE-002",
    gatePassType: "Calibration",
    status: "Returned",
    dateTimeOut: "25-Feb-26 1:43 AM",
    serviceProvider: "Otis Elevator Services",
  },
  {
    id: "gp-3",
    assetName: "STP Blower Unit - Primary",
    assetTag: "GV-MOT-001",
    gatePassType: "Demonstration",
    status: "Approved",
    dateTimeOut: "25-Feb-26 1:43 AM",
    serviceProvider: "GreenView AMC Services",
  },
  {
    id: "gp-4",
    assetName: "HVAC Chiller Unit - Tower A",
    assetTag: "GV-HVAC-010",
    gatePassType: "Maintenance",
    status: "Approved",
    dateTimeOut: "23-Feb-26 7:43 AM",
    serviceProvider: "Carrier HVAC Services",
  },
  {
    id: "gp-5",
    assetName: "Distribution Transformer - Block B",
    assetTag: "GV-TRAF-02",
    gatePassType: "Permanent transfer",
    status: "Returned",
    dateTimeOut: "21-Feb-26 1:43 AM",
    serviceProvider: "GreenView AMC Services",
  },
  {
    id: "gp-6",
    assetName: "Domestic Water Pump - Tower A",
    assetTag: "GV-PUMP-002",
    gatePassType: "Testing",
    status: "Out",
    dateTimeOut: "20-Feb-26 7:43 AM",
    serviceProvider: "Honeywell Fire Safety",
  },
  {
    id: "gp-7",
    assetName: "Overhead Water Tank - Tower A",
    assetTag: "GV-TANK-001",
    gatePassType: "Permanent transfer",
    status: "Returned",
    dateTimeOut: "18-Feb-26 1:43 AM",
    serviceProvider: "Otis Elevator Services",
  },
  {
    id: "gp-8",
    assetName: "DG Set - Backup",
    assetTag: "GV-DG-002",
    gatePassType: "Repair",
    status: "Approved",
    dateTimeOut: "18-Feb-26 7:43 AM",
    serviceProvider: "",
  },
  {
    id: "gp-9",
    assetName: "Sewage Pump - Basement",
    assetTag: "GV-PUMP-010",
    gatePassType: "Temporary transfer",
    status: "Returned",
    dateTimeOut: "15-Feb-26 7:43 AM",
    serviceProvider: "Kirloskar Pump Services",
  },
];

// ---------- PPM Schedule ----------
export const mockPPMTasks: PPMTask[] = [
  // Week 1
  { id: "ppm-1", assetName: "HVAC - 6 (HVAC 002)", categoryName: "HVAC", weekNumber: 1, status: "completed", scheduledDate: "2026-01-05" },
  // Week 2
  { id: "ppm-2", assetName: "Lift 1 - Tower A (GV-LFT 01)", categoryName: "Lifts", weekNumber: 2, status: "overdue", scheduledDate: "2026-01-12" },
  // Week 3
  { id: "ppm-3", assetName: "Main LT Panel - Block 2 (GV-ELE 017 01)", categoryName: "Electric panels", weekNumber: 3, status: "scheduled", scheduledDate: "2026-01-19" },
  { id: "ppm-4", assetName: "HVAC Chiller Unit - Tower A (GV-HVAC 01)", categoryName: "HVAC", weekNumber: 3, status: "overdue", scheduledDate: "2026-01-19" },
  // Week 4
  { id: "ppm-5", assetName: "HVAC Chiller Unit - Tower 4 (GV-HVAC CH 01)", categoryName: "HVAC", weekNumber: 4, status: "overdue", scheduledDate: "2026-01-26" },
  // Week 5
  { id: "ppm-6", assetName: "HVAC - 6 (HVAC 003)", categoryName: "HVAC", weekNumber: 5, status: "completed", scheduledDate: "2026-02-02" },
  // Week 6
  { id: "ppm-7", assetName: "Preventive Domestic Water Pump - Tower 01", categoryName: "Pumps", weekNumber: 6, status: "overdue", scheduledDate: "2026-02-09" },
  // Week 7
  { id: "ppm-8", assetName: "Inspection DG Set - Standby", categoryName: "DGs", weekNumber: 7, status: "in_progress", scheduledDate: "2026-02-16" },
  { id: "ppm-9", assetName: "Inspection (Fire Hydrant System)", categoryName: "Fire safety", weekNumber: 7, status: "overdue", scheduledDate: "2026-02-16" },
  // Week 8
  { id: "ppm-10", assetName: "preventive (Waste Treatment Plant - RO System)", categoryName: "Pumps", weekNumber: 8, status: "overdue", scheduledDate: "2026-02-23" },
  { id: "ppm-11", assetName: "preventive LED Lighting System - Parking", categoryName: "Electric panels", weekNumber: 8, status: "overdue", scheduledDate: "2026-02-23" },
  // Week 9
  { id: "ppm-12", assetName: "preventive HVAC Chiller Unit - Tower B1", categoryName: "HVAC", weekNumber: 9, status: "completed", scheduledDate: "2026-03-02" },
  { id: "ppm-13", assetName: "preventive (CCTV Repair Unit - Primary)", categoryName: "Miscellaneous", weekNumber: 9, status: "overdue", scheduledDate: "2026-03-02" },
  { id: "ppm-14", assetName: "preventive Access Control System", categoryName: "Miscellaneous", weekNumber: 9, status: "overdue", scheduledDate: "2026-03-02" },
  { id: "ppm-15", assetName: "preventive LED Lighting System - Common Areas", categoryName: "Electric panels", weekNumber: 9, status: "overdue", scheduledDate: "2026-03-02" },
  { id: "ppm-16", assetName: "inspection Distribution Transformer - Block B", categoryName: "Transformers", weekNumber: 9, status: "scheduled", scheduledDate: "2026-03-02" },
  // Week 10
  { id: "ppm-17", assetName: "preventive Sewage Pump - Basement", categoryName: "Pumps", weekNumber: 10, status: "overdue", scheduledDate: "2026-03-09" },
  { id: "ppm-18", assetName: "Lift 1 - Tower A (GV-LFT 01)", categoryName: "Lifts", weekNumber: 10, status: "overdue", scheduledDate: "2026-03-09" },
  // Week 11
  { id: "ppm-19", assetName: "preventive HVAC LT", categoryName: "HVAC", weekNumber: 11, status: "scheduled", scheduledDate: "2026-03-16" },
  { id: "ppm-20", assetName: "Main LT Panel - Block 3 (GV-ELE 019 01)", categoryName: "Electric panels", weekNumber: 11, status: "overdue", scheduledDate: "2026-03-16" },
  // Week 12
  { id: "ppm-21", assetName: "preventive Diesel Transfer Pump - Tower A", categoryName: "Pumps", weekNumber: 12, status: "overdue", scheduledDate: "2026-03-23" },
  { id: "ppm-22", assetName: "Inspection Overhead Water Tank - Tower A", categoryName: "Tanks", weekNumber: 12, status: "overdue", scheduledDate: "2026-03-23" },
];

// ---------- Audit Scan Records ----------
export const mockAuditScans: AuditScanRecord[] = [
  {
    id: "scan-1",
    assetTag: "Fire_hydrant_coupler_10",
    assetName: "Fire_hydrant_coupler_10",
    blockType: "-",
    block: "-",
    floor: "-",
    condition: "Good",
    scannedBy: "Unknown",
    dateTime: "08 Mar 2026, 10:41 am",
    notes: "",
    gps: true,
  },
  {
    id: "scan-2",
    assetTag: "Earth Bit_4",
    assetName: "Earth Bit_4",
    blockType: "-",
    block: "-",
    floor: "-",
    condition: "",
    scannedBy: "Unknown",
    dateTime: "07 Mar 2026, 11:18 pm",
    notes: "",
    gps: false,
  },
  {
    id: "scan-3",
    assetTag: "Earth Bit_6",
    assetName: "Earth Bit_6",
    blockType: "-",
    block: "-",
    floor: "-",
    condition: "",
    scannedBy: "Unknown",
    dateTime: "07 Mar 2026, 11:18 pm",
    notes: "",
    gps: false,
  },
  {
    id: "scan-4",
    assetTag: "Earth Bit_8",
    assetName: "Earth Bit_8",
    blockType: "-",
    block: "-",
    floor: "-",
    condition: "",
    scannedBy: "Unknown",
    dateTime: "07 Mar 2026, 11:10 pm",
    notes: "",
    gps: false,
  },
  {
    id: "scan-5",
    assetTag: "Earth Bit_7",
    assetName: "Earth Bit_7",
    blockType: "-",
    block: "-",
    floor: "-",
    condition: "",
    scannedBy: "Unknown",
    dateTime: "07 Mar 2026, 11:08 pm",
    notes: "",
    gps: false,
  },
];

// ---------- Audit Config ----------
export const mockAuditConfigs: AuditConfig[] = [
  { id: "ac-1", category: "lifts", frequency: "Monthly", created: "03/04/2026" },
  { id: "ac-2", category: "fire_safety", frequency: "Monthly", created: "07/03/2026" },
  { id: "ac-3", category: "earthing_pits", frequency: "Monthly", created: "07/03/2026" },
];

// ---------- Checklists ----------
export interface Checklist {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  fileUrl: string;
  createdAt: string;
}

export const mockChecklists: Checklist[] = [];

// ---------- Dashboard Summary ----------
export const dashboardSummary = {
  totalAssets: 241,
  activeAssets: 234,
  inactiveAssets: 1,
  totalGatePasses: 7,
  gatePassesOut: 7,
  gatePassesOverdue: 7,
  totalRepairCost: 743680,
  servicesCompleted: 19,
  assetBreakdown: {
    hvac: { active: 56, maintenance: 3, inactive: 1, issues: 1 },
  },
  ppmStatus: {
    planned: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    completionRate: 0,
  },
  ppmUpcoming: [
    { name: "AC OUTDOOR UNIT Maintenance", priority: "High Priority" },
    { name: "AC SPLIT INDOOR UNIT Maintenance", priority: "Medium" },
    { name: "AC OUTDOOR UNIT Maintenance", priority: "Scheduled" },
  ],
  majorObservations: [
    { type: "positive", title: "Positive Note", description: "AC OUTDOOR UNIT is operating normally. Last check completed successfully.", location: "MASSAGE ROOM", date: "17/04/2026" },
    { type: "efficiency", title: "Efficiency Status", description: "AC SPLIT INDOOR UNIT showing optimal performance. No issues detected.", location: "MASSAGE ROOM", date: "17/04/2026" },
    { type: "positive", title: "Positive Note", description: "AC OUTDOOR UNIT is operating normally. Last check completed successfully.", location: "CRECHE ROOM", date: "17/04/2026" },
    { type: "efficiency", title: "Efficiency Status", description: "AC OUTDOOR UNIT showing optimal performance. No issues detected.", location: "CRECHE ROOM", date: "17/04/2026" },
  ],
};

// ---------- Audit Dashboard Summary ----------
export const auditDashboardSummary = {
  totalAssets: 60,
  scanned: 0,
  remaining: 60,
  overallCompletion: 0,
  categories: [
    { name: "earthing_pits", frequency: "Monthly", period: "01 Apr - 01 May", total: 10, scanned: 0 },
    { name: "fire_safety", frequency: "Monthly", period: "01 Apr - 01 May", total: 40, scanned: 0 },
    { name: "lifts", frequency: "Monthly", period: "01 Apr - 01 May", total: 10, scanned: 0 },
  ],
  pendingAlerts: [
    { category: "earthing_pits", count: 10, deadline: "01 May", scanned: "0/10" },
    { category: "fire_safety", count: 40, deadline: "01 May", scanned: "0/40" },
    { category: "lifts", count: 10, deadline: "01 May", scanned: "0/10" },
  ],
};
