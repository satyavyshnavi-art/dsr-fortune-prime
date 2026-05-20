import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { rolePermissions, permissions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .select({
        id: permissions.id,
        module: permissions.module,
        action: permissions.action,
        description: permissions.description,
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(permissions.id, rolePermissions.permissionId))
      .where(eq(rolePermissions.roleId, id));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/roles/[id]/permissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch role permissions" },
      { status: 500 }
    );
  }
}
