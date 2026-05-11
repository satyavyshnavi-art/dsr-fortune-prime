import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { serviceProviders } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Service provider not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/service-providers/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch service provider" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db
      .update(serviceProviders)
      .set({
        name: body.name,
        contact: body.contact,
        email: body.email,
        categories: body.categories,
      })
      .where(eq(serviceProviders.id, id))
      .returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Service provider not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/service-providers/[id] error:", error);
    return NextResponse.json({ error: "Failed to update service provider" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(serviceProviders).where(eq(serviceProviders.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Service provider not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/v1/service-providers/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete service provider" }, { status: 500 });
  }
}
