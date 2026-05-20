import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequests, approvalSteps } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const requests = await db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, id));

    if (requests.length === 0) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Approval request not found" } },
        { status: 404 }
      );
    }

    const steps = await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.requestId, id))
      .orderBy(asc(approvalSteps.stepOrder));

    return NextResponse.json({
      data: {
        ...requests[0],
        steps,
      },
    });
  } catch (error) {
    console.error("GET /api/v1/approvals/[id] error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch approval request" } },
      { status: 500 }
    );
  }
}
