import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { snagItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod/v4";

const createSnagSchema = z.object({
  facilityId: z.string().uuid(),
  location: z.string().max(255).optional(),
  description: z.string().optional(),
  photoUrls: z.array(z.string()).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  reportedBy: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status");

    const conditions = [];
    if (facilityId) conditions.push(eq(snagItems.facilityId, facilityId));
    if (status) conditions.push(eq(snagItems.status, status as "open" | "in_progress" | "resolved" | "closed"));

    const query =
      conditions.length > 0
        ? db.select().from(snagItems).where(and(...conditions)).orderBy(desc(snagItems.createdAt))
        : db.select().from(snagItems).orderBy(desc(snagItems.createdAt));

    const result = await query;
    return NextResponse.json({ data: result, meta: { total: result.length } });
  } catch (error) {
    console.error("GET /api/v1/snags error:", error);
    return NextResponse.json({ error: "Failed to fetch snag items" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createSnagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await db.insert(snagItems).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/snags error:", error);
    return NextResponse.json({ error: "Failed to create snag item" }, { status: 500 });
  }
}
