import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskTemplates } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const createTemplateSchema = z.object({
  orgId: z.string().uuid(),
  facilityId: z.string().uuid(),
  title: z.string().min(1).max(255).transform(sanitizeInput),
  description: z.string().max(5000).transform(sanitizeInput).optional(),
  sopChecklist: z.array(z.string()).optional(),
  category: z.string().max(100).optional(),
  frequency: z
    .enum([
      "one_time",
      "daily",
      "weekly",
      "fortnightly",
      "monthly",
      "quarterly",
      "half_yearly",
      "yearly",
    ])
    .optional(),
  isExternal: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId");
    const facilityId = searchParams.get("facilityId");

    const conditions = [];
    if (orgId) conditions.push(eq(taskTemplates.orgId, orgId));
    if (facilityId) conditions.push(eq(taskTemplates.facilityId, facilityId));

    const query =
      conditions.length > 0
        ? db
            .select()
            .from(taskTemplates)
            .where(and(...conditions))
            .orderBy(desc(taskTemplates.createdAt))
        : db.select().from(taskTemplates).orderBy(desc(taskTemplates.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/task-templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch task templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createTemplateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0].message,
          },
        },
        { status: 400 }
      );
    }

    const result = await db
      .insert(taskTemplates)
      .values(parsed.data)
      .returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/task-templates error:", error);
    return NextResponse.json(
      { error: "Failed to create task template" },
      { status: 500 }
    );
  }
}
