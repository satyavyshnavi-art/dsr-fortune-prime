import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints } from "@/db/schema";
import { eq, and, desc, type SQL } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";
import { cached, invalidate } from "@/lib/redis";

const createComplaintSchema = z.object({
  facilityId: z.string().uuid(),
  ticketId: z.string().max(20).optional(),
  title: z.string().min(1).max(255).transform(sanitizeInput),
  description: z.string().max(5000).transform(sanitizeInput).optional(),
  department: z.string().max(100).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  assignedTo: z.string().max(255).optional(),
  createdBy: z.string().max(255).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "open"
      | "in_progress"
      | "resolved"
      | "closed"
      | null;

    const conditions: SQL[] = [];
    if (facilityId) conditions.push(eq(complaints.facilityId, facilityId));
    if (status) conditions.push(eq(complaints.status, status));

    const cacheKey = `complaints:${facilityId ?? "all"}:${status ?? "all"}`;
    const result = await cached(cacheKey, 90, () =>
      conditions.length > 0
        ? db.select().from(complaints).where(and(...conditions)).orderBy(desc(complaints.createdAt))
        : db.select().from(complaints).orderBy(desc(complaints.createdAt))
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/complaints error:", error);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createComplaintSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(complaints).values(parsed.data).returning();
    invalidate("complaints:*", "dashboard:*").catch(() => {});
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/complaints error:", error);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}
