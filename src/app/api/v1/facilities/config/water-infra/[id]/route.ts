import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { waterInfraConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db
      .update(waterInfraConfigs)
      .set(body)
      .where(eq(waterInfraConfigs.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Water infra config not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error(
      "PUT /api/v1/facilities/config/water-infra/[id] error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to update water infra config" },
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
      .delete(waterInfraConfigs)
      .where(eq(waterInfraConfigs.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Water infra config not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ message: "Water infra config deleted" });
  } catch (error) {
    console.error(
      "DELETE /api/v1/facilities/config/water-infra/[id] error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to delete water infra config" },
      { status: 500 }
    );
  }
}
