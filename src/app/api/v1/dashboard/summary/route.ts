import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees, assets, complaints, tasks, alerts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    // Employee count
    const [empCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employees)
      .where(facilityId ? eq(employees.facilityId, facilityId) : undefined);

    // Asset counts by status
    const assetStats = await db
      .select({
        status: assets.status,
        count: sql<number>`count(*)::int`,
      })
      .from(assets)
      .where(facilityId ? eq(assets.facilityId, facilityId) : undefined)
      .groupBy(assets.status);

    // Complaint counts by status
    const complaintStats = await db
      .select({
        status: complaints.status,
        count: sql<number>`count(*)::int`,
      })
      .from(complaints)
      .where(facilityId ? eq(complaints.facilityId, facilityId) : undefined)
      .groupBy(complaints.status);

    // Task counts by status
    const taskStats = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(facilityId ? eq(tasks.facilityId, facilityId) : undefined)
      .groupBy(tasks.status);

    // Active alerts count
    const [alertCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(alerts)
      .where(
        facilityId
          ? and(
              eq(alerts.facilityId, facilityId),
              eq(alerts.status, "unacknowledged")
            )
          : eq(alerts.status, "unacknowledged")
      );

    const totalAssets = assetStats.reduce((sum, s) => sum + s.count, 0);
    const totalComplaints = complaintStats.reduce((sum, s) => sum + s.count, 0);
    const totalTasks = taskStats.reduce((sum, s) => sum + s.count, 0);

    return NextResponse.json({
      employees: { total: empCount.count },
      assets: {
        total: totalAssets,
        byStatus: Object.fromEntries(assetStats.map((s) => [s.status, s.count])),
      },
      complaints: {
        total: totalComplaints,
        byStatus: Object.fromEntries(complaintStats.map((s) => [s.status, s.count])),
      },
      tasks: {
        total: totalTasks,
        byStatus: Object.fromEntries(taskStats.map((s) => [s.status, s.count])),
      },
      alerts: {
        unacknowledged: alertCount.count,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/dashboard/summary error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 });
  }
}
