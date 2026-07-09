import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { alerts } from "@/db/schema";
import { eq, and, desc, type SQL } from "drizzle-orm";
import { cached, invalidate } from "@/lib/redis";

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

    const conditions: SQL[] = [];
    if (facilityId) conditions.push(eq(alerts.facilityId, facilityId));
    if (status) conditions.push(eq(alerts.status, status));
    if (category) conditions.push(eq(alerts.category, category));

    const cacheKey = `alerts:${facilityId ?? "all"}:${status ?? "all"}:${category ?? "all"}`;
    const result = await cached(cacheKey, 60, () =>
      conditions.length > 0
        ? db.select().from(alerts).where(and(...conditions)).orderBy(desc(alerts.createdAt))
        : db.select().from(alerts).orderBy(desc(alerts.createdAt))
    );
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
    const created = result[0];
    invalidate("alerts:*", "dashboard:*").catch(() => {});

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/alerts error:", error);
    return NextResponse.json({ error: "Failed to create alert" }, { status: 500 });
  }
}
