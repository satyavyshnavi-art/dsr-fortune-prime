import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskEscalations, taskComments } from "@/db/schema";
import { eq, and, desc, sql, type SQL } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import { cached, invalidate } from "@/lib/redis";

const createTaskSchema = z.object({
  facilityId: z.string().uuid(),
  title: z.string().min(1).max(255).transform(sanitizeInput),
  description: z.string().max(5000).transform(sanitizeInput).optional(),
  department: z.string().max(100).optional(),
  responsibility: z.string().max(50).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  source: z.string().max(100).optional(),
  eisenhowerMatrix: z.string().max(50).optional(),
  dueDate: z.string().optional(),
  status: z.enum(["pending", "unassigned", "in_progress", "completed", "cancelled"]).optional(),
  assignedTo: z.string().max(255).optional(),
  attachments: z.any().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "pending"
      | "unassigned"
      | "in_progress"
      | "completed"
      | "cancelled"
      | null;

    const conditions: SQL[] = [];
    if (facilityId) conditions.push(eq(tasks.facilityId, facilityId));
    if (status) conditions.push(eq(tasks.status, status));

    const cacheKey = `tasks:${facilityId ?? "all"}:${status ?? "all"}`;
    const result = await cached(cacheKey, 90, async () => {
      const taskRows = await (conditions.length > 0
        ? db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt))
        : db.select().from(tasks).orderBy(desc(tasks.createdAt)));

      if (taskRows.length === 0) return taskRows;

      const taskIds = taskRows.map((t) => t.id);
      const [allEscalations, allComments] = await Promise.all([
        db.select().from(taskEscalations).where(
          sql`${taskEscalations.taskId} IN (${sql.join(taskIds.map((id) => sql`${id}`), sql`, `)})`
        ),
        db.select().from(taskComments).where(
          sql`${taskComments.taskId} IN (${sql.join(taskIds.map((id) => sql`${id}`), sql`, `)})`
        ),
      ]);

      return taskRows.map((t) => ({
        ...t,
        escalations: allEscalations.filter((e) => e.taskId === t.id),
        comments: allComments.filter((c) => c.taskId === t.id),
      }));
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(tasks).values(parsed.data).returning();
    const created = result[0];
    invalidate("tasks:*", "dashboard:*").catch(() => {});

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
