import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { powerReadings } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const conditions = [];
    if (facilityId) conditions.push(eq(powerReadings.facilityId, facilityId));
    if (dateFrom) conditions.push(gte(powerReadings.date, dateFrom));
    if (dateTo) conditions.push(lte(powerReadings.date, dateTo));

    const query =
      conditions.length > 0
        ? db.select().from(powerReadings).where(and(...conditions)).orderBy(desc(powerReadings.createdAt))
        : db.select().from(powerReadings).orderBy(desc(powerReadings.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/power-readings error:", error);
    return NextResponse.json({ error: "Failed to fetch power readings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(powerReadings).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/power-readings error:", error);
    return NextResponse.json({ error: "Failed to save power reading" }, { status: 500 });
  }
}
