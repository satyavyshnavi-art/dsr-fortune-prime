import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskEscalations, notifications, facilities } from "@/db/schema";
import { eq, and, lt, inArray, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Find tasks past due_date with status pending or in_progress
    const overdueTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        facilityId: tasks.facilityId,
        assignedTo: tasks.assignedTo,
        dueDate: tasks.dueDate,
        priority: tasks.priority,
      })
      .from(tasks)
      .where(
        and(
          lt(tasks.dueDate, today),
          inArray(tasks.status, ["pending", "in_progress"])
        )
      );

    let escalationsCreated = 0;
    let notificationsCreated = 0;

    for (const task of overdueTasks) {
      // Check if an escalation already exists for this task (avoid duplicates)
      const existing = await db
        .select({ id: taskEscalations.id })
        .from(taskEscalations)
        .where(
          and(
            eq(taskEscalations.taskId, task.id),
            sql`${taskEscalations.resolvedAt} IS NULL`
          )
        )
        .limit(1);

      if (existing.length > 0) continue;

      // Create escalation record
      await db.insert(taskEscalations).values({
        taskId: task.id,
        reason: `Task "${task.title}" is past due date (${task.dueDate}). Priority: ${task.priority}.`,
        escalatedAt: now,
      });
      escalationsCreated++;

      // Create notification for facility managers
      await db.insert(notifications).values({
        type: "escalation",
        title: `Overdue Task: ${task.title}`,
        body: `Task "${task.title}" was due on ${task.dueDate} and is still ${task.assignedTo ? "assigned to staff" : "unassigned"}. Please review and take action.`,
        channel: "push",
        createdAt: now,
      });
      notificationsCreated++;
    }

    return NextResponse.json({
      success: true,
      overdueTasksFound: overdueTasks.length,
      escalationsCreated,
      notificationsCreated,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("CRON /api/cron/escalation error:", error);
    return NextResponse.json(
      { error: "Escalation cron failed" },
      { status: 500 }
    );
  }
}
