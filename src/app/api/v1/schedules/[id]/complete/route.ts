import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scheduleCompletions, schedules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const completeScheduleSchema = z.object({
  completionDate: z.string(),
  status: z.string().max(50).optional(),
  completedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify schedule exists
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.id, id))
      .limit(1);

    if (!schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = completeScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await db
      .insert(scheduleCompletions)
      .values({ scheduleId: id, ...parsed.data })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/schedules/[id]/complete error:", error);
    return NextResponse.json({ error: "Failed to record completion" }, { status: 500 });
  }
}
