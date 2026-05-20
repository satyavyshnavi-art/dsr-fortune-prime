import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeeGoals } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createGoalSchema = z.object({
  userId: z.string().uuid().optional(),
  period: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  targetMetric: z.string().optional(),
  achievedMetric: z.string().optional(),
  status: z.enum(["draft", "active", "completed", "cancelled"]).default("active"),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("user_id");
    const status = searchParams.get("status");
    const period = searchParams.get("period");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (userId) conditions.push(eq(employeeGoals.userId, userId));
    if (status) conditions.push(eq(employeeGoals.status, status as any));
    if (period) conditions.push(eq(employeeGoals.period, period));

    let query = db.select().from(employeeGoals);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(employeeGoals.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: result,
      meta: { total: result.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/hr/goals error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch employee goals" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(employeeGoals).values(parsed.data as any).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/hr/goals error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create employee goal" } },
      { status: 500 }
    );
  }
}
