import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waterReadings } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const conditions = [];
    if (facilityId) conditions.push(eq(waterReadings.facilityId, facilityId));
    if (dateFrom) conditions.push(gte(waterReadings.date, dateFrom));
    if (dateTo) conditions.push(lte(waterReadings.date, dateTo));

    const query =
      conditions.length > 0
        ? db.select().from(waterReadings).where(and(...conditions)).orderBy(desc(waterReadings.createdAt))
        : db.select().from(waterReadings).orderBy(desc(waterReadings.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/water-readings error:", error);
    return NextResponse.json({ error: "Failed to fetch water readings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(waterReadings).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/water-readings error:", error);
    return NextResponse.json({ error: "Failed to save water reading" }, { status: 500 });
  }
}
