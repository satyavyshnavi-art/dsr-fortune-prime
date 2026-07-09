import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskEscalations } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import { invalidate } from "@/lib/redis";

const createEscalationSchema = z.object({
  escalatedTo: z.string().uuid().optional(),
  reason: z.string().min(1).max(2000).transform(sanitizeInput),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(taskEscalations)
      .where(eq(taskEscalations.taskId, id))
      .orderBy(desc(taskEscalations.escalatedAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/tasks/[id]/escalations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task escalations" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = createEscalationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const result = await db
      .insert(taskEscalations)
      .values({ ...parsed.data, taskId: id })
      .returning();
    invalidate("tasks:*").catch(() => {});
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/tasks/[id]/escalations error:", error);
    return NextResponse.json(
      { error: "Failed to create task escalation" },
      { status: 500 }
    );
  }
}
