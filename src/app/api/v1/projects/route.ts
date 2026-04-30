import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "planning"
      | "on_hold"
      | "in_progress"
      | "completed"
      | null;

    const conditions = [];
    if (facilityId) conditions.push(eq(projects.facilityId, facilityId));
    if (status) conditions.push(eq(projects.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(projects).where(and(...conditions)).orderBy(desc(projects.createdAt))
        : db.select().from(projects).orderBy(desc(projects.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(projects).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/projects error:", error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
