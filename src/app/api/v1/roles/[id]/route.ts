import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db
      .update(roles)
      .set(body)
      .where(eq(roles.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PATCH /api/v1/roles/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}
