import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { breakdownRecords } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const assetId = searchParams.get("assetId");
    const status = searchParams.get("status") as
      | "open"
      | "in_progress"
      | "resolved"
      | "closed"
      | null;

    const conditions = [];
    if (assetId) conditions.push(eq(breakdownRecords.assetId, assetId));
    if (status) conditions.push(eq(breakdownRecords.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(breakdownRecords).where(and(...conditions)).orderBy(desc(breakdownRecords.createdAt))
        : db.select().from(breakdownRecords).orderBy(desc(breakdownRecords.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/breakdown error:", error);
    return NextResponse.json({ error: "Failed to fetch breakdown records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(breakdownRecords).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/breakdown error:", error);
    return NextResponse.json({ error: "Failed to create breakdown record" }, { status: 500 });
  }
}
