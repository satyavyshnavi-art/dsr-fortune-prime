import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { approvalRequests, approvalWorkflows, approvalSteps } from "@/db/schema";
import { eq, and, desc, inArray, asc } from "drizzle-orm";
import { z } from "zod";

const createApprovalRequestSchema = z.object({
  facilityId: z.string().uuid(),
  type: z.enum(["advance", "uniform", "petty_cash", "po", "invoice", "salary_revision"]),
  description: z.string().optional(),
  amount: z.string().optional(),
  requesterId: z.string().uuid().optional(),
  attachments: z.any().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const facilityId = searchParams.get("facility_id");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const offset = (page - 1) * limit;

    const conditions = [];
    if (type) conditions.push(eq(approvalRequests.type, type as any));
    if (status) conditions.push(eq(approvalRequests.status, status));
    if (facilityId) conditions.push(eq(approvalRequests.facilityId, facilityId));

    let query = db.select().from(approvalRequests);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(approvalRequests.createdAt))
      .limit(limit)
      .offset(offset);

    // Attach workflow steps so the UI can render the approval chain
    const requestIds = result.map((r) => r.id);
    const steps =
      requestIds.length > 0
        ? await db
            .select()
            .from(approvalSteps)
            .where(inArray(approvalSteps.requestId, requestIds))
            .orderBy(asc(approvalSteps.stepOrder))
        : [];

    const stepsByRequest = new Map<string, typeof steps>();
    for (const step of steps) {
      const list = stepsByRequest.get(step.requestId) ?? [];
      list.push(step);
      stepsByRequest.set(step.requestId, list);
    }

    const data = result.map((r) => ({
      ...r,
      steps: stepsByRequest.get(r.id) ?? [],
    }));

    return NextResponse.json({
      data,
      meta: { total: data.length, page, limit },
    });
  } catch (error) {
    console.error("GET /api/v1/approvals error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch approval requests" } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createApprovalRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { facilityId, type, description, amount, requesterId, attachments } = parsed.data;

    // Find the workflow for this approval type
    const workflows = await db
      .select()
      .from(approvalWorkflows)
      .where(eq(approvalWorkflows.type, type as any));

    if (workflows.length === 0) {
      return NextResponse.json(
        { error: { code: "NO_WORKFLOW", message: `No approval workflow configured for type: ${type}` } },
        { status: 400 }
      );
    }

    const workflow = workflows[0];
    const steps = (workflow.steps as Array<{ stepOrder: number; approverRole: string; approverId?: string }>) || [];

    if (steps.length === 0) {
      return NextResponse.json(
        { error: { code: "EMPTY_WORKFLOW", message: "Approval workflow has no steps configured" } },
        { status: 400 }
      );
    }

    // Create the approval request
    const [approvalRequest] = await db
      .insert(approvalRequests)
      .values({
        workflowId: workflow.id,
        facilityId,
        type: type as any,
        description,
        amount,
        requesterId,
        attachments,
        status: "pending",
      })
      .returning();

    // Create approval steps for each step in the workflow
    const stepValues = steps.map((step, index) => ({
      requestId: approvalRequest.id,
      stepOrder: step.stepOrder ?? index + 1,
      approverRole: step.approverRole,
      approverId: step.approverId,
      status: index === 0 ? ("pending" as const) : ("waiting" as const),
    }));

    await db.insert(approvalSteps).values(stepValues);

    return NextResponse.json({ data: approvalRequest }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/approvals error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create approval request" } },
      { status: 500 }
    );
  }
}
