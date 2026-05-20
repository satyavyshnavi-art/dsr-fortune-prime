import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { inventoryTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = request.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const result = await db
      .select()
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.itemId, id))
      .orderBy(desc(inventoryTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: result,
      meta: { total: result.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/inventory/[id]/transactions error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch transactions" } },
      { status: 500 }
    );
  }
}
