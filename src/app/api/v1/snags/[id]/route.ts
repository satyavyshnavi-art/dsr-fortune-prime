import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { snagItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod/v4";

const updateSnagSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
  resolvedAt: z.string().optional(),
  description: z.string().optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSnagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.severity !== undefined) updateData.severity = parsed.data.severity;
    if (parsed.data.resolvedAt !== undefined) updateData.resolvedAt = new Date(parsed.data.resolvedAt);

    const result = await db
      .update(snagItems)
      .set(updateData)
      .where(eq(snagItems.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Snag item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("PATCH /api/v1/snags/[id] error:", error);
    return NextResponse.json({ error: "Failed to update snag item" }, { status: 500 });
  }
}
