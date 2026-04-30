import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasks } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("GET /api/v1/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = await db.update(tasks).set(body).where(eq(tasks.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("PUT /api/v1/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    if (result.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Task deleted" });
  } catch (error) {
    console.error("DELETE /api/v1/tasks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
