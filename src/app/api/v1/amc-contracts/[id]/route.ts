import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { amcContracts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(amcContracts).where(eq(amcContracts.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "AMC contract not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/amc-contracts/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch AMC contract" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(amcContracts).set(body).where(eq(amcContracts.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "AMC contract not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/amc-contracts/[id] error:", error);
    return NextResponse.json({ error: "Failed to update AMC contract" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(amcContracts).where(eq(amcContracts.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "AMC contract not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "AMC contract deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/amc-contracts/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete AMC contract" }, { status: 500 });
  }
}
