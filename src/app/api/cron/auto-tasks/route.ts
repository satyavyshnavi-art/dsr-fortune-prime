import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskTemplates, tasks } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

function shouldRunToday(
  frequency: string | null,
  today: Date
): boolean {
  if (!frequency || frequency === "one_time") return false;

  const dayOfWeek = today.getDay(); // 0 = Sunday
  const dayOfMonth = today.getDate();
  const month = today.getMonth(); // 0-indexed

  switch (frequency) {
    case "daily":
      return true;
    case "weekly":
      return dayOfWeek === 1; // Monday
    case "fortnightly":
      return dayOfWeek === 1 && dayOfMonth <= 14;
    case "monthly":
      return dayOfMonth === 1;
    case "quarterly":
      return dayOfMonth === 1 && month % 3 === 0;
    case "half_yearly":
      return dayOfMonth === 1 && (month === 0 || month === 6);
    case "yearly":
      return dayOfMonth === 1 && month === 0;
    default:
      return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Get all task templates
    const templates = await db.select().from(taskTemplates);

    let tasksCreated = 0;
    let skipped = 0;

    for (const template of templates) {
      if (!shouldRunToday(template.frequency, now)) {
        skipped++;
        continue;
      }

      // Idempotency: check if a task was already created for this template + date
      const existing = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(
          and(
            eq(tasks.source, `template:${template.id}`),
            sql`${tasks.createdAt}::date = ${today}::date`
          )
        )
        .limit(1);

      if (existing.length > 0) {
        skipped++;
        continue;
      }

      // Generate task instance from template
      await db.insert(tasks).values({
        facilityId: template.facilityId,
        title: template.title,
        description: template.description,
        department: template.category,
        source: `template:${template.id}`,
        status: "pending",
        dueDate: today,
        createdAt: now,
      });
      tasksCreated++;
    }

    return NextResponse.json({
      success: true,
      templatesProcessed: templates.length,
      tasksCreated,
      skipped,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("CRON /api/cron/auto-tasks error:", error);
    return NextResponse.json(
      { error: "Auto-tasks cron failed" },
      { status: 500 }
    );
  }
}
