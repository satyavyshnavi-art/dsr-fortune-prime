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
} from "@/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    const facilityFilter = (table: { facilityId: any }) =>
      facilityId ? eq(table.facilityId, facilityId) : undefined;

    // ── Employees ──
    const [empCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employees)
      .where(facilityFilter(employees));

    // Today's attendance
    const today = new Date().toISOString().split("T")[0];
    const attendanceStats = await db
      .select({
        status: attendanceRecords.status,
        count: sql<number>`count(*)::int`,
      })
      .from(attendanceRecords)
      .where(
        facilityId
          ? and(
              eq(attendanceRecords.date, today),
              sql`${attendanceRecords.employeeId} IN (SELECT id FROM employees WHERE facility_id = ${facilityId})`
            )
          : eq(attendanceRecords.date, today)
      )
      .groupBy(attendanceRecords.status);

    const presentCount =
      attendanceStats.find((s) => s.status === "present")?.count ?? 0;
    const absentCount =
      attendanceStats.find((s) => s.status === "absent")?.count ?? 0;
    const halfDayCount =
      attendanceStats.find((s) => s.status === "half_day")?.count ?? 0;
    const leaveCount =
      attendanceStats.find((s) => s.status === "leave")?.count ?? 0;
    const totalAttendanceRecords = attendanceStats.reduce(
      (sum, s) => sum + s.count,
      0
    );
    const attendanceRate =
      totalAttendanceRecords > 0
        ? Math.round(
            ((presentCount + halfDayCount) / totalAttendanceRecords) * 100
          )
        : 0;

    // Recent check-ins (last 5)
    const recentCheckIns = await db
      .select({
        employeeId: attendanceRecords.employeeId,
        date: attendanceRecords.date,
        status: attendanceRecords.status,
        checkIn: attendanceRecords.checkIn,
      })
      .from(attendanceRecords)
      .orderBy(desc(attendanceRecords.checkIn))
      .limit(5);

    // ── Assets ──
    const assetStats = await db
      .select({
        status: assets.status,
        count: sql<number>`count(*)::int`,
      })
      .from(assets)
      .where(facilityFilter(assets))
      .groupBy(assets.status);

    const totalAssets = assetStats.reduce((sum, s) => sum + s.count, 0);
    const activeAssets =
      assetStats.find((s) => s.status === "active")?.count ?? 0;
    const maintenanceAssets =
      assetStats.find((s) => s.status === "maintenance")?.count ?? 0;
    const inactiveAssets =
      assetStats.find((s) => s.status === "inactive")?.count ?? 0;

    // Assets by category
    const assetsByCategory = await db
      .select({
        categoryName: assetCategories.name,
        count: sql<number>`count(*)::int`,
      })
      .from(assets)
      .innerJoin(assetCategories, eq(assets.categoryId, assetCategories.id))
      .where(facilityFilter(assets))
      .groupBy(assetCategories.name);

    // Gate passes
    const gatePassStats = await db
      .select({
        status: gatePasses.status,
        count: sql<number>`count(*)::int`,
      })
      .from(gatePasses)
      .where(facilityFilter(gatePasses))
      .groupBy(gatePasses.status);
    const gatePassOut =
      gatePassStats.find((s) => s.status === "out")?.count ?? 0;
    const gatePassPending =
      gatePassStats.find((s) => s.status === "pending")?.count ?? 0;

    // ── Complaints ──
    const complaintStats = await db
      .select({
        status: complaints.status,
        count: sql<number>`count(*)::int`,
      })
      .from(complaints)
      .where(facilityFilter(complaints))
      .groupBy(complaints.status);

    const totalComplaints = complaintStats.reduce(
      (sum, s) => sum + s.count,
      0
    );
    const openComplaints =
      complaintStats.find((s) => s.status === "open")?.count ?? 0;
    const inProgressComplaints =
      complaintStats.find((s) => s.status === "in_progress")?.count ?? 0;
    const resolvedComplaints =
      complaintStats.find((s) => s.status === "resolved")?.count ?? 0;
    const closedComplaints =
      complaintStats.find((s) => s.status === "closed")?.count ?? 0;

    // Recent complaints (last 5)
    const recentComplaints = await db
      .select({
        id: complaints.id,
        title: complaints.title,
        status: complaints.status,
        priority: complaints.priority,
        createdAt: complaints.createdAt,
      })
      .from(complaints)
      .where(facilityFilter(complaints))
      .orderBy(desc(complaints.createdAt))
      .limit(5);

    // Avg resolution time (for resolved/closed complaints)
    const [avgResolution] = await db
      .select({
        avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 0)::int`,
      })
      .from(complaints)
      .where(
        facilityId
          ? and(
              eq(complaints.facilityId, facilityId),
              sql`resolved_at IS NOT NULL`
            )
          : sql`resolved_at IS NOT NULL`
      );

    // ── Tasks ──
    const taskStats = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(facilityFilter(tasks))
      .groupBy(tasks.status);

    const totalTasks = taskStats.reduce((sum, s) => sum + s.count, 0);
    const pendingTasks =
      taskStats.find((s) => s.status === "pending")?.count ?? 0;
    const unassignedTasks =
      taskStats.find((s) => s.status === "unassigned")?.count ?? 0;
    const inProgressTasks =
      taskStats.find((s) => s.status === "in_progress")?.count ?? 0;
    const completedTasks =
      taskStats.find((s) => s.status === "completed")?.count ?? 0;
    const cancelledTasks =
      taskStats.find((s) => s.status === "cancelled")?.count ?? 0;

    // Overdue tasks
    const [overdueCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(
        facilityId
          ? and(
              eq(tasks.facilityId, facilityId),
              sql`due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')`
            )
          : sql`due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')`
      );

    // Eisenhower matrix counts
    const eisenhowerStats = await db
      .select({
        matrix: tasks.eisenhowerMatrix,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(facilityFilter(tasks))
      .groupBy(tasks.eisenhowerMatrix);

    // Recent tasks (for list view)
    const recentTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        priority: tasks.priority,
        status: tasks.status,
        dueDate: tasks.dueDate,
        eisenhowerMatrix: tasks.eisenhowerMatrix,
      })
      .from(tasks)
      .where(facilityFilter(tasks))
      .orderBy(desc(tasks.createdAt))
      .limit(10);

    // ── Power Readings ──
    const [powerAgg] = await db
      .select({
        totalKwh: sql<number>`COALESCE(SUM(units_consumed::numeric), 0)::float`,
        readingCount: sql<number>`count(*)::int`,
      })
      .from(powerReadings)
      .where(facilityFilter(powerReadings));

    const [meterCount] = await db
      .select({
        count: sql<number>`count(DISTINCT meter_id)::int`,
      })
      .from(powerReadings)
      .where(facilityFilter(powerReadings));

    const recentPowerReadings = await db
      .select({
        meterId: powerReadings.meterId,
        meterType: powerReadings.meterType,
        location: powerReadings.location,
        unitsConsumed: powerReadings.unitsConsumed,
        date: powerReadings.date,
      })
      .from(powerReadings)
      .where(facilityFilter(powerReadings))
      .orderBy(desc(powerReadings.date))
      .limit(10);

    // Power by meter type
    const powerByType = await db
      .select({
        meterType: powerReadings.meterType,
        totalUnits: sql<number>`COALESCE(SUM(units_consumed::numeric), 0)::float`,
        meterCount: sql<number>`count(DISTINCT meter_id)::int`,
      })
      .from(powerReadings)
      .where(facilityFilter(powerReadings))
      .groupBy(powerReadings.meterType);

    // ── Water Readings ──
    const [waterAgg] = await db
      .select({
        totalLiters: sql<number>`COALESCE(SUM(consumed::numeric), 0)::float`,
        readingCount: sql<number>`count(*)::int`,
        activeSources: sql<number>`count(DISTINCT source_name)::int`,
      })
      .from(waterReadings)
      .where(facilityFilter(waterReadings));

    const recentWaterReadings = await db
      .select({
        sourceName: waterReadings.sourceName,
        sourceType: waterReadings.sourceType,
        consumed: waterReadings.consumed,
        levelPercent: waterReadings.levelPercent,
        date: waterReadings.date,
      })
      .from(waterReadings)
      .where(facilityFilter(waterReadings))
      .orderBy(desc(waterReadings.date))
      .limit(10);

    // ── Water Quality ──
    const waterQualityData = await db
      .select({
        plantType: waterQualityReadings.plantType,
        parameters: waterQualityReadings.parameters,
        date: waterQualityReadings.date,
      })
      .from(waterQualityReadings)
      .where(facilityFilter(waterQualityReadings))
      .orderBy(desc(waterQualityReadings.date))
      .limit(10);

    // ── Vendor Tickets ──
    const vendorStats = await db
      .select({
        status: vendorTickets.status,
        count: sql<number>`count(*)::int`,
      })
      .from(vendorTickets)
      .where(facilityFilter(vendorTickets))
      .groupBy(vendorTickets.status);

    const totalVendorTickets = vendorStats.reduce(
      (sum, s) => sum + s.count,
      0
    );
    const openVendor =
      vendorStats.find((s) => s.status === "open")?.count ?? 0;
    const inProgressVendor =
      vendorStats.find((s) => s.status === "in_progress")?.count ?? 0;
    const resolvedVendor =
      vendorStats.find((s) => s.status === "resolved")?.count ?? 0;
    const closedVendor =
      vendorStats.find((s) => s.status === "closed")?.count ?? 0;

    // Avg resolution time for vendor tickets
    const [avgVendorResolution] = await db
      .select({
        avgDays: sql<number>`COALESCE(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 86400), 0)::int`,
      })
      .from(vendorTickets)
      .where(
        facilityId
          ? and(
              eq(vendorTickets.facilityId, facilityId),
              sql`resolved_at IS NOT NULL`
            )
          : sql`resolved_at IS NOT NULL`
      );

    // ── Alerts ──
    const alertStats = await db
      .select({
        severity: alerts.severity,
        count: sql<number>`count(*)::int`,
      })
      .from(alerts)
      .where(
        facilityId
          ? and(
              eq(alerts.facilityId, facilityId),
              eq(alerts.status, "unacknowledged")
            )
          : eq(alerts.status, "unacknowledged")
      )
      .groupBy(alerts.severity);

    const totalAlerts = alertStats.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      employees: {
        total: empCount.count,
        present: presentCount,
        absent: absentCount + leaveCount,
        late: halfDayCount,
      },
      attendance: {
        rate: attendanceRate,
        recentCheckIns,
        byStatus: Object.fromEntries(
          attendanceStats.map((s) => [s.status, s.count])
        ),
      },
      assets: {
        total: totalAssets,
        active: activeAssets,
        maintenance: maintenanceAssets,
        inactive: inactiveAssets,
        byCategory: assetsByCategory,
        byStatus: Object.fromEntries(
          assetStats.map((s) => [s.status, s.count])
        ),
        gatePasses: { out: gatePassOut, pending: gatePassPending },
      },
      complaints: {
        total: totalComplaints,
        open: openComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        closed: closedComplaints,
        avgResolutionDays: avgResolution.avgDays,
        recentComplaints,
        byStatus: Object.fromEntries(
          complaintStats.map((s) => [s.status, s.count])
        ),
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
        unassigned: unassignedTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
        cancelled: cancelledTasks,
        overdue: overdueCount.count,
        eisenhower: Object.fromEntries(
          eisenhowerStats.map((s) => [s.matrix ?? "unclassified", s.count])
        ),
        recentTasks,
        byStatus: Object.fromEntries(
          taskStats.map((s) => [s.status, s.count])
        ),
      },
      powerReadings: {
        totalKwh: powerAgg.totalKwh,
        avgDaily:
          powerAgg.readingCount > 0
            ? Math.round(powerAgg.totalKwh / Math.max(1, powerAgg.readingCount))
            : 0,
        activeMeters: meterCount.count,
        byType: Object.fromEntries(
          powerByType.map((p) => [
            p.meterType,
            { totalUnits: p.totalUnits, meterCount: p.meterCount },
          ])
        ),
        recentReadings: recentPowerReadings,
      },
      waterReadings: {
        totalLiters: waterAgg.totalLiters,
        avgDaily:
          waterAgg.readingCount > 0
            ? Math.round(
                waterAgg.totalLiters / Math.max(1, waterAgg.readingCount)
              )
            : 0,
        activeSources: waterAgg.activeSources,
        recentReadings: recentWaterReadings,
      },
      waterQuality: {
        readings: waterQualityData,
        hasData: waterQualityData.length > 0,
      },
      vendorTickets: {
        total: totalVendorTickets,
        open: openVendor,
        inProgress: inProgressVendor,
        resolved: resolvedVendor,
        closed: closedVendor,
        avgResolutionDays: avgVendorResolution.avgDays,
        byStatus: Object.fromEntries(
          vendorStats.map((s) => [s.status, s.count])
        ),
      },
      alerts: {
        total: totalAlerts,
        critical: alertStats.find((s) => s.severity === "critical")?.count ?? 0,
        high: alertStats.find((s) => s.severity === "high")?.count ?? 0,
        medium: alertStats.find((s) => s.severity === "medium")?.count ?? 0,
        low: alertStats.find((s) => s.severity === "low")?.count ?? 0,
        unacknowledged: totalAlerts,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/dashboard/summary error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard summary" },
      { status: 500 }
    );
  }
}
