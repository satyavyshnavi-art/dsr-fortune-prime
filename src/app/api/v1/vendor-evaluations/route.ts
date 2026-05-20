import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendorEvaluations } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod/v4";

const createVendorEvalSchema = z.object({
  orgId: z.string().uuid(),
  vendorId: z.string().uuid(),
  facilityId: z.string().uuid(),
  period: z.string().max(50).optional(),
  scores: z.record(z.string(), z.unknown()).optional(),
  evaluatorId: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const vendorId = searchParams.get("vendorId");

    const conditions = [];
    if (facilityId) conditions.push(eq(vendorEvaluations.facilityId, facilityId));
    if (vendorId) conditions.push(eq(vendorEvaluations.vendorId, vendorId));

    const query =
      conditions.length > 0
        ? db.select().from(vendorEvaluations).where(and(...conditions)).orderBy(desc(vendorEvaluations.createdAt))
        : db.select().from(vendorEvaluations).orderBy(desc(vendorEvaluations.createdAt));

    const result = await query;
    return NextResponse.json({ data: result, meta: { total: result.length } });
  } catch (error) {
    console.error("GET /api/v1/vendor-evaluations error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor evaluations" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createVendorEvalSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const result = await db.insert(vendorEvaluations).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/vendor-evaluations error:", error);
    return NextResponse.json({ error: "Failed to create vendor evaluation" }, { status: 500 });
  }
}
