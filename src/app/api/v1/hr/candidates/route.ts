import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { candidates } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createCandidateSchema = z.object({
  requirementId: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  resumeUrl: z.string().optional(),
  status: z.enum(["applied", "interviewed", "offered", "joined", "rejected"]).default("applied"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const requirementId = searchParams.get("requirement_id");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (requirementId) conditions.push(eq(candidates.requirementId, requirementId));
    if (status) conditions.push(eq(candidates.status, status as any));

    let query = db.select().from(candidates);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(candidates.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: result,
      meta: { total: result.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/hr/candidates error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch candidates" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCandidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(candidates).values(parsed.data as any).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/hr/candidates error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create candidate" } },
      { status: 500 }
    );
  }
}
