import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await db
      .select()
      .from(files)
      .where(eq(files.id, id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "File not found" } },
        { status: 404 }
      );
    }

    const file = result[0];

    // Return file metadata with URL
    // In production, this would generate a signed/time-limited URL
    // For now, return the stored URL directly
    return NextResponse.json({
      data: {
        id: file.id,
        fileUrl: file.fileUrl,
        fileType: file.fileType,
        entityType: file.entityType,
        entityId: file.entityId,
        createdAt: file.createdAt,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/files/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch file" } },
      { status: 500 }
    );
  }
}
