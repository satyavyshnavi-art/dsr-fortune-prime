import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { amcContracts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status");

    const conditions = [];
    if (facilityId) conditions.push(eq(amcContracts.facilityId, facilityId));
    if (status) conditions.push(eq(amcContracts.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(amcContracts).where(and(...conditions)).orderBy(desc(amcContracts.createdAt))
        : db.select().from(amcContracts).orderBy(desc(amcContracts.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/amc-contracts error:", error);
    return NextResponse.json({ error: "Failed to fetch AMC contracts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(amcContracts).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/amc-contracts error:", error);
    return NextResponse.json({ error: "Failed to create AMC contract" }, { status: 500 });
  }
}
