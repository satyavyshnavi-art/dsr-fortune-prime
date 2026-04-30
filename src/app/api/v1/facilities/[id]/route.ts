import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { facilities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(facilities)
      .where(eq(facilities.id, id));
    if (result.length === 0) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/facilities/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch facility" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.city !== undefined) updateData.city = body.city;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.clientName !== undefined) updateData.clientName = body.clientName;
    if (body.contactNumber !== undefined)
      updateData.contactNumber = body.contactNumber;
    if (body.email !== undefined) updateData.email = body.email;

    const result = await db
      .update(facilities)
      .set(updateData)
      .where(eq(facilities.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/facilities/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update facility" },
      { status: 500 }
    );
  }
}
