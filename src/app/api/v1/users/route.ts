import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles, appAuditLogs, facilities } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(userProfiles)
      .orderBy(desc(userProfiles.createdAt));
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Get first facility for association
    const [facility] = await db.select().from(facilities).limit(1);

    const result = await db
      .insert(userProfiles)
      .values({
        auth0UserId: body.auth0UserId || `local|${Date.now()}`,
        displayName: body.displayName,
        email: body.email || null,
        phone: body.phone || null,
        role: body.role || "facility_manager",
        status: body.status || "active",
        facilityId: body.facilityId || facility?.id || null,
      })
      .returning();

    // Log the action
    await db.insert(appAuditLogs).values({
      auth0UserId: "system",
      action: "create_user",
      entityType: "user",
      entityId: result[0].id,
      details: { displayName: body.displayName, role: body.role || "facility_manager" },
    });

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
