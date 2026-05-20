import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { interviews } from "@/db/schema";
import { z } from "zod";

const createInterviewSchema = z.object({
  candidateId: z.string().uuid(),
  interviewerId: z.string().uuid().optional(),
  scheduledAt: z.string().optional(),
  comments: z.string().optional(),
  recommendation: z.enum(["strong_yes", "yes", "maybe", "no", "strong_no"]).optional(),
  score: z.number().int().min(0).max(100).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createInterviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const values: Record<string, unknown> = { ...parsed.data };
    if (values.scheduledAt) {
      values.scheduledAt = new Date(values.scheduledAt as string);
    }

    const result = await db.insert(interviews).values(values as any).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/hr/interviews error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to record interview" } },
      { status: 500 }
    );
  }
}
