import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goalEvaluations, employeeGoals } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const evaluateGoalSchema = z.object({
  evaluatorId: z.string().uuid().optional(),
  evaluatorRole: z.string().optional(),
  score: z.number().int().min(1).max(5),
  comments: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = evaluateGoalSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    // Verify goal exists
    const goals = await db
      .select()
      .from(employeeGoals)
      .where(eq(employeeGoals.id, id));

    if (goals.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Employee goal not found" } },
        { status: 404 }
      );
    }

    const { evaluatorId, evaluatorRole, score, comments } = parsed.data;

    // Create evaluation
    const evaluation = await db
      .insert(goalEvaluations)
      .values({
        goalId: id,
        evaluatorId,
        evaluatorRole,
        score,
        comments,
      })
      .returning();

    return NextResponse.json({ data: evaluation[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/hr/goals/[id]/evaluate error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to submit evaluation" } },
      { status: 500 }
    );
  }
}
