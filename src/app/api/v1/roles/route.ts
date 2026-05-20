import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { roles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId");

    const query = orgId
      ? db.select().from(roles).where(eq(roles.orgId, orgId)).orderBy(desc(roles.createdAt))
      : db.select().from(roles).orderBy(desc(roles.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/roles error:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db
      .insert(roles)
      .values({
        orgId: body.orgId,
        name: body.name,
        permissions: body.permissions || null,
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/roles error:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}
