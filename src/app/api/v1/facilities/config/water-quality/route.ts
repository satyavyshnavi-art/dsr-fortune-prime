import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waterQualityConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    const query = facilityId
      ? db
          .select()
          .from(waterQualityConfigs)
          .where(eq(waterQualityConfigs.facilityId, facilityId))
      : db.select().from(waterQualityConfigs);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/facilities/config/water-quality error:", error);
    return NextResponse.json(
      { error: "Failed to fetch water quality configs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db
      .insert(waterQualityConfigs)
      .values(body)
      .returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/facilities/config/water-quality error:", error);
    return NextResponse.json(
      { error: "Failed to create water quality config" },
      { status: 500 }
    );
  }
}
