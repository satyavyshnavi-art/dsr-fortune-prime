import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { iotThresholds } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const assetId = searchParams.get("assetId");

    const query = assetId
      ? db
          .select()
          .from(iotThresholds)
          .where(eq(iotThresholds.assetId, assetId))
          .orderBy(desc(iotThresholds.createdAt))
      : db.select().from(iotThresholds).orderBy(desc(iotThresholds.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/iot/thresholds error:", error);
    return NextResponse.json(
      { error: "Failed to fetch IoT thresholds" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assetId, metricName, minValue, maxValue, alertSeverity } = body;

    if (!assetId || !metricName) {
      return NextResponse.json(
        { error: "assetId and metricName are required" },
        { status: 400 }
      );
    }

    const [result] = await db
      .insert(iotThresholds)
      .values({
        assetId,
        metricName,
        minValue: minValue !== undefined ? String(minValue) : null,
        maxValue: maxValue !== undefined ? String(maxValue) : null,
        alertSeverity: alertSeverity ?? "medium",
      })
      .returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/iot/thresholds error:", error);
    return NextResponse.json(
      { error: "Failed to create IoT threshold" },
      { status: 500 }
    );
  }
}
