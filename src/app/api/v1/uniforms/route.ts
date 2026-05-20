import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uniformIssues } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get("employee_id");
    const itemId = searchParams.get("item_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (employeeId) conditions.push(eq(uniformIssues.employeeId, employeeId));
    if (itemId) conditions.push(eq(uniformIssues.itemId, itemId));

    let query = db.select().from(uniformIssues);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query.limit(limit).offset(offset);

    return NextResponse.json({
      data: result,
      meta: { total: result.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/uniforms error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch uniform issues" } },
      { status: 500 }
    );
  }
}
