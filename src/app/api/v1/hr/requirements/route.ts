import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { jobRequirements } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createJobRequirementSchema = z.object({
  orgId: z.string().uuid(),
  facilityId: z.string().uuid(),
  title: z.string().min(1),
  department: z.string().optional(),
  positionsNeeded: z.number().int().min(1).default(1),
  status: z.enum(["open", "filled", "cancelled"]).default("open"),
  createdBy: z.string().uuid().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facility_id");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (facilityId) conditions.push(eq(jobRequirements.facilityId, facilityId));
    if (status) conditions.push(eq(jobRequirements.status, status));

    let query = db.select().from(jobRequirements);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(jobRequirements.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: result,
      meta: { total: result.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/hr/requirements error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch job requirements" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createJobRequirementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(jobRequirements).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/hr/requirements error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create job requirement" } },
      { status: 500 }
    );
  }
}
