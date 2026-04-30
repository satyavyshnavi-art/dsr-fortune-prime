import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(assets).where(eq(assets.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/assets/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(assets).set(body).where(eq(assets.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/assets/[id] error:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(assets).where(eq(assets.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Asset deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/assets/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
