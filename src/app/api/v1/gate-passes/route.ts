import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gatePasses } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const createGatePassSchema = z.object({
  facilityId: z.string().uuid(),
  assetName: z.string().min(1).max(255).transform(sanitizeInput),
  assetTag: z.string().max(100).optional(),
  passType: z.string().max(100).optional(),
  status: z.enum(["out", "returned", "approved", "pending"]).optional(),
  dateOut: z.string().transform((s) => new Date(s)).optional(),
  dateIn: z.string().transform((s) => new Date(s)).optional(),
  serviceProvider: z.string().max(255).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status") as
      | "out"
      | "returned"
      | "approved"
      | "pending"
      | null;

    const conditions = [];
    if (facilityId) conditions.push(eq(gatePasses.facilityId, facilityId));
    if (status) conditions.push(eq(gatePasses.status, status));

    const query =
      conditions.length > 0
        ? db.select().from(gatePasses).where(and(...conditions)).orderBy(desc(gatePasses.createdAt))
        : db.select().from(gatePasses).orderBy(desc(gatePasses.createdAt));

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/gate-passes error:", error);
    return NextResponse.json({ error: "Failed to fetch gate passes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createGatePassSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(gatePasses).values(parsed.data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/gate-passes error:", error);
    return NextResponse.json({ error: "Failed to create gate pass" }, { status: 500 });
  }
}
