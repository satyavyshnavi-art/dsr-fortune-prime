import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { alerts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "unacknowledged"
      | "acknowledged"
      | "dismissed"
      | "resolved"
      | null;
    const category = searchParams.get("category");

    const conditions = [];
    if (facilityId) conditions.push(eq(alerts.facilityId, facilityId));
    if (status) conditions.push(eq(alerts.status, status));
    if (category) conditions.push(eq(alerts.category, category));

    const query =
      conditions.length > 0
        ? db.select().from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt))
        : db.select().from(alerts).orderBy(desc(alerts.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/alerts error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(alerts).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/alerts error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
