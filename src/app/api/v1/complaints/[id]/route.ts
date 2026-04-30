import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { complaints } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(complaints).where(eq(complaints.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/complaints/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(complaints).set(body).where(eq(complaints.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/complaints/[id] error:", error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(complaints).where(eq(complaints.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Complaint deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/complaints/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete complaint" }, { status: 500 });
  }
}
