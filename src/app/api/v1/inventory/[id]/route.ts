import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateInventoryItemSchema = z.object({
  currentQty: z.number().int().min(0).optional(),
  minReorderLevel: z.number().int().min(0).optional(),
  maxQty: z.number().int().min(0).optional(),
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  unit: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));

    if (result.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Inventory item not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("GET /api/v1/inventory/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch inventory item" } },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateInventoryItemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db
      .update(inventoryItems)
      .set(parsed.data)
      .where(eq(inventoryItems.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Inventory item not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: result[0] });
  } catch (error) {
    console.error("PATCH /api/v1/inventory/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update inventory item" } },
      { status: 500 }
    );
  }
}
