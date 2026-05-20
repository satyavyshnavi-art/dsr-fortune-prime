import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { schedules } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod/v4";

const createScheduleSchema = z.object({
  facilityId: z.string().uuid(),
  title: z.string().min(1).max(255),
  frequency: z.enum(["daily", "weekly", "fortnightly", "monthly", "quarterly", "half_yearly", "annual"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  assignedTo: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    const query = facilityId
      ? db.select().from(schedules).where(eq(schedules.facilityId, facilityId)).orderBy(desc(schedules.createdAt))
      : db.select().from(schedules).orderBy(desc(schedules.createdAt));

    const result = await query;
    return NextResponse.json({ data: result, meta: { total: result.length } });
  } catch (error) {
    console.error("GET /api/v1/schedules error:", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createScheduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await db.insert(schedules).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/schedules error:", error);
    return NextResponse.json({ error: "Failed to create schedule" }, { status: 500 });
  }
}
