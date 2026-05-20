import {
  pgTable,
  pgSchema,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  time,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================

export const facilityTypeEnum = pgEnum("facility_type", [
  "residential",
  "corporate",
  "industrial",
]);

export const attendanceStatusEnum = pgEnum("attendance_status", [
  "present",
  "absent",
  "leave",
  "week_off",
  "half_day",
]);

export const attendanceSourceEnum = pgEnum("attendance_source", [
  "manual",
  "qr",
  "biometric",
]);

export const assetStatusEnum = pgEnum("asset_status", [
  "active",
  "maintenance",
  "inactive",
]);

export const maintenanceFrequencyEnum = pgEnum("maintenance_frequency", [
  "daily",
  "weekly",
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
]);

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "unassigned",
  "in_progress",
  "completed",
  "cancelled",
]);

export const complaintStatusEnum = pgEnum("complaint_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "on_hold",
  "in_progress",
  "completed",
]);

export const leaveStatusEnum = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
]);

export const alertSeverityEnum = pgEnum("alert_severity", [
  "critical",
  "high",
  "medium",
  "low",
]);

export const alertStatusEnum = pgEnum("alert_status", [
  "unacknowledged",
  "acknowledged",
  "dismissed",
  "resolved",
]);

export const gatePassStatusEnum = pgEnum("gate_pass_status", [
  "out",
  "returned",
  "approved",
  "pending",
]);

export const meterTypeEnum = pgEnum("meter_type", ["eb", "dg"]);

export const waterSourceTypeEnum = pgEnum("water_source_type", [
  "tank_overhead",
  "tank_underground",
  "borewell",
  "cavern",
  "tanker",
]);

export const plantTypeEnum = pgEnum("plant_type", ["stp", "wtp", "pool", "ro"]);

export const kpiStatusEnum = pgEnum("kpi_status", ["green", "red", "blue", "yellow"]);

export const deviceStatusEnum = pgEnum("device_status", ["active", "inactive"]);

export const shiftTypeEnum = pgEnum("shift_type", [
  "G",
  "A",
  "B",
  "C",
  "AB",
  "BC",
  "AC",
  "ABC",
]);

export const approvalTypeEnum = pgEnum("approval_type", [
  "advance",
  "uniform",
  "petty_cash",
  "po",
  "invoice",
  "salary_revision",
]);

export const approvalStepStatusEnum = pgEnum("approval_step_status", [
  "waiting",
  "pending",
  "approved",
  "rejected",
]);

export const inventoryTransactionTypeEnum = pgEnum(
  "inventory_transaction_type",
  ["in", "out", "adjust"]
);

export const candidateStatusEnum = pgEnum("candidate_status", [
  "applied",
  "interviewed",
  "offered",
  "joined",
  "rejected",
]);

export const interviewRecommendationEnum = pgEnum("interview_recommendation", [
  "strong_yes",
  "yes",
  "maybe",
  "no",
  "strong_no",
]);

export const goalStatusEnum = pgEnum("goal_status", [
  "draft",
  "active",
  "completed",
  "cancelled",
]);

export const lifecycleEventTypeEnum = pgEnum("lifecycle_event_type", [
  "joining",
  "confirmation",
  "promotion",
  "warning",
  "separation",
]);

export const notificationChannelEnum = pgEnum("notification_channel", [
  "push",
  "whatsapp",
  "email",
]);

export const taskFrequencyEnum = pgEnum("task_frequency", [
  "one_time",
  "daily",
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
  "half_yearly",
  "yearly",
]);

export const scheduleFrequencyEnum = pgEnum("schedule_frequency", [
  "daily",
  "weekly",
  "fortnightly",
  "monthly",
  "quarterly",
  "half_yearly",
  "annual",
]);

// ==================== MULTI-TENANCY ====================

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const facilities = pgTable("facilities", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  type: facilityTypeEnum("type").default("residential").notNull(),
  city: varchar("city", { length: 100 }),
  location: text("location"),
  clientName: varchar("client_name", { length: 255 }),
  contactNumber: varchar("contact_number", { length: 20 }),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0UserId: varchar("auth0_user_id", { length: 255 }).notNull().unique(),
  facilityId: uuid("facility_id").references(() => facilities.id),
  displayName: varchar("display_name", { length: 255 }),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 20 }),
  role: varchar("role", { length: 50 }).default("facility_manager"),
  status: varchar("user_status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appAuditLogs = pgTable("app_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0UserId: varchar("auth0_user_id", { length: 255 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: uuid("entity_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ==================== EMPLOYEES & ATTENDANCE ====================

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  empId: varchar("emp_id", { length: 20 }).notNull(),
  firstName: varchar("first_name", { length: 100 }).notNull(),
  lastName: varchar("last_name", { length: 100 }),
  designation: varchar("designation", { length: 100 }),
  department: varchar("department", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  dateOfBirth: date("date_of_birth"),
  description: text("description"),
  qrCodeData: text("qr_code_data"),
  smartcardId: varchar("smartcard_id", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const shifts = pgTable("shifts", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

export const shiftAssignments = pgTable("shift_assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .references(() => employees.id)
    .notNull(),
  shiftId: uuid("shift_id")
    .references(() => shifts.id)
    .notNull(),
  date: date("date").notNull(),
  isWeekOff: boolean("is_week_off").default(false),
});

export const attendanceRecords = pgTable("attendance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .references(() => employees.id)
    .notNull(),
  date: date("date").notNull(),
  status: attendanceStatusEnum("status").notNull(),
  checkIn: timestamp("check_in"),
  checkOut: timestamp("check_out"),
  source: attendanceSourceEnum("source").default("manual"),
  isMultiShift: boolean("is_multi_shift").default(false),
  shiftsSelected: jsonb("shifts_selected"),
  cooldownUntil: timestamp("cooldown_until"),
  geoLat: numeric("geo_lat", { precision: 10, scale: 7 }),
  geoLng: numeric("geo_lng", { precision: 10, scale: 7 }),
}, (table) => [
  index("attendance_employee_date_idx").on(table.employeeId, table.date),
]);

export const leaveRequests = pgTable("leave_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .references(() => employees.id)
    .notNull(),
  dateFrom: date("date_from").notNull(),
  dateTo: date("date_to").notNull(),
  type: varchar("type", { length: 50 }),
  status: leaveStatusEnum("status").default("pending").notNull(),
  approvedBy: uuid("approved_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ASSET MANAGEMENT ====================

export const assetCategories = pgTable("asset_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }),
  auditFrequency: maintenanceFrequencyEnum("audit_frequency").default("monthly"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => assetCategories.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  assetTag: varchar("asset_tag", { length: 100 }),
  location: varchar("location", { length: 255 }),
  status: assetStatusEnum("status").default("active").notNull(),
  maintenanceFrequency: maintenanceFrequencyEnum("maintenance_frequency"),
  lastChecked: date("last_checked"),
  serviceHistory: text("service_history"),
  qrCodeData: text("qr_code_data"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("assets_facility_category_idx").on(table.facilityId, table.categoryId),
  uniqueIndex("assets_qr_code_data_idx").on(table.qrCodeData),
]);

export const assetChecklists = pgTable("asset_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id),
  categoryId: uuid("category_id").references(() => assetCategories.id),
  name: varchar("name", { length: 255 }).notNull(),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const amcContracts = pgTable("amc_contracts", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  vendorName: varchar("vendor_name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  contractType: varchar("contract_type", { length: 100 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  annualCost: numeric("annual_cost", { precision: 12, scale: 2 }),
  status: varchar("status", { length: 50 }).default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const breakdownRecords = pgTable("breakdown_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
  reportedDate: date("reported_date").notNull(),
  description: text("description"),
  serviceProvider: varchar("service_provider", { length: 255 }),
  cost: numeric("cost", { precision: 12, scale: 2 }),
  status: complaintStatusEnum("status").default("open"),
  completedDate: date("completed_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const incidentReports = pgTable("incident_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  title: varchar("title", { length: 255 }),
  description: text("description"),
  fiveWhys: jsonb("five_whys"),
  correctiveActions: text("corrective_actions"),
  preventiveActions: text("preventive_actions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gatePasses = pgTable("gate_passes", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  assetName: varchar("asset_name", { length: 255 }).notNull(),
  assetTag: varchar("asset_tag", { length: 100 }),
  passType: varchar("pass_type", { length: 100 }),
  status: gatePassStatusEnum("status").default("pending").notNull(),
  dateOut: timestamp("date_out"),
  dateIn: timestamp("date_in"),
  serviceProvider: varchar("service_provider", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ppmSchedules = pgTable("ppm_schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
  weekNumber: integer("week_number").notNull(),
  year: integer("year").notNull(),
  scheduledDate: date("scheduled_date"),
  completed: boolean("completed").default(false),
  completedDate: date("completed_date"),
});

export const auditScans = pgTable("audit_scans", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
  auditPeriodStart: date("audit_period_start"),
  auditPeriodEnd: date("audit_period_end"),
  scanned: boolean("scanned").default(false),
  scannedAt: timestamp("scanned_at"),
  condition: varchar("condition", { length: 50 }),
  scannedBy: varchar("scanned_by", { length: 255 }),
  notes: text("notes"),
});

// ==================== DAILY UPDATES ====================

export const powerReadings = pgTable("power_readings", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  meterId: varchar("meter_id", { length: 50 }).notNull(),
  meterType: meterTypeEnum("meter_type").notNull(),
  location: varchar("location", { length: 255 }),
  previousKwh: numeric("previous_kwh", { precision: 12, scale: 2 }),
  currentKwh: numeric("current_kwh", { precision: 12, scale: 2 }),
  multiplicationFactor: numeric("multiplication_factor", { precision: 6, scale: 2 }).default("1"),
  unitsConsumed: numeric("units_consumed", { precision: 12, scale: 2 }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waterReadings = pgTable("water_readings", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  sourceType: waterSourceTypeEnum("source_type").notNull(),
  previousLiters: numeric("previous_liters", { precision: 12, scale: 2 }),
  currentLiters: numeric("current_liters", { precision: 12, scale: 2 }),
  consumed: numeric("consumed", { precision: 12, scale: 2 }),
  levelPercent: numeric("level_percent", { precision: 5, scale: 2 }),
  date: date("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hygieneChecklists = pgTable("hygiene_checklists", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  date: date("date").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  items: jsonb("items"),
  overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
  completedBy: varchar("completed_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const waterQualityReadings = pgTable("water_quality_readings", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  plantType: plantTypeEnum("plant_type").notNull(),
  date: date("date").notNull(),
  parameters: jsonb("parameters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== COMPLAINTS, TASKS, PROJECTS ====================

export const complaints = pgTable("complaints", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  ticketId: varchar("ticket_id", { length: 20 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  priority: priorityEnum("priority").default("medium"),
  status: complaintStatusEnum("status").default("open").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  createdBy: varchar("created_by", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  department: varchar("department", { length: 100 }),
  responsibility: varchar("responsibility", { length: 50 }),
  priority: priorityEnum("priority").default("low"),
  source: varchar("source", { length: 100 }),
  eisenhowerMatrix: varchar("eisenhower_matrix", { length: 50 }),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").default("pending").notNull(),
  assignedTo: varchar("assigned_to", { length: 255 }),
  attachments: jsonb("attachments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("tasks_facility_status_idx").on(table.facilityId, table.status),
  index("tasks_assigned_due_idx").on(table.assignedTo, table.dueDate),
]);

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  managerId: uuid("manager_id"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  status: projectStatusEnum("status").default("planning").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectMilestones = pgTable("project_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id")
    .references(() => projects.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  targetDate: date("target_date"),
  completed: boolean("completed").default(false),
  dependencies: jsonb("dependencies"),
});

// ==================== VENDOR TICKETS ====================

export const serviceProviders = pgTable("service_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  contact: varchar("contact", { length: 20 }),
  email: varchar("email", { length: 255 }),
  categories: jsonb("categories"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vendorTickets = pgTable("vendor_tickets", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  department: varchar("department", { length: 100 }),
  priority: priorityEnum("priority").default("medium"),
  status: complaintStatusEnum("status").default("open").notNull(),
  serviceProviderId: uuid("service_provider_id").references(() => serviceProviders.id),
  description: text("description"),
  attachments: jsonb("attachments"),
  expectedCompletion: date("expected_completion"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

// ==================== FACILITY CONFIG ====================

export const energyMeterConfigs = pgTable("energy_meter_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  meterIdLabel: varchar("meter_id_label", { length: 50 }).notNull(),
  type: meterTypeEnum("type").notNull(),
  location: varchar("location", { length: 255 }),
  load: numeric("load", { precision: 10, scale: 2 }),
  totalUnits: numeric("total_units", { precision: 12, scale: 2 }),
  status: deviceStatusEnum("status").default("active"),
});

export const waterInfraConfigs = pgTable("water_infra_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  type: waterSourceTypeEnum("type").notNull(),
  capacity: numeric("capacity", { precision: 12, scale: 2 }),
  location: varchar("location", { length: 255 }),
  status: deviceStatusEnum("status").default("active"),
});

export const waterQualityConfigs = pgTable("water_quality_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  plantType: plantTypeEnum("plant_type").notNull(),
  parameters: jsonb("parameters"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hygieneTemplates = pgTable("hygiene_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  name: varchar("name", { length: 255 }),
  templateFileUrl: text("template_file_url"),
  items: jsonb("items"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ALERTS ====================

export const alerts = pgTable("alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  severity: alertSeverityEnum("severity").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  status: alertStatusEnum("status").default("unacknowledged").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedAt: timestamp("resolved_at"),
});

export const alertConfigs = pgTable("alert_configs", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  enabled: boolean("enabled").default(true),
  thresholds: jsonb("thresholds"),
  notificationChannels: jsonb("notification_channels"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== REPORTS / KPIs ====================

export const kpiDefinitions = pgTable("kpi_definitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  targetValue: numeric("target_value", { precision: 10, scale: 2 }),
  unit: varchar("unit", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kpiSnapshots = pgTable("kpi_snapshots", {
  id: uuid("id").defaultRandom().primaryKey(),
  kpiId: uuid("kpi_id")
    .references(() => kpiDefinitions.id)
    .notNull(),
  date: date("date").notNull(),
  actualValue: numeric("actual_value", { precision: 10, scale: 2 }),
  status: kpiStatusEnum("status"),
});

// ==================== BIOMETRIC ====================

export const biometricDevices = pgTable("biometric_devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  deviceName: varchar("device_name", { length: 255 }),
  serialNumber: varchar("serial_number", { length: 100 }),
  status: deviceStatusEnum("status").default("active"),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const biometricEnrollments = pgTable("biometric_enrollments", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: uuid("device_id")
    .references(() => biometricDevices.id)
    .notNull(),
  employeeId: uuid("employee_id")
    .references(() => employees.id)
    .notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
});

// ==================== AI AGENT ====================

export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  auth0UserId: varchar("auth0_user_id", { length: 255 }).notNull(),
  facilityId: uuid("facility_id").references(() => facilities.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .references(() => chatSessions.id)
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== RBAC ====================

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  permissions: jsonb("permissions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  module: varchar("module", { length: 50 }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id")
    .references(() => roles.id)
    .notNull(),
  permissionId: uuid("permission_id")
    .references(() => permissions.id)
    .notNull(),
});

// ==================== TASK EXTENSIONS ====================

export const taskTemplates = pgTable("task_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sopChecklist: jsonb("sop_checklist"),
  category: varchar("category", { length: 100 }),
  frequency: taskFrequencyEnum("frequency"),
  isExternal: boolean("is_external").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskChecklistItems = pgTable("task_checklist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .references(() => tasks.id)
    .notNull(),
  label: varchar("label", { length: 255 }).notNull(),
  isChecked: boolean("is_checked").default(false),
  checkedAt: timestamp("checked_at"),
  checkedBy: uuid("checked_by"),
});

export const taskEscalations = pgTable("task_escalations", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .references(() => tasks.id)
    .notNull(),
  escalatedTo: uuid("escalated_to"),
  escalatedAt: timestamp("escalated_at").defaultNow(),
  reason: text("reason"),
  resolvedAt: timestamp("resolved_at"),
});

export const taskComments = pgTable("task_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("task_id")
    .references(() => tasks.id)
    .notNull(),
  userId: uuid("user_id"),
  body: text("body"),
  attachmentUrl: text("attachment_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== NOTIFICATIONS & FILES ====================

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  type: varchar("type", { length: 50 }),
  title: varchar("title", { length: 255 }),
  body: text("body"),
  readAt: timestamp("read_at"),
  channel: notificationChannelEnum("channel"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("notifications_user_read_idx").on(table.userId, table.readAt),
]);

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  entityType: varchar("entity_type", { length: 50 }),
  entityId: uuid("entity_id"),
  fileUrl: text("file_url"),
  fileType: varchar("file_type", { length: 50 }),
  uploadedBy: uuid("uploaded_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== WORK LOGS & SCHEDULES ====================

export const workLogs = pgTable("work_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  assetCategory: varchar("asset_category", { length: 100 }),
  logDate: date("log_date"),
  shift: varchar("shift", { length: 10 }),
  readings: jsonb("readings"),
  loggedBy: uuid("logged_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const schedules = pgTable("schedules", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  frequency: scheduleFrequencyEnum("frequency"),
  startDate: date("start_date"),
  endDate: date("end_date"),
  assignedTo: uuid("assigned_to"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const scheduleCompletions = pgTable("schedule_completions", {
  id: uuid("id").defaultRandom().primaryKey(),
  scheduleId: uuid("schedule_id")
    .references(() => schedules.id)
    .notNull(),
  completionDate: date("completion_date"),
  status: varchar("status", { length: 50 }),
  completedBy: uuid("completed_by"),
  notes: text("notes"),
});

export const vendorEvaluations = pgTable("vendor_evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  vendorId: uuid("vendor_id")
    .references(() => serviceProviders.id)
    .notNull(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  period: varchar("period", { length: 50 }),
  scores: jsonb("scores"),
  evaluatorId: uuid("evaluator_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const snagItems = pgTable("snag_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  location: varchar("location", { length: 255 }),
  description: text("description"),
  photoUrls: jsonb("photo_urls"),
  severity: priorityEnum("severity"),
  status: complaintStatusEnum("status").default("open"),
  reportedBy: uuid("reported_by"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employeePerformance = pgTable("employee_performance", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  period: varchar("period", { length: 50 }),
  tasksAssigned: integer("tasks_assigned").default(0),
  tasksCompleted: integer("tasks_completed").default(0),
  tasksMissed: integer("tasks_missed").default(0),
  score: numeric("score", { precision: 5, scale: 2 }),
  evaluatedBy: uuid("evaluated_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== INVENTORY ====================

export const inventoryItems = pgTable("inventory_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: varchar("category", { length: 100 }),
  unit: varchar("unit", { length: 50 }),
  currentQty: integer("current_qty").default(0),
  minReorderLevel: integer("min_reorder_level").default(0),
  maxQty: integer("max_qty"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("inventory_facility_category_idx").on(table.facilityId, table.category),
]);

export const inventoryTransactions = pgTable("inventory_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  itemId: uuid("item_id")
    .references(() => inventoryItems.id)
    .notNull(),
  type: inventoryTransactionTypeEnum("type"),
  qty: integer("qty"),
  reference: text("reference"),
  transactedBy: uuid("transacted_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const uniformIssues = pgTable("uniform_issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: uuid("employee_id")
    .references(() => employees.id)
    .notNull(),
  itemId: uuid("item_id")
    .references(() => inventoryItems.id)
    .notNull(),
  qty: integer("qty").default(1),
  issueDate: date("issue_date"),
  deductionAmount: numeric("deduction_amount", { precision: 10, scale: 2 }),
  deductedFromMonth: varchar("deducted_from_month", { length: 20 }),
});

// ==================== APPROVALS ====================

export const approvalWorkflows = pgTable("approval_workflows", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  type: approvalTypeEnum("type"),
  steps: jsonb("steps"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const approvalRequests = pgTable("approval_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  workflowId: uuid("workflow_id")
    .references(() => approvalWorkflows.id)
    .notNull(),
  requesterId: uuid("requester_id"),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  type: approvalTypeEnum("type"),
  amount: numeric("amount", { precision: 12, scale: 2 }),
  description: text("description"),
  attachments: jsonb("attachments"),
  status: varchar("status", { length: 50 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const approvalSteps = pgTable("approval_steps", {
  id: uuid("id").defaultRandom().primaryKey(),
  requestId: uuid("request_id")
    .references(() => approvalRequests.id)
    .notNull(),
  stepOrder: integer("step_order"),
  approverRole: varchar("approver_role", { length: 100 }),
  approverId: uuid("approver_id"),
  status: approvalStepStatusEnum("status").default("waiting"),
  actedAt: timestamp("acted_at"),
  comments: text("comments"),
}, (table) => [
  index("approval_steps_request_status_idx").on(table.requestId, table.status),
]);

export const approvalAlerts = pgTable("approval_alerts", {
  id: uuid("id").defaultRandom().primaryKey(),
  stepId: uuid("step_id")
    .references(() => approvalSteps.id)
    .notNull(),
  alertType: varchar("alert_type", { length: 50 }),
  sentAt: timestamp("sent_at").defaultNow(),
});

// ==================== HR ====================

export const jobRequirements = pgTable("job_requirements", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  facilityId: uuid("facility_id")
    .references(() => facilities.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  department: varchar("department", { length: 100 }),
  positionsNeeded: integer("positions_needed").default(1),
  status: varchar("status", { length: 50 }).default("open"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const candidates = pgTable("candidates", {
  id: uuid("id").defaultRandom().primaryKey(),
  requirementId: uuid("requirement_id")
    .references(() => jobRequirements.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  resumeUrl: text("resume_url"),
  status: candidateStatusEnum("status").default("applied"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const interviews = pgTable("interviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  candidateId: uuid("candidate_id")
    .references(() => candidates.id)
    .notNull(),
  interviewerId: uuid("interviewer_id"),
  scheduledAt: timestamp("scheduled_at"),
  comments: text("comments"),
  recommendation: interviewRecommendationEnum("recommendation"),
  score: integer("score"),
});

export const employeeGoals = pgTable("employee_goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  period: varchar("period", { length: 50 }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetMetric: varchar("target_metric", { length: 255 }),
  achievedMetric: varchar("achieved_metric", { length: 255 }),
  status: goalStatusEnum("status").default("draft"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goalEvaluations = pgTable("goal_evaluations", {
  id: uuid("id").defaultRandom().primaryKey(),
  goalId: uuid("goal_id")
    .references(() => employeeGoals.id)
    .notNull(),
  evaluatorId: uuid("evaluator_id"),
  evaluatorRole: varchar("evaluator_role", { length: 100 }),
  score: integer("score"),
  comments: text("comments"),
  evaluatedAt: timestamp("evaluated_at").defaultNow(),
});

export const employeeLifecycle = pgTable("employee_lifecycle", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  eventType: lifecycleEventTypeEnum("event_type"),
  eventDate: date("event_date"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== REPORT TEMPLATES ====================

export const reportTemplates = pgTable("report_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  module: varchar("module", { length: 50 }),
  fieldSelection: jsonb("field_selection"),
  filters: jsonb("filters"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedReports = pgTable("generated_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .references(() => reportTemplates.id)
    .notNull(),
  format: varchar("format", { length: 10 }),
  fileUrl: text("file_url"),
  parameters: jsonb("parameters"),
  generatedAt: timestamp("generated_at").defaultNow(),
});

export const scheduledReports = pgTable("scheduled_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  templateId: uuid("template_id")
    .references(() => reportTemplates.id)
    .notNull(),
  frequency: varchar("frequency", { length: 50 }),
  recipients: jsonb("recipients"),
  nextRunAt: timestamp("next_run_at"),
});

// ==================== WHATSAPP ====================

export const whatsappMessageDirectionEnum = pgEnum("whatsapp_message_direction", [
  "inbound",
  "outbound",
]);

export const whatsappMessageStatusEnum = pgEnum("whatsapp_message_status", [
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const whatsappTemplateStatusEnum = pgEnum("whatsapp_template_status", [
  "approved",
  "pending",
  "rejected",
]);

export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  language: varchar("language", { length: 10 }).default("en"),
  category: varchar("category", { length: 50 }),
  components: jsonb("components"),
  status: whatsappTemplateStatusEnum("status").default("pending"),
  metaTemplateId: varchar("meta_template_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const whatsappMessages = pgTable("whatsapp_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  facilityId: uuid("facility_id").references(() => facilities.id),
  direction: whatsappMessageDirectionEnum("direction").notNull(),
  waMessageId: varchar("wa_message_id", { length: 255 }),
  fromNumber: varchar("from_number", { length: 20 }).notNull(),
  toNumber: varchar("to_number", { length: 20 }).notNull(),
  body: text("body"),
  templateId: uuid("template_id").references(() => whatsappTemplates.id),
  status: whatsappMessageStatusEnum("status").default("sent"),
  parsedCommand: varchar("parsed_command", { length: 50 }),
  parsedPayload: jsonb("parsed_payload"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== IoT ====================

export const iotDevices = pgTable("iot_devices", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id),
  deviceIp: varchar("device_ip", { length: 45 }),
  protocol: varchar("protocol", { length: 20 }).default("mqtt"),
  pollIntervalSec: integer("poll_interval_sec").default(60),
  status: deviceStatusEnum("status").default("active"),
  lastSeenAt: timestamp("last_seen_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const iotThresholds = pgTable("iot_thresholds", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id),
  metricName: varchar("metric_name", { length: 100 }),
  minValue: numeric("min_value", { precision: 10, scale: 2 }),
  maxValue: numeric("max_value", { precision: 10, scale: 2 }),
  alertSeverity: alertSeverityEnum("alert_severity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assetIotData = pgTable("asset_iot_data", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id")
    .references(() => assets.id)
    .notNull(),
  deviceId: uuid("device_id").references(() => iotDevices.id),
  metricName: varchar("metric_name", { length: 100 }).notNull(),
  value: numeric("value", { precision: 12, scale: 4 }),
  unit: varchar("unit", { length: 50 }),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});
