import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

const createInventoryItemSchema = z.object({
  facilityId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().optional(),
  unit: z.string().optional(),
  currentQty: z.number().int().min(0).default(0),
  minReorderLevel: z.number().int().min(0).default(0),
  maxQty: z.number().int().min(0).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facility_id");
    const category = searchParams.get("category");
    const reorderAlert = searchParams.get("reorder_alert");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (facilityId) conditions.push(eq(inventoryItems.facilityId, facilityId));
    if (category) conditions.push(eq(inventoryItems.category, category));

    let query = db.select().from(inventoryItems);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(inventoryItems.createdAt))
      .limit(limit)
      .offset(offset);

    const data = reorderAlert === "true"
      ? result.filter(
          (item) =>
            item.currentQty !== null &&
            item.minReorderLevel !== null &&
            item.currentQty <= item.minReorderLevel
        )
      : result;

    return NextResponse.json({
      data,
      meta: { total: data.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/inventory error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch inventory items" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createInventoryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(inventoryItems).values(parsed.data).returning();
    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/inventory error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create inventory item" } },
      { status: 500 }
    );
  }
}
