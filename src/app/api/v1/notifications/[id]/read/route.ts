import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .update(notifications)
      .set({ readAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Notification not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("PATCH /api/v1/notifications/[id]/read error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to mark notification as read" } },
      { status: 500 }
    );
  }
}
