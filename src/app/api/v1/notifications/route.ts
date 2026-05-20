import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get("user_id");
    const status = searchParams.get("status"); // "read" | "unread"
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (userId) conditions.push(eq(notifications.userId, userId));
    if (status === "read") conditions.push(isNotNull(notifications.readAt));
    if (status === "unread") conditions.push(isNull(notifications.readAt));

    let query = db.select().from(notifications);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: result,
      meta: { total: result.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/notifications error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch notifications" } },
      { status: 500 }
    );
  }
}
