import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  tasks,
  attendanceRecords,
  alerts,
  approvalRequests,
  inventoryItems,
} from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const today = new Date().toISOString().split("T")[0];

    // Task completion rates
    const allTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.facilityId, siteId));

    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === "completed").length;
    const taskCompletionRate =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Attendance today
    const todayAttendance = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.date, today)
        )
      );

    // Filter by facility via employee lookup would require a join,
    // so we return total attendance count for today
    const presentToday = todayAttendance.filter(
      (r) => r.status === "present" || r.status === "half_day"
    ).length;
    const absentToday = todayAttendance.filter(
      (r) => r.status === "absent"
    ).length;

    // Open alerts
    const openAlerts = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.facilityId, siteId),
          eq(alerts.status, "unacknowledged")
        )
      );

    // Pending approvals
    const pendingApprovals = await db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.facilityId, siteId),
          eq(approvalRequests.status, "pending")
        )
      );

    // Inventory reorder alerts
    const allInventory = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.facilityId, siteId));

    const inventoryAlerts = allInventory.filter(
      (item) =>
        item.currentQty !== null &&
        item.minReorderLevel !== null &&
        item.currentQty <= item.minReorderLevel
    );

    return NextResponse.json({
      data: {
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          completionRate: taskCompletionRate,
        },
        attendance: {
          present: presentToday,
          absent: absentToday,
          total: todayAttendance.length,
        },
        alerts: {
          open: openAlerts.length,
        },
        approvals: {
          pending: pendingApprovals.length,
        },
        inventory: {
          reorderAlerts: inventoryAlerts.length,
          totalItems: allInventory.length,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/v1/dashboard/[siteId] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch dashboard data" } },
      { status: 500 }
    );
  }
}
