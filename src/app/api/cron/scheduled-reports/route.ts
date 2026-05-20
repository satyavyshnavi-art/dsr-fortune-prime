import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  scheduledReports,
  reportTemplates,
  generatedReports,
} from "@/db/schema";
import { eq, lte, sql } from "drizzle-orm";
import { generateReport } from "@/lib/report-generator";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

function computeNextRunAt(frequency: string | null, from: Date): Date {
  const next = new Date(from);
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      next.setDate(next.getDate() + 1);
  }
  return next;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();

    // Find scheduled reports where nextRunAt <= now
    const dueSchedules = await db
      .select({
        scheduleId: scheduledReports.id,
        templateId: scheduledReports.templateId,
        frequency: scheduledReports.frequency,
        templateName: reportTemplates.name,
        module: reportTemplates.module,
        fieldSelection: reportTemplates.fieldSelection,
        filters: reportTemplates.filters,
      })
      .from(scheduledReports)
      .innerJoin(
        reportTemplates,
        eq(scheduledReports.templateId, reportTemplates.id)
      )
      .where(lte(scheduledReports.nextRunAt, now));

    let reportsGenerated = 0;

    for (const schedule of dueSchedules) {
      if (!schedule.module) continue;

      const fields = Array.isArray(schedule.fieldSelection)
        ? (schedule.fieldSelection as string[])
        : [];
      const filters = Array.isArray(schedule.filters)
        ? (schedule.filters as any[])
        : undefined;

      try {
        const { buffer, filename } = await generateReport(
          schedule.module,
          fields,
          filters,
          "xlsx"
        );

        // Save file
        const reportsDir = path.join(process.cwd(), "public", "reports");
        await mkdir(reportsDir, { recursive: true });
        await writeFile(path.join(reportsDir, filename), buffer);

        const fileUrl = `/reports/${filename}`;

        // Store in generated_reports
        await db.insert(generatedReports).values({
          templateId: schedule.templateId,
          format: "xlsx",
          fileUrl,
          parameters: { module: schedule.module, fields, filters },
          generatedAt: now,
        });

        // Update nextRunAt
        const nextRun = computeNextRunAt(schedule.frequency, now);
        await db
          .update(scheduledReports)
          .set({ nextRunAt: nextRun })
          .where(eq(scheduledReports.id, schedule.scheduleId));

        reportsGenerated++;
      } catch (err) {
        console.error(
          `Failed to generate scheduled report ${schedule.scheduleId}:`,
          err
        );
      }
    }

    return NextResponse.json({
      success: true,
      dueSchedules: dueSchedules.length,
      reportsGenerated,
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error("CRON /api/cron/scheduled-reports error:", error);
    return NextResponse.json(
      { error: "Scheduled reports cron failed" },
      { status: 500 }
    );
  }
}
