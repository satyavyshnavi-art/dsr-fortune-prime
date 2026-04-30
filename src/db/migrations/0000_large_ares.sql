CREATE TYPE "public"."alert_severity" AS ENUM('critical', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('unacknowledged', 'acknowledged', 'dismissed', 'resolved');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('active', 'maintenance', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."attendance_source" AS ENUM('manual', 'qr', 'biometric');--> statement-breakpoint
CREATE TYPE "public"."attendance_status" AS ENUM('present', 'absent', 'leave', 'week_off', 'half_day');--> statement-breakpoint
CREATE TYPE "public"."complaint_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TYPE "public"."device_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."facility_type" AS ENUM('residential', 'corporate', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."gate_pass_status" AS ENUM('out', 'returned', 'approved', 'pending');--> statement-breakpoint
CREATE TYPE "public"."kpi_status" AS ENUM('green', 'red', 'blue', 'yellow');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."maintenance_frequency" AS ENUM('daily', 'weekly', 'monthly', 'quarterly', 'half_yearly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."meter_type" AS ENUM('eb', 'dg');--> statement-breakpoint
CREATE TYPE "public"."plant_type" AS ENUM('stp', 'wtp', 'pool', 'ro');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'on_hold', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'unassigned', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."water_source_type" AS ENUM('tank_overhead', 'tank_underground', 'borewell', 'cavern', 'tanker');--> statement-breakpoint
CREATE TABLE "alert_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"enabled" boolean DEFAULT true,
	"thresholds" jsonb,
	"notification_channels" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alerts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"severity" "alert_severity" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"status" "alert_status" DEFAULT 'unacknowledged' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged_at" timestamp,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "amc_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"vendor_name" varchar(255) NOT NULL,
	"category" varchar(100),
	"contract_type" varchar(100),
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"annual_cost" numeric(12, 2),
	"status" varchar(50) DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"action" varchar(100) NOT NULL,
	"entity_type" varchar(50),
	"entity_id" uuid,
	"details" jsonb,
	"ip_address" varchar(45),
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"icon" varchar(50),
	"audit_frequency" "maintenance_frequency" DEFAULT 'monthly',
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "asset_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid,
	"category_id" uuid,
	"name" varchar(255) NOT NULL,
	"file_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"asset_tag" varchar(100),
	"location" varchar(255),
	"status" "asset_status" DEFAULT 'active' NOT NULL,
	"maintenance_frequency" "maintenance_frequency",
	"last_checked" date,
	"service_history" text,
	"qr_code_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"date" date NOT NULL,
	"status" "attendance_status" NOT NULL,
	"check_in" timestamp,
	"check_out" timestamp,
	"source" "attendance_source" DEFAULT 'manual'
);
--> statement-breakpoint
CREATE TABLE "audit_scans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"audit_period_start" date,
	"audit_period_end" date,
	"scanned" boolean DEFAULT false,
	"scanned_at" timestamp,
	"condition" varchar(50),
	"scanned_by" varchar(255),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "biometric_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"device_name" varchar(255),
	"serial_number" varchar(100),
	"status" "device_status" DEFAULT 'active',
	"registered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "biometric_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_id" uuid NOT NULL,
	"employee_id" uuid NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "breakdown_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"reported_date" date NOT NULL,
	"description" text,
	"service_provider" varchar(255),
	"cost" numeric(12, 2),
	"status" "complaint_status" DEFAULT 'open',
	"completed_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"facility_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"ticket_id" varchar(20),
	"title" varchar(255) NOT NULL,
	"description" text,
	"department" varchar(100),
	"priority" "priority" DEFAULT 'medium',
	"status" "complaint_status" DEFAULT 'open' NOT NULL,
	"assigned_to" varchar(255),
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"emp_id" varchar(20) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"designation" varchar(100),
	"department" varchar(100),
	"phone" varchar(20),
	"email" varchar(255),
	"date_of_birth" date,
	"description" text,
	"qr_code_data" text,
	"smartcard_id" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "energy_meter_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"meter_id_label" varchar(50) NOT NULL,
	"type" "meter_type" NOT NULL,
	"location" varchar(255),
	"load" numeric(10, 2),
	"total_units" numeric(12, 2),
	"status" "device_status" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "facilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "facility_type" DEFAULT 'residential' NOT NULL,
	"city" varchar(100),
	"location" text,
	"client_name" varchar(255),
	"contact_number" varchar(20),
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gate_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"asset_name" varchar(255) NOT NULL,
	"asset_tag" varchar(100),
	"pass_type" varchar(100),
	"status" "gate_pass_status" DEFAULT 'pending' NOT NULL,
	"date_out" timestamp,
	"date_in" timestamp,
	"service_provider" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_checklists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"date" date NOT NULL,
	"category" varchar(100) NOT NULL,
	"items" jsonb,
	"overall_score" numeric(5, 2),
	"completed_by" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hygiene_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"category" varchar(100) NOT NULL,
	"name" varchar(255),
	"template_file_url" text,
	"items" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "incident_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid,
	"facility_id" uuid NOT NULL,
	"title" varchar(255),
	"description" text,
	"five_whys" jsonb,
	"corrective_actions" text,
	"preventive_actions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(100) NOT NULL,
	"target_value" numeric(10, 2),
	"unit" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kpi_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kpi_id" uuid NOT NULL,
	"date" date NOT NULL,
	"actual_value" numeric(10, 2),
	"status" "kpi_status"
);
--> statement-breakpoint
CREATE TABLE "leave_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"date_from" date NOT NULL,
	"date_to" date NOT NULL,
	"type" varchar(50),
	"status" "leave_status" DEFAULT 'pending' NOT NULL,
	"approved_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "power_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"meter_id" varchar(50) NOT NULL,
	"meter_type" "meter_type" NOT NULL,
	"location" varchar(255),
	"previous_kwh" numeric(12, 2),
	"current_kwh" numeric(12, 2),
	"multiplication_factor" numeric(6, 2) DEFAULT '1',
	"units_consumed" numeric(12, 2),
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ppm_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"scheduled_date" date,
	"completed" boolean DEFAULT false,
	"completed_date" date
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"target_date" date,
	"completed" boolean DEFAULT false,
	"dependencies" jsonb
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"manager_id" uuid,
	"start_date" date,
	"end_date" date,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_providers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"contact" varchar(20),
	"email" varchar(255),
	"categories" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shift_assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"shift_id" uuid NOT NULL,
	"date" date NOT NULL,
	"is_week_off" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "shifts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"department" varchar(100),
	"responsibility" varchar(50),
	"priority" "priority" DEFAULT 'low',
	"source" varchar(100),
	"eisenhower_matrix" varchar(50),
	"due_date" date,
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"assigned_to" varchar(255),
	"attachments" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth0_user_id" varchar(255) NOT NULL,
	"facility_id" uuid,
	"display_name" varchar(255),
	"phone" varchar(20),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_auth0_user_id_unique" UNIQUE("auth0_user_id")
);
--> statement-breakpoint
CREATE TABLE "vendor_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"department" varchar(100),
	"priority" "priority" DEFAULT 'medium',
	"status" "complaint_status" DEFAULT 'open' NOT NULL,
	"service_provider_id" uuid,
	"description" text,
	"attachments" jsonb,
	"expected_completion" date,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "water_infra_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"type" "water_source_type" NOT NULL,
	"capacity" numeric(12, 2),
	"location" varchar(255),
	"status" "device_status" DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE "water_quality_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"plant_type" "plant_type" NOT NULL,
	"parameters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_quality_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"plant_type" "plant_type" NOT NULL,
	"date" date NOT NULL,
	"parameters" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_readings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"facility_id" uuid NOT NULL,
	"source_name" varchar(255) NOT NULL,
	"source_type" "water_source_type" NOT NULL,
	"previous_liters" numeric(12, 2),
	"current_liters" numeric(12, 2),
	"consumed" numeric(12, 2),
	"level_percent" numeric(5, 2),
	"date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alert_configs" ADD CONSTRAINT "alert_configs_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "amc_contracts" ADD CONSTRAINT "amc_contracts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_categories" ADD CONSTRAINT "asset_categories_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_checklists" ADD CONSTRAINT "asset_checklists_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "asset_checklists" ADD CONSTRAINT "asset_checklists_category_id_asset_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."asset_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_category_id_asset_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."asset_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_scans" ADD CONSTRAINT "audit_scans_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_devices" ADD CONSTRAINT "biometric_devices_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_enrollments" ADD CONSTRAINT "biometric_enrollments_device_id_biometric_devices_id_fk" FOREIGN KEY ("device_id") REFERENCES "public"."biometric_devices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "biometric_enrollments" ADD CONSTRAINT "biometric_enrollments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "breakdown_records" ADD CONSTRAINT "breakdown_records_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_chat_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."chat_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "energy_meter_configs" ADD CONSTRAINT "energy_meter_configs_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "facilities" ADD CONSTRAINT "facilities_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_passes" ADD CONSTRAINT "gate_passes_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_checklists" ADD CONSTRAINT "hygiene_checklists_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hygiene_templates" ADD CONSTRAINT "hygiene_templates_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_definitions" ADD CONSTRAINT "kpi_definitions_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kpi_snapshots" ADD CONSTRAINT "kpi_snapshots_kpi_id_kpi_definitions_id_fk" FOREIGN KEY ("kpi_id") REFERENCES "public"."kpi_definitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "power_readings" ADD CONSTRAINT "power_readings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppm_schedules" ADD CONSTRAINT "ppm_schedules_asset_id_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_milestones" ADD CONSTRAINT "project_milestones_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_providers" ADD CONSTRAINT "service_providers_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shift_assignments" ADD CONSTRAINT "shift_assignments_shift_id_shifts_id_fk" FOREIGN KEY ("shift_id") REFERENCES "public"."shifts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "shifts" ADD CONSTRAINT "shifts_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_tickets" ADD CONSTRAINT "vendor_tickets_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vendor_tickets" ADD CONSTRAINT "vendor_tickets_service_provider_id_service_providers_id_fk" FOREIGN KEY ("service_provider_id") REFERENCES "public"."service_providers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_infra_configs" ADD CONSTRAINT "water_infra_configs_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_quality_configs" ADD CONSTRAINT "water_quality_configs_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_quality_readings" ADD CONSTRAINT "water_quality_readings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_readings" ADD CONSTRAINT "water_readings_facility_id_facilities_id_fk" FOREIGN KEY ("facility_id") REFERENCES "public"."facilities"("id") ON DELETE no action ON UPDATE no action;