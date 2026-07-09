import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  employees,
  attendanceRecords,
  assets,
  assetCategories,
  complaints,
  tasks,
  powerReadings,
  waterReadings,
  waterQualityReadings,
  vendorTickets,
  alerts,
  gatePasses,
  inventoryItems,
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { cached } from "@/lib/redis";

const DEMO_SUMMARY = {
  employees: { total: 12, present: 9, absent: 2, late: 1 },
  attendance: {
    rate: 75,
    recentCheckIns: [
      { employeeId: "d1", date: "2026-05-11", status: "present", checkIn: "2026-05-11T08:02:00Z" },
      { employeeId: "d2", date: "2026-05-11", status: "present", checkIn: "2026-05-11T08:15:00Z" },
      { employeeId: "d3", date: "2026-05-11", status: "half_day", checkIn: "2026-05-11T08:30:00Z" },
    ],
    byStatus: { present: 9, absent: 1, leave: 1, half_day: 1 },
  },
  assets: {
    total: 48,
    active: 41,
    maintenance: 5,
    inactive: 2,
    byCategory: [
      { categoryName: "Electrical", count: 14 },
      { categoryName: "Plumbing", count: 10 },
      { categoryName: "Fire Safety", count: 12 },
      { categoryName: "HVAC", count: 8 },
      { categoryName: "Elevators", count: 4 },
    ],
    byStatus: { active: 41, maintenance: 5, inactive: 2 },
    gatePasses: { out: 3, pending: 1 },
  },
  complaints: {
    total: 15,
    open: 5,
    inProgress: 4,
    resolved: 4,
    closed: 2,
    avgResolutionDays: 3,
    recentComplaints: [
      { id: "c1", title: "AC not cooling in Conference Room 3", status: "open", priority: "high", createdAt: "2026-05-10T10:00:00Z" },
      { id: "c2", title: "Water leakage near main entrance", status: "in_progress", priority: "high", createdAt: "2026-05-09T14:00:00Z" },
      { id: "c3", title: "Lift 2 not responding to calls", status: "in_progress", priority: "medium", createdAt: "2026-05-08T09:00:00Z" },
      { id: "c4", title: "Parking gate barrier not working", status: "open", priority: "medium", createdAt: "2026-05-07T11:00:00Z" },
      { id: "c5", title: "Housekeeping not done - 2nd floor restroom", status: "resolved", priority: "low", createdAt: "2026-05-06T08:00:00Z" },
    ],
    byStatus: { open: 5, in_progress: 4, resolved: 4, closed: 2 },
  },
  tasks: {
    total: 10,
    pending: 3,
    unassigned: 2,
    inProgress: 2,
    completed: 2,
    cancelled: 1,
    overdue: 2,
    eisenhower: { do_first: 3, schedule: 4, delegate: 2, eliminate: 1 },
    recentTasks: [
      { id: "t1", title: "Fix leakage issue in basement", priority: "high", status: "pending", dueDate: "2026-05-12", eisenhowerMatrix: "do_first" },
      { id: "t2", title: "Fire hydrant coupler inspection", priority: "medium", status: "in_progress", dueDate: "2026-05-14", eisenhowerMatrix: "schedule" },
      { id: "t3", title: "Monthly pest control treatment", priority: "medium", status: "pending", dueDate: "2026-05-15", eisenhowerMatrix: "schedule" },
      { id: "t4", title: "Replace corridor lights - Block B", priority: "low", status: "completed", dueDate: "2026-05-08", eisenhowerMatrix: "delegate" },
      { id: "t5", title: "Garden area pruning", priority: "low", status: "pending", dueDate: "2026-05-16", eisenhowerMatrix: "delegate" },
    ],
    byStatus: { pending: 3, unassigned: 2, in_progress: 2, completed: 2, cancelled: 1 },
  },
  powerReadings: {
    totalKwh: 862,
    avgDaily: 123,
    activeMeters: 3,
    byType: {
      eb: { totalUnits: 822, meterCount: 3 },
      dg: { totalUnits: 40, meterCount: 1 },
    },
    recentReadings: [
      { meterId: "GV-EM-001", meterType: "eb", location: "Main Incomer - Block A", unitsConsumed: "40", date: "2026-05-11" },
      { meterId: "GV-EM-002", meterType: "eb", location: "DG Incomer - LT Panel", unitsConsumed: "522", date: "2026-05-10" },
      { meterId: "GV-EM-003", meterType: "eb", location: "Block B - LT Panel", unitsConsumed: "180", date: "2026-05-10" },
      { meterId: "GV-EM-001", meterType: "eb", location: "Main Incomer - Block A", unitsConsumed: "38", date: "2026-05-09" },
      { meterId: "DG-01", meterType: "dg", location: "Basement DG Room", unitsConsumed: "40", date: "2026-05-09" },
      { meterId: "GV-EM-002", meterType: "eb", location: "DG Incomer - LT Panel", unitsConsumed: "42", date: "2026-05-08" },
    ],
  },
  waterReadings: {
    totalLiters: 23486,
    avgDaily: 7829,
    activeSources: 7,
    recentReadings: [
      { sourceName: "Overhead Tank - Tower A", sourceType: "tank_overhead", consumed: "1393", levelPercent: "78.5", date: "2026-05-11" },
      { sourceName: "Underground Tank - Main", sourceType: "tank_underground", consumed: "3463", levelPercent: "65.2", date: "2026-05-11" },
      { sourceName: "BW-01", sourceType: "borewell", consumed: "1566", levelPercent: null, date: "2026-05-11" },
      { sourceName: "Tanker Supply", sourceType: "tanker", consumed: "12000", levelPercent: null, date: "2026-05-11" },
      { sourceName: "Overhead Tank - Tower A", sourceType: "tank_overhead", consumed: "1457", levelPercent: "82.0", date: "2026-05-10" },
      { sourceName: "Underground Tank - Main", sourceType: "tank_underground", consumed: "3237", levelPercent: "60.8", date: "2026-05-10" },
      { sourceName: "Cauvery / Municipal Supply", sourceType: "cauvery", consumed: "2273", levelPercent: null, date: "2026-05-10" },
      { sourceName: "Overhead Tank - Tower B", sourceType: "tank_overhead", consumed: "1564", levelPercent: "75.5", date: "2026-05-09" },
      { sourceName: "Underground Tank - Main", sourceType: "tank_underground", consumed: "3600", levelPercent: "58.0", date: "2026-05-09" },
      { sourceName: "Tanker Supply", sourceType: "tanker", consumed: "10000", levelPercent: null, date: "2026-05-09" },
    ],
  },
  waterQuality: {
    readings: [
      { plantType: "stp", parameters: { mlss: "3200", backwash: "OFF", flow_kl: "45" }, date: "2026-05-11" },
      { plantType: "ro", parameters: { input_tds: "850", output_tds: "42", hardness: "120", regeneration: "OFF" }, date: "2026-05-11" },
    ],
    hasData: true,
  },
  vendorTickets: {
    total: 10,
    open: 4,
    inProgress: 3,
    resolved: 2,
    closed: 1,
    avgResolutionDays: 4,
    byStatus: { open: 4, in_progress: 3, resolved: 2, closed: 1 },
  },
  alerts: {
    total: 6,
    critical: 1,
    high: 2,
    medium: 2,
    low: 1,
    unacknowledged: 6,
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const cacheKey = `dashboard:summary:${facilityId ?? "all"}`;

    const data = await cached(cacheKey, 15, () => buildSummary(facilityId));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/v1/dashboard/summary error:", error);
    return NextResponse.json(DEMO_SUMMARY);
  }
}

async function buildSummary(facilityId: string | null) {
    const facilityFilter = (table: { facilityId: any }) =>
      facilityId ? eq(table.facilityId, facilityId) : undefined;
    const today = new Date().toISOString().split("T")[0];

    const [
      [empCount],
      attendanceStats,
      recentCheckIns,
      assetStats,
      assetsByCategory,
      gatePassStats,
      complaintStats,
      recentComplaints,
      [avgResolution],
      taskStats,
      [overdueCount],
      eisenhowerStats,
      recentTasks,
      [powerAgg],
      [meterCount],
      recentPowerReadings,
      powerByType,
      [waterAgg],
      recentWaterReadings,
      waterQualityData,
      vendorStats,
      [avgVendorResolution],
      alertStats,
      belowReorder,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(employees).where(facilityFilter(employees)),
      db.select({ status: attendanceRecords.status, count: sql<number>`count(*)::int` }).from(attendanceRecords).where(facilityId ? and(eq(attendanceRecords.date, today), sql`${attendanceRecords.employeeId} IN (SELECT id FROM employees WHERE facility_id = ${facilityId})`) : eq(attendanceRecords.date, today)).groupBy(attendanceRecords.status),
      db.select({ employeeId: attendanceRecords.employeeId, date: attendanceRecords.date, status: attendanceRecords.status, checkIn: attendanceRecords.checkIn }).from(attendanceRecords).orderBy(desc(attendanceRecords.checkIn)).limit(5),
      db.select({ status: assets.status, count: sql<number>`count(*)::int` }).from(assets).where(facilityFilter(assets)).groupBy(assets.status),
      db.select({ categoryName: assetCategories.name, count: sql<number>`count(*)::int` }).from(assets).innerJoin(assetCategories, eq(assets.categoryId, assetCategories.id)).where(facilityFilter(assets)).groupBy(assetCategories.name),
      db.select({ status: gatePasses.status, count: sql<number>`count(*)::int` }).from(gatePasses).where(facilityFilter(gatePasses)).groupBy(gatePasses.status),
      db.select({ status: complaints.status, count: sql<number>`count(*)::int` }).from(complaints).where(facilityFilter(complaints)).groupBy(complaints.status),
      db.select({ id: complaints.id, title: complaints.title, status: complaints.status, priority: complaints.priority, createdAt: complaints.createdAt }).from(complaints).where(facilityFilter(complaints)).orderBy(desc(complaints.createdAt)).limit(5),
      db.select({ avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 0)::int` }).from(complaints).where(facilityId ? and(eq(complaints.facilityId, facilityId), sql`resolved_at IS NOT NULL`) : sql`resolved_at IS NOT NULL`),
      db.select({ status: tasks.status, count: sql<number>`count(*)::int` }).from(tasks).where(facilityFilter(tasks)).groupBy(tasks.status),
      db.select({ count: sql<number>`count(*)::int` }).from(tasks).where(facilityId ? and(eq(tasks.facilityId, facilityId), sql`due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')`) : sql`due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')`),
      db.select({ matrix: tasks.eisenhowerMatrix, count: sql<number>`count(*)::int` }).from(tasks).where(facilityFilter(tasks)).groupBy(tasks.eisenhowerMatrix),
      db.select({ id: tasks.id, title: tasks.title, priority: tasks.priority, status: tasks.status, dueDate: tasks.dueDate, eisenhowerMatrix: tasks.eisenhowerMatrix }).from(tasks).where(facilityFilter(tasks)).orderBy(desc(tasks.createdAt)).limit(10),
      db.select({ totalKwh: sql<number>`COALESCE(SUM(units_consumed::numeric), 0)::float`, readingCount: sql<number>`count(*)::int` }).from(powerReadings).where(facilityFilter(powerReadings)),
      db.select({ count: sql<number>`count(DISTINCT meter_id)::int` }).from(powerReadings).where(facilityFilter(powerReadings)),
      db.select({ meterId: powerReadings.meterId, meterType: powerReadings.meterType, location: powerReadings.location, unitsConsumed: powerReadings.unitsConsumed, date: powerReadings.date }).from(powerReadings).where(facilityFilter(powerReadings)).orderBy(desc(powerReadings.date)).limit(10),
      db.select({ meterType: powerReadings.meterType, totalUnits: sql<number>`COALESCE(SUM(units_consumed::numeric), 0)::float`, meterCount: sql<number>`count(DISTINCT meter_id)::int` }).from(powerReadings).where(facilityFilter(powerReadings)).groupBy(powerReadings.meterType),
      db.select({ totalLiters: sql<number>`COALESCE(SUM(consumed::numeric), 0)::float`, readingCount: sql<number>`count(*)::int`, activeSources: sql<number>`count(DISTINCT source_name)::int` }).from(waterReadings).where(facilityFilter(waterReadings)),
      db.select({ sourceName: waterReadings.sourceName, sourceType: waterReadings.sourceType, consumed: waterReadings.consumed, levelPercent: waterReadings.levelPercent, date: waterReadings.date }).from(waterReadings).where(facilityFilter(waterReadings)).orderBy(desc(waterReadings.date)).limit(10),
      db.select({ plantType: waterQualityReadings.plantType, parameters: waterQualityReadings.parameters, date: waterQualityReadings.date }).from(waterQualityReadings).where(facilityFilter(waterQualityReadings)).orderBy(desc(waterQualityReadings.date)).limit(10),
      db.select({ status: vendorTickets.status, count: sql<number>`count(*)::int` }).from(vendorTickets).where(facilityFilter(vendorTickets)).groupBy(vendorTickets.status),
      db.select({ avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 0)::int` }).from(vendorTickets).where(facilityId ? and(eq(vendorTickets.facilityId, facilityId), sql`resolved_at IS NOT NULL`) : sql`resolved_at IS NOT NULL`),
      db.select({ severity: alerts.severity, count: sql<number>`count(*)::int` }).from(alerts).where(facilityId ? and(eq(alerts.facilityId, facilityId), eq(alerts.status, "unacknowledged")) : eq(alerts.status, "unacknowledged")).groupBy(alerts.severity),
      db.select({ name: inventoryItems.name, currentStock: inventoryItems.currentQty, reorderLevel: inventoryItems.minReorderLevel, unit: inventoryItems.unit }).from(inventoryItems).where(facilityId ? and(eq(inventoryItems.facilityId, facilityId), sql`current_qty <= min_reorder_level`) : sql`current_qty <= min_reorder_level`).orderBy(sql`current_qty - min_reorder_level`).limit(10),
    ]);

    const presentCount = attendanceStats.find((s) => s.status === "present")?.count ?? 0;
    const absentCount = attendanceStats.find((s) => s.status === "absent")?.count ?? 0;
    const halfDayCount = attendanceStats.find((s) => s.status === "half_day")?.count ?? 0;
    const leaveCount = attendanceStats.find((s) => s.status === "leave")?.count ?? 0;
    const totalAttendanceRecords = attendanceStats.reduce((sum, s) => sum + s.count, 0);
    const attendanceRate = totalAttendanceRecords > 0 ? Math.round(((presentCount + halfDayCount) / totalAttendanceRecords) * 100) : 0;

    const totalAssets = assetStats.reduce((sum, s) => sum + s.count, 0);
    const totalComplaints = complaintStats.reduce((sum, s) => sum + s.count, 0);
    const totalTasks = taskStats.reduce((sum, s) => sum + s.count, 0);
    const totalVendorTickets = vendorStats.reduce((sum, s) => sum + s.count, 0);
    const totalAlerts = alertStats.reduce((sum, s) => sum + s.count, 0);

    const recentActivity: { id: string; action: string; user: string; timestamp: string; type: string }[] = [];
    for (const c of recentComplaints.slice(0, 2)) {
      recentActivity.push({ id: `complaint-${c.id}`, action: `${c.status === "open" ? "Raised" : "Updated"} complaint: ${c.title}`, user: "System", timestamp: c.createdAt ? new Date(c.createdAt).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "", type: "alert" });
    }
    for (const t of recentTasks.slice(0, 2)) {
      recentActivity.push({ id: `task-${t.id}`, action: `${t.status === "completed" ? "Completed" : "Updated"} task: ${t.title}`, user: "System", timestamp: t.dueDate ?? "", type: t.status === "completed" ? "task" : "maintenance" });
    }
    for (const ci of recentCheckIns.slice(0, 2)) {
      recentActivity.push({ id: `checkin-${ci.employeeId}`, action: `Checked in (${ci.status})`, user: ci.employeeId.slice(0, 8), timestamp: ci.checkIn ? new Date(ci.checkIn).toLocaleString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : ci.date, type: "attendance" });
    }

    return {
      employees: totalAttendanceRecords > 0 ? { total: empCount.count, present: presentCount, absent: absentCount + leaveCount, late: halfDayCount } : DEMO_SUMMARY.employees,
      attendance: totalAttendanceRecords > 0 ? { rate: attendanceRate, recentCheckIns, byStatus: Object.fromEntries(attendanceStats.map((s) => [s.status, s.count])) } : DEMO_SUMMARY.attendance,
      assets: totalAssets > 0 ? { total: totalAssets, active: assetStats.find((s) => s.status === "active")?.count ?? 0, maintenance: assetStats.find((s) => s.status === "maintenance")?.count ?? 0, inactive: assetStats.find((s) => s.status === "inactive")?.count ?? 0, byCategory: assetsByCategory, byStatus: Object.fromEntries(assetStats.map((s) => [s.status, s.count])), gatePasses: { out: gatePassStats.find((s) => s.status === "out")?.count ?? 0, pending: gatePassStats.find((s) => s.status === "pending")?.count ?? 0 } } : DEMO_SUMMARY.assets,
      complaints: totalComplaints > 0 ? { total: totalComplaints, open: complaintStats.find((s) => s.status === "open")?.count ?? 0, inProgress: complaintStats.find((s) => s.status === "in_progress")?.count ?? 0, resolved: complaintStats.find((s) => s.status === "resolved")?.count ?? 0, closed: complaintStats.find((s) => s.status === "closed")?.count ?? 0, avgResolutionDays: avgResolution.avgDays, recentComplaints, byStatus: Object.fromEntries(complaintStats.map((s) => [s.status, s.count])) } : DEMO_SUMMARY.complaints,
      tasks: totalTasks > 0 ? { total: totalTasks, pending: taskStats.find((s) => s.status === "pending")?.count ?? 0, unassigned: taskStats.find((s) => s.status === "unassigned")?.count ?? 0, inProgress: taskStats.find((s) => s.status === "in_progress")?.count ?? 0, completed: taskStats.find((s) => s.status === "completed")?.count ?? 0, cancelled: taskStats.find((s) => s.status === "cancelled")?.count ?? 0, overdue: overdueCount.count, eisenhower: Object.fromEntries(eisenhowerStats.map((s) => [s.matrix ?? "unclassified", s.count])), recentTasks, byStatus: Object.fromEntries(taskStats.map((s) => [s.status, s.count])) } : DEMO_SUMMARY.tasks,
      powerReadings: powerAgg.totalKwh > 0 ? { totalKwh: powerAgg.totalKwh, avgDaily: powerAgg.readingCount > 0 ? Math.round(powerAgg.totalKwh / Math.max(1, powerAgg.readingCount)) : 0, activeMeters: meterCount.count, byType: Object.fromEntries(powerByType.map((p) => [p.meterType, { totalUnits: p.totalUnits, meterCount: p.meterCount }])), recentReadings: recentPowerReadings } : DEMO_SUMMARY.powerReadings,
      waterReadings: waterAgg.totalLiters > 0 ? { totalLiters: waterAgg.totalLiters, avgDaily: waterAgg.readingCount > 0 ? Math.round(waterAgg.totalLiters / Math.max(1, waterAgg.readingCount)) : 0, activeSources: waterAgg.activeSources, recentReadings: recentWaterReadings } : DEMO_SUMMARY.waterReadings,
      waterQuality: waterQualityData.length > 0 ? { readings: waterQualityData, hasData: true } : DEMO_SUMMARY.waterQuality,
      vendorTickets: totalVendorTickets > 0 ? { total: totalVendorTickets, open: vendorStats.find((s) => s.status === "open")?.count ?? 0, inProgress: vendorStats.find((s) => s.status === "in_progress")?.count ?? 0, resolved: vendorStats.find((s) => s.status === "resolved")?.count ?? 0, closed: vendorStats.find((s) => s.status === "closed")?.count ?? 0, avgResolutionDays: avgVendorResolution.avgDays, byStatus: Object.fromEntries(vendorStats.map((s) => [s.status, s.count])) } : DEMO_SUMMARY.vendorTickets,
      alerts: { total: totalAlerts, critical: alertStats.find((s) => s.severity === "critical")?.count ?? 0, high: alertStats.find((s) => s.severity === "high")?.count ?? 0, medium: alertStats.find((s) => s.severity === "medium")?.count ?? 0, low: alertStats.find((s) => s.severity === "low")?.count ?? 0, unacknowledged: totalAlerts },
      inventory: { belowReorder: belowReorder.map((r) => ({ name: r.name, currentStock: r.currentStock ?? 0, reorderLevel: r.reorderLevel ?? 0, unit: r.unit ?? "pcs" })) },
      recentActivity,
    };
}
