import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { files } from "@/db/schema";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";
import { sanitizeFilename } from "@/lib/sanitize";

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "xlsx", "csv", "docx"]);
const ALLOWED_MIME_PREFIXES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const orgId = formData.get("org_id") as string | null;
    const entityType = formData.get("entity_type") as string | null;
    const entityId = formData.get("entity_id") as string | null;
    const uploadedBy = formData.get("uploaded_by") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "No file provided" } },
        { status: 400 }
      );
    }

    if (!orgId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "org_id is required" } },
        { status: 400 }
      );
    }

    // --- File size validation ---
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "File size exceeds 10 MB limit" } },
        { status: 400 }
      );
    }

    // --- File type validation ---
    const sanitizedName = sanitizeFilename(file.name);
    const ext = sanitizedName.split(".").pop()?.toLowerCase() || "";

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: `File type .${ext} is not allowed. Allowed: ${[...ALLOWED_EXTENSIONS].join(", ")}` } },
        { status: 400 }
      );
    }

    const mimeAllowed = ALLOWED_MIME_PREFIXES.some(
      (prefix) => file.type === prefix
    );
    if (file.type && !mimeAllowed) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: `MIME type ${file.type} is not allowed` } },
        { status: 400 }
      );
    }

    // Generate unique filename (never use user-supplied name in path)
    const uniqueName = `${randomUUID()}.${ext}`;
    const uploadDir = join(process.cwd(), "public", "uploads");

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, Buffer.from(bytes));

    const fileUrl = `/uploads/${uniqueName}`;

    // Store reference in database
    const result = await db
      .insert(files)
      .values({
        orgId,
        entityType,
        entityId,
        fileUrl,
        fileType: ext,
        uploadedBy,
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/files/upload error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}
