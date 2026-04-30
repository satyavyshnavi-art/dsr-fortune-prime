import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(employees).where(eq(employees.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/employees/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch employee" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(employees).set(body).where(eq(employees.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/employees/[id] error:", error);
    return NextResponse.json({ error: "Failed to update employee" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(employees).where(eq(employees.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Employee deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/employees/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete employee" }, { status: 500 });
  }
}
