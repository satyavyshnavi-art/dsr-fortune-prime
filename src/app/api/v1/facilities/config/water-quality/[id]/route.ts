import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waterQualityConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db
      .update(waterQualityConfigs)
      .set(body)
      .where(eq(waterQualityConfigs.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Water quality config not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(
      "PUT /api/v1/facilities/config/water-quality/[id] error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to update water quality config" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .delete(waterQualityConfigs)
      .where(eq(waterQualityConfigs.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Water quality config not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Water quality config deleted" });
  } catch (error) {
    console.error(
      "DELETE /api/v1/facilities/config/water-quality/[id] error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to delete water quality config" },
      { status: 500 }
    );
  }
}
