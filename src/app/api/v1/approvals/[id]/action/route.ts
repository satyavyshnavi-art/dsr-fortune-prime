import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequests, approvalSteps } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  comments: z.string().optional(),
  approverId: z.string().uuid().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = actionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { action, comments, approverId } = parsed.data;

    // Fetch the approval request
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

    const approvalRequest = requests[0];

    if (approvalRequest.status !== "pending") {
      return NextResponse.json(
        { error: { code: "INVALID_STATE", message: `Request is already ${approvalRequest.status}` } },
        { status: 400 }
      );
    }

    // Get all steps ordered by stepOrder
    const steps = await db
      .select()
      .from(approvalSteps)
      .where(eq(approvalSteps.requestId, id))
      .orderBy(asc(approvalSteps.stepOrder));

    // Find the current pending step
    const currentStep = steps.find((s) => s.status === "pending");

    if (!currentStep) {
      return NextResponse.json(
        { error: { code: "NO_PENDING_STEP", message: "No pending approval step found" } },
        { status: 400 }
      );
    }

    if (action === "reject") {
      // Mark current step as rejected
      await db
        .update(approvalSteps)
        .set({
          status: "rejected",
          approverId,
          actedAt: new Date(),
          comments,
        })
        .where(eq(approvalSteps.id, currentStep.id));

      // Mark the entire request as rejected
      await db
        .update(approvalRequests)
        .set({ status: "rejected" })
        .where(eq(approvalRequests.id, id));

      return NextResponse.json({
        data: { requestId: id, action: "rejected", step: currentStep.stepOrder },
      });
    }

    // Approve current step
    await db
      .update(approvalSteps)
      .set({
        status: "approved",
        approverId,
        actedAt: new Date(),
        comments,
      })
      .where(eq(approvalSteps.id, currentStep.id));

    // Find the next step
    const currentIndex = steps.findIndex((s) => s.id === currentStep.id);
    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      // Advance next step to pending
      await db
        .update(approvalSteps)
        .set({ status: "pending" })
        .where(eq(approvalSteps.id, nextStep.id));

      return NextResponse.json({
        data: {
          requestId: id,
          action: "approved",
          step: currentStep.stepOrder,
          nextStep: nextStep.stepOrder,
        },
      });
    }

    // Last step — mark request as approved
    await db
      .update(approvalRequests)
      .set({ status: "approved" })
      .where(eq(approvalRequests.id, id));

    return NextResponse.json({
      data: {
        requestId: id,
        action: "approved",
        step: currentStep.stepOrder,
        finalApproval: true,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/approvals/[id]/action error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to process approval action" } },
      { status: 500 }
    );
  }
}
