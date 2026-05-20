import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { breakdownRecords } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const createBreakdownSchema = z.object({
  assetId: z.string().uuid(),
  reportedDate: z.string(),
  description: z.string().max(5000).transform(sanitizeInput).optional(),
  serviceProvider: z.string().max(255).optional(),
  cost: z.string().optional(),
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  completedDate: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const assetId = searchParams.get("assetId");
    const status = searchParams.get("status") as
      | "open"
      | "in_progress"
      | "resolved"
      | "closed"
      | null;

    const conditions = [];
    if (assetId) conditions.push(eq(breakdownRecords.assetId, assetId));
    if (status) conditions.push(eq(breakdownRecords.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(breakdownRecords).where(and(...conditions)).orderBy(desc(breakdownRecords.createdAt))
        : db.select().from(breakdownRecords).orderBy(desc(breakdownRecords.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/breakdown error:", error);
    return NextResponse.json({ error: "Failed to fetch breakdown records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createBreakdownSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(breakdownRecords).values(parsed.data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/breakdown error:", error);
    return NextResponse.json({ error: "Failed to create breakdown record" }, { status: 500 });
  }
}
