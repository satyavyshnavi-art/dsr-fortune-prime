import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceRecords } from "@/db/schema";
import { eq, and, gte, lte, type SQL } from "drizzle-orm";
import { cached, invalidate } from "@/lib/redis";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get("employeeId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const conditions: SQL[] = [];
    if (employeeId) conditions.push(eq(attendanceRecords.employeeId, employeeId));
    if (dateFrom) conditions.push(gte(attendanceRecords.date, dateFrom));
    if (dateTo) conditions.push(lte(attendanceRecords.date, dateTo));

    const cacheKey = `attendance:${employeeId ?? "all"}:${dateFrom ?? ""}:${dateTo ?? ""}`;
    const result = await cached(cacheKey, 60, () =>
      conditions.length > 0
        ? db.select().from(attendanceRecords).where(and(...conditions))
        : db.select().from(attendanceRecords)
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/attendance error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(attendanceRecords).values(body).returning();
    invalidate("attendance:*", "dashboard:*").catch(() => {});
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/attendance error:", error);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
