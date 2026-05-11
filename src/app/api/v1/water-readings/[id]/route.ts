import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waterReadings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(waterReadings)
      .where(eq(waterReadings.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Water reading not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/water-readings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch water reading" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await db
      .update(waterReadings)
      .set({
        sourceName: body.sourceName,
        sourceType: body.sourceType,
        previousLiters: body.previousLiters,
        currentLiters: body.currentLiters,
        consumed: body.consumed,
        levelPercent: body.levelPercent,
        date: body.date,
      })
      .where(eq(waterReadings.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Water reading not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/water-readings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update water reading" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(waterReadings)
      .where(eq(waterReadings.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "Water reading not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/water-readings/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete water reading" }, { status: 500 });
  }
}
