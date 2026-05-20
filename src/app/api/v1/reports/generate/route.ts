import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatedReports, reportTemplates } from "@/db/schema";
import { generateReport } from "@/lib/report-generator";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module, fields, filters, format, templateId } = body;

    if (!module || !fields || !format) {
      return NextResponse.json(
        { error: "module, fields, and format are required" },
        { status: 400 }
      );
    }

    if (!["pdf", "xlsx", "csv"].includes(format)) {
      return NextResponse.json(
        { error: "format must be pdf, xlsx, or csv" },
        { status: 400 }
      );
    }

    const { buffer, filename, contentType } = await generateReport(
      module,
      fields,
      filters,
      format
    );

    // Save file to public/reports/
    const reportsDir = path.join(process.cwd(), "public", "reports");
    await mkdir(reportsDir, { recursive: true });
    const filePath = path.join(reportsDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/reports/${filename}`;

    // Store in generated_reports table (requires a templateId)
    let reportRecord = null;
    if (templateId) {
      const [record] = await db
        .insert(generatedReports)
        .values({
          templateId,
          format,
          fileUrl,
          parameters: { module, fields, filters },
          generatedAt: new Date(),
        })
        .returning();
      reportRecord = record;
    }

    return NextResponse.json({
      data: {
        fileUrl,
        format,
        generatedAt: new Date().toISOString(),
        reportId: reportRecord?.id ?? null,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/reports/generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
