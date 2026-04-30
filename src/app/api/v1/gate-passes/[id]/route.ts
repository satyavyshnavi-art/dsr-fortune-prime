import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gatePasses } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(gatePasses).where(eq(gatePasses.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Gate pass not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/gate-passes/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch gate pass" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(gatePasses).set(body).where(eq(gatePasses.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Gate pass not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/gate-passes/[id] error:", error);
    return NextResponse.json({ error: "Failed to update gate pass" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(gatePasses).where(eq(gatePasses.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Gate pass not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Gate pass deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/gate-passes/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete gate pass" }, { status: 500 });
  }
}
