import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequests, approvalSteps } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const role = searchParams.get("role");
    const approverId = searchParams.get("approver_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    if (!role && !approverId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Either role or approver_id query parameter is required" } },
        { status: 400 }
      );
    }

    // Find pending steps matching the user's role or approver ID
    const stepConditions = [eq(approvalSteps.status, "pending")];
    if (role) stepConditions.push(eq(approvalSteps.approverRole, role));
    if (approverId) stepConditions.push(eq(approvalSteps.approverId, approverId));

    const pendingSteps = await db
      .select()
      .from(approvalSteps)
      .where(and(...stepConditions));

    if (pendingSteps.length === 0) {
      return NextResponse.json({
        data: [],
        meta: { total: 0, page, limit },
      });
    }

    // Fetch the corresponding approval requests
    const requestIds = [...new Set(pendingSteps.map((s) => s.requestId))];
    const requests = [];

    for (const reqId of requestIds.slice(offset, offset + limit)) {
      const result = await db
        .select()
        .from(approvalRequests)
        .where(eq(approvalRequests.id, reqId));

      if (result.length > 0) {
        const step = pendingSteps.find((s) => s.requestId === reqId);
        requests.push({ ...result[0], currentStep: step });
      }
    }

    return NextResponse.json({
      data: requests,
      meta: { total: requestIds.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/approvals/pending error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch pending approvals" } },
      { status: 500 }
    );
  }
}
