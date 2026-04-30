import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints } from "@/db/schema";
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
    if (facilityId) conditions.push(eq(complaints.facilityId, facilityId));
    if (status) conditions.push(eq(complaints.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(complaints).where(and(...conditions)).orderBy(desc(complaints.createdAt))
        : db.select().from(complaints).orderBy(desc(complaints.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/complaints error:", error);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(complaints).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/complaints error:", error);
    return NextResponse.json({ error: "Failed to create complaint" }, { status: 500 });
  }
}
