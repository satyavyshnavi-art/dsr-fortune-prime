import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scheduledReports } from "@/db/schema";
import { desc } from "drizzle-orm";

function computeNextRunAt(frequency: string): Date {
  const now = new Date();
  switch (frequency) {
    case "daily":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "weekly":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "monthly": {
      const next = new Date(now);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
    default:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export async function GET() {
  try {
    const result = await db
      .select()
      .from(scheduledReports)
      .orderBy(desc(scheduledReports.nextRunAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/reports/schedule error:", error);
    return NextResponse.json(
      { error: "Failed to fetch scheduled reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId, frequency, recipients } = body;

    if (!templateId || !frequency) {
      return NextResponse.json(
        { error: "templateId and frequency are required" },
        { status: 400 }
      );
    }

    const nextRunAt = computeNextRunAt(frequency);

    const [result] = await db
      .insert(scheduledReports)
      .values({
        templateId,
        frequency,
        recipients,
        nextRunAt,
      })
      .returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/reports/schedule error:", error);
    return NextResponse.json(
      { error: "Failed to schedule report" },
      { status: 500 }
    );
  }
}
