import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks, taskChecklistItems, taskEscalations, taskComments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import { invalidate } from "@/lib/redis";

const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).transform(sanitizeInput).optional(),
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.update(tasks).set(parsed.data).where(eq(tasks.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    invalidate("tasks:*", "dashboard:*").catch(() => {});
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await Promise.all([
      db.delete(taskChecklistItems).where(eq(taskChecklistItems.taskId, id)),
      db.delete(taskEscalations).where(eq(taskEscalations.taskId, id)),
      db.delete(taskComments).where(eq(taskComments.taskId, id)),
    ]);
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    invalidate("tasks:*", "dashboard:*").catch(() => {});
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
