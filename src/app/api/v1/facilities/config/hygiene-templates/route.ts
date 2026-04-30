import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hygieneTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    const query = facilityId
      ? db
          .select()
          .from(hygieneTemplates)
          .where(eq(hygieneTemplates.facilityId, facilityId))
      : db.select().from(hygieneTemplates);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "GET /api/v1/facilities/config/hygiene-templates error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to fetch hygiene templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db
      .insert(hygieneTemplates)
      .values(body)
      .returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error(
      "POST /api/v1/facilities/config/hygiene-templates error:",
      error
    );
    return NextResponse.json(
      { error: "Failed to create hygiene template" },
      { status: 500 }
    );
  }
}
