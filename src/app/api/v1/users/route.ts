import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/db/schema";

export async function GET() {
  try {
    const result = await db.select().from(userProfiles);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await db.insert(userProfiles).values(body).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/users error:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
