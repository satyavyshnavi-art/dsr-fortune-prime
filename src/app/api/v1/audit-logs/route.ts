import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appAuditLogs } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(appAuditLogs)
      .orderBy(desc(appAuditLogs.timestamp))
      .limit(100);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/audit-logs error:", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}
