import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workLogs } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { z } from "zod/v4";

const createWorkLogSchema = z.object({
  facilityId: z.string().uuid(),
  assetCategory: z.string().max(100).optional(),
  logDate: z.string(),
  shift: z.string().max(10).optional(),
  readings: z.record(z.string(), z.unknown()).optional(),
  loggedBy: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const conditions = [];
    if (facilityId) conditions.push(eq(workLogs.facilityId, facilityId));
    if (category) conditions.push(eq(workLogs.assetCategory, category));
    if (from) conditions.push(gte(workLogs.logDate, from));
    if (to) conditions.push(lte(workLogs.logDate, to));

    const query =
      conditions.length > 0
        ? db.select().from(workLogs).where(and(...conditions)).orderBy(desc(workLogs.createdAt))
        : db.select().from(workLogs).orderBy(desc(workLogs.createdAt));

    const result = await query;
    return NextResponse.json({ data: result, meta: { total: result.length } });
  } catch (error) {
    console.error("GET /api/v1/work-logs error:", error);
    return NextResponse.json({ error: "Failed to fetch work logs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createWorkLogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await db.insert(workLogs).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/work-logs error:", error);
    return NextResponse.json({ error: "Failed to create work log" }, { status: 500 });
  }
}
