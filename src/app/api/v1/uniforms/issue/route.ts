import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uniformIssues } from "@/db/schema";
import { z } from "zod";

const issueUniformSchema = z.object({
  employeeId: z.string().uuid(),
  itemId: z.string().uuid(),
  qty: z.number().int().min(1).default(1),
  issueDate: z.string().optional(),
  deductionAmount: z.string().optional(),
  deductedFromMonth: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = issueUniformSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(uniformIssues).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/uniforms/issue error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to issue uniform" } },
      { status: 500 }
    );
  }
}
