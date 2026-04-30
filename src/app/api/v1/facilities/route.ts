import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facilities, energyMeterConfigs, waterInfraConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    if (facilityId) {
      // Return single facility with its configs
      const [facility] = await db
        .select()
        .from(facilities)
        .where(eq(facilities.id, facilityId));

      if (!facility) {
        return NextResponse.json({ error: "Facility not found" }, { status: 404 });
      }

      const meters = await db
        .select()
        .from(energyMeterConfigs)
        .where(eq(energyMeterConfigs.facilityId, facilityId));

      const waterInfra = await db
        .select()
        .from(waterInfraConfigs)
        .where(eq(waterInfraConfigs.facilityId, facilityId));

      return NextResponse.json({
        ...facility,
        energyMeters: meters,
        waterInfra,
      });
    }

    // Return all facilities
    const result = await db.select().from(facilities);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/facilities error:", error);
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 });
  }
}
