import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generatedReports, reportTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const templateId = searchParams.get("templateId");

    const query = templateId
      ? db
          .select({
            id: generatedReports.id,
            templateId: generatedReports.templateId,
            templateName: reportTemplates.name,
            format: generatedReports.format,
            fileUrl: generatedReports.fileUrl,
            parameters: generatedReports.parameters,
            generatedAt: generatedReports.generatedAt,
          })
          .from(generatedReports)
          .leftJoin(
            reportTemplates,
            eq(generatedReports.templateId, reportTemplates.id)
          )
          .where(eq(generatedReports.templateId, templateId))
          .orderBy(desc(generatedReports.generatedAt))
      : db
          .select({
            id: generatedReports.id,
            templateId: generatedReports.templateId,
            templateName: reportTemplates.name,
            format: generatedReports.format,
            fileUrl: generatedReports.fileUrl,
            parameters: generatedReports.parameters,
            generatedAt: generatedReports.generatedAt,
          })
          .from(generatedReports)
          .leftJoin(
            reportTemplates,
            eq(generatedReports.templateId, reportTemplates.id)
          )
          .orderBy(desc(generatedReports.generatedAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/reports/history error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report history" },
      { status: 500 }
    );
  }
}
