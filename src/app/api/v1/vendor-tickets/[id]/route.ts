import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendorTickets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(vendorTickets).where(eq(vendorTickets.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Vendor ticket not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/vendor-tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch vendor ticket" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(vendorTickets).set(body).where(eq(vendorTickets.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Vendor ticket not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/vendor-tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to update vendor ticket" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(vendorTickets).where(eq(vendorTickets.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Vendor ticket not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Vendor ticket deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/vendor-tickets/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete vendor ticket" }, { status: 500 });
  }
}
