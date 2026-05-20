import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryItems, inventoryTransactions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const transactSchema = z.object({
  type: z.enum(["in", "out", "adjust"]),
  qty: z.number().int().min(1),
  reference: z.string().optional(),
  transactedBy: z.string().uuid().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = transactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { type, qty, reference, transactedBy } = parsed.data;

    // Fetch current item
    const items = await db
      .select()
      .from(inventoryItems)
      .where(eq(inventoryItems.id, id));

    if (items.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Inventory item not found" } },
        { status: 404 }
      );
    }

    const item = items[0];
    const currentQty = item.currentQty ?? 0;
    let newQty: number;

    if (type === "in") {
      newQty = currentQty + qty;
    } else if (type === "out") {
      if (currentQty < qty) {
        return NextResponse.json(
          { error: { code: "INSUFFICIENT_STOCK", message: "Not enough stock for this transaction" } },
          { status: 400 }
        );
      }
      newQty = currentQty - qty;
    } else {
      // adjust — set quantity directly
      newQty = qty;
    }

    // Record transaction
    const transaction = await db
      .insert(inventoryTransactions)
      .values({
        itemId: id,
        type,
        qty,
        reference,
        transactedBy,
      })
      .returning();

    // Update item qty
    await db
      .update(inventoryItems)
      .set({ currentQty: newQty })
      .where(eq(inventoryItems.id, id));

    return NextResponse.json({ data: transaction[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/inventory/[id]/transact error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to record transaction" } },
      { status: 500 }
    );
  }
}
