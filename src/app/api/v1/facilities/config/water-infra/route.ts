import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waterInfraConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    const query = facilityId
      ? db
          .select()
          .from(waterInfraConfigs)
          .where(eq(waterInfraConfigs.facilityId, facilityId))
      : db.select().from(waterInfraConfigs);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/facilities/config/water-infra error:", error);
    return NextResponse.json(
      { error: "Failed to fetch water infra configs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db
      .insert(waterInfraConfigs)
      .values(body)
      .returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/facilities/config/water-infra error:", error);
    return NextResponse.json(
      { error: "Failed to create water infra config" },
      { status: 500 }
    );
  }
}
