import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const updateTemplateSchema = z.object({
  title: z.string().min(1).max(255).transform(sanitizeInput).optional(),
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateTemplateSchema.safeParse(body);

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
      .update(taskTemplates)
      .set(parsed.data)
      .where(eq(taskTemplates.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/task-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update task template" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(taskTemplates)
      .where(eq(taskTemplates.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Task template deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/task-templates/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete task template" },
      { status: 500 }
    );
  }
}
