import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { assets } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const createAssetSchema = z.object({
  facilityId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(1).max(255).transform(sanitizeInput),
  assetTag: z.string().max(100).optional(),
  location: z.string().max(255).optional(),
  status: z.enum(["active", "maintenance", "inactive"]).optional(),
  maintenanceFrequency: z.enum(["daily", "weekly", "monthly", "quarterly", "half_yearly", "yearly"]).optional(),
  lastChecked: z.string().optional(),
  serviceHistory: z.string().max(5000).transform(sanitizeInput).optional(),
  qrCodeData: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");
    const categoryId = searchParams.get("categoryId");

    const conditions = [];
    if (facilityId) conditions.push(eq(assets.facilityId, facilityId));
    if (categoryId) conditions.push(eq(assets.categoryId, categoryId));

    const query =
      conditions.length > 0
        ? db.select().from(assets).where(and(...conditions))
        : db.select().from(assets);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/assets error:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createAssetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(assets).values(parsed.data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/assets error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
