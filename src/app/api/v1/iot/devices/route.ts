import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { iotDevices } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const assetId = searchParams.get("assetId");

    const query = assetId
      ? db
          .select()
          .from(iotDevices)
          .where(eq(iotDevices.assetId, assetId))
          .orderBy(desc(iotDevices.createdAt))
      : db.select().from(iotDevices).orderBy(desc(iotDevices.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/iot/devices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch IoT devices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, deviceIp, protocol, pollIntervalSec } = body;

    if (!assetId) {
      return NextResponse.json(
        { error: "assetId is required" },
        { status: 400 }
      );
    }

    const [result] = await db
      .insert(iotDevices)
      .values({
        assetId,
        deviceIp,
        protocol: protocol ?? "mqtt",
        pollIntervalSec: pollIntervalSec ?? 60,
        status: "active",
      })
      .returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/iot/devices error:", error);
    return NextResponse.json(
      { error: "Failed to create IoT device" },
      { status: 500 }
    );
  }
}
