import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reportTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const orgId = searchParams.get("orgId");

    const query = orgId
      ? db
          .select()
          .from(reportTemplates)
          .where(eq(reportTemplates.orgId, orgId))
          .orderBy(desc(reportTemplates.createdAt))
      : db
          .select()
          .from(reportTemplates)
          .orderBy(desc(reportTemplates.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/reports/templates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report templates" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId, name, module, fieldSelection, filters, createdBy } = body;

    if (!orgId || !name || !module) {
      return NextResponse.json(
        { error: "orgId, name, and module are required" },
        { status: 400 }
      );
    }

    const [result] = await db
      .insert(reportTemplates)
      .values({
        orgId,
        name,
        module,
        fieldSelection,
        filters,
        createdBy,
      })
      .returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/reports/templates error:", error);
    return NextResponse.json(
      { error: "Failed to create report template" },
      { status: 500 }
    );
  }
}
