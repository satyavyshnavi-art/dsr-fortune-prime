import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendorTickets } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "open"
      | "in_progress"
      | "resolved"
      | "closed"
      | null;

    const conditions = [];
    if (facilityId) conditions.push(eq(vendorTickets.facilityId, facilityId));
    if (status) conditions.push(eq(vendorTickets.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(vendorTickets).where(and(...conditions)).orderBy(desc(vendorTickets.createdAt))
        : db.select().from(vendorTickets).orderBy(desc(vendorTickets.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/vendor-tickets error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor tickets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(vendorTickets).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/vendor-tickets error:", error);
    return NextResponse.json({ error: "Failed to create vendor ticket" }, { status: 500 });
  }
}
