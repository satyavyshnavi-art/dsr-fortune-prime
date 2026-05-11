import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles, appAuditLogs } from "@/db/schema";
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

    // Only allow updating specific fields
    const updateData: Record<string, unknown> = {};
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.status !== undefined) updateData.status = body.status;

    const result = await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log the action
    await db.insert(appAuditLogs).values({
      auth0UserId: "system",
      action: body.role !== undefined ? "change_role" : "update_user",
      entityType: "user",
      entityId: id,
      details: updateData,
    });

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

    // Get user info before deleting for audit log
    const [user] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, id));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await db.delete(userProfiles).where(eq(userProfiles.id, id));

    // Log the action
    await db.insert(appAuditLogs).values({
      auth0UserId: "system",
      action: "delete_user",
      entityType: "user",
      entityId: id,
      details: { displayName: user.displayName, email: user.email },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/users/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
