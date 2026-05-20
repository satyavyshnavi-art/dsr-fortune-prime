import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { permissions } from "@/db/schema";

export async function GET() {
  try {
    const result = await db.select().from(permissions);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/permissions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}
