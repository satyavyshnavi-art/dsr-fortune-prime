import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { powerReadings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(powerReadings).where(eq(powerReadings.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Power reading not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/power-readings/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch power reading" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(powerReadings).set(body).where(eq(powerReadings.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Power reading not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/power-readings/[id] error:", error);
    return NextResponse.json({ error: "Failed to update power reading" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(powerReadings).where(eq(powerReadings.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Power reading not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Power reading deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/power-readings/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete power reading" }, { status: 500 });
  }
}
