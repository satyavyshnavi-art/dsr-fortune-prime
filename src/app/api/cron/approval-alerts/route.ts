import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  approvalSteps,
  approvalAlerts,
  approvalRequests,
  notifications,
} from "@/db/schema";
import { eq, and, lt, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Find approval steps that are "pending" for more than 24 hours
    // Join with approval_requests to get context
    const pendingSteps = await db
      .select({
        stepId: approvalSteps.id,
        stepOrder: approvalSteps.stepOrder,
        approverId: approvalSteps.approverId,
        approverRole: approvalSteps.approverRole,
        requestId: approvalSteps.requestId,
        requestType: approvalRequests.type,
        requestDescription: approvalRequests.description,
        requestAmount: approvalRequests.amount,
      })
      .from(approvalSteps)
      .innerJoin(
        approvalRequests,
        eq(approvalSteps.requestId, approvalRequests.id)
      )
      .where(
        and(
          eq(approvalSteps.status, "pending"),
          lt(approvalRequests.createdAt, twentyFourHoursAgo)
        )
      );

    let alertsSent = 0;

    for (const step of pendingSteps) {
      // Check if we already sent an alert for this step in the last 24 hours
      const recentAlert = await db
        .select({ id: approvalAlerts.id })
        .from(approvalAlerts)
        .where(
          and(
            eq(approvalAlerts.stepId, step.stepId),
            sql`${approvalAlerts.sentAt} > ${twentyFourHoursAgo.toISOString()}::timestamp`
          )
        )
        .limit(1);

      if (recentAlert.length > 0) continue;

      // Record the alert
      await db.insert(approvalAlerts).values({
        stepId: step.stepId,
        alertType: "reminder",
        sentAt: now,
      });

      // Create notification for the approver
      if (step.approverId) {
        await db.insert(notifications).values({
          userId: step.approverId,
          type: "approval_reminder",
          title: `Pending Approval: ${step.requestType ?? "Request"}`,
          body: `An approval request${step.requestDescription ? ` for "${step.requestDescription}"` : ""}${step.requestAmount ? ` (amount: ${step.requestAmount})` : ""} has been waiting for your review for over 24 hours.`,
          channel: "push",
          createdAt: now,
        });
      }

      alertsSent++;
    }

    return NextResponse.json({
      success: true,
      pendingStepsFound: pendingSteps.length,
      alertsSent,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("CRON /api/cron/approval-alerts error:", error);
    return NextResponse.json(
      { error: "Approval alerts cron failed" },
      { status: 500 }
    );
  }
}
