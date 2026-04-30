import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gatePasses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "out"
      | "returned"
      | "approved"
      | "pending"
      | null;

    const conditions = [];
    if (facilityId) conditions.push(eq(gatePasses.facilityId, facilityId));
    if (status) conditions.push(eq(gatePasses.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(gatePasses).where(and(...conditions)).orderBy(desc(gatePasses.createdAt))
        : db.select().from(gatePasses).orderBy(desc(gatePasses.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/gate-passes error:", error);
    return NextResponse.json({ error: "Failed to fetch gate passes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(gatePasses).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/gate-passes error:", error);
    return NextResponse.json({ error: "Failed to create gate pass" }, { status: 500 });
  }
}
