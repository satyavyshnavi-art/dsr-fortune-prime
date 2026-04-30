import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, id));

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
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
    const result = await db
      .update(userProfiles)
      .set(body)
      .where(eq(userProfiles.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
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
      .delete(userProfiles)
      .where(eq(userProfiles.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
