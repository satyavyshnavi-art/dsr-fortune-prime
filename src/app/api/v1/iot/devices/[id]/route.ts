import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { iotDevices } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const [result] = await db
      .update(iotDevices)
      .set(body)
      .where(eq(iotDevices.id, id))
      .returning();

    if (!result) {
      return NextResponse.json(
        { error: "IoT device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/v1/iot/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update IoT device" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [result] = await db
      .delete(iotDevices)
      .where(eq(iotDevices.id, id))
      .returning();

    if (!result) {
      return NextResponse.json(
        { error: "IoT device not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/iot/devices/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete IoT device" },
      { status: 500 }
    );
  }
}
