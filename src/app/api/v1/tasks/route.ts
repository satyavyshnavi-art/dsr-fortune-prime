import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "pending"
      | "unassigned"
      | "in_progress"
      | "completed"
      | "cancelled"
      | null;

    const conditions = [];
    if (facilityId) conditions.push(eq(tasks.facilityId, facilityId));
    if (status) conditions.push(eq(tasks.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(tasks).where(and(...conditions)).orderBy(desc(tasks.createdAt))
        : db.select().from(tasks).orderBy(desc(tasks.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(tasks).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
