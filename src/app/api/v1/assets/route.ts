import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const categoryId = searchParams.get("categoryId");

    const conditions = [];
    if (facilityId) conditions.push(eq(assets.facilityId, facilityId));
    if (categoryId) conditions.push(eq(assets.categoryId, categoryId));

    const query =
      conditions.length > 0
        ? db.select().from(assets).where(and(...conditions))
        : db.select().from(assets);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/assets error:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(assets).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/assets error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
