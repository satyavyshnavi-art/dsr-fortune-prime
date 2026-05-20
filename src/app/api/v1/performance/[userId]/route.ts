import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employeePerformance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    const result = await db
      .select()
      .from(employeePerformance)
      .where(eq(employeePerformance.userId, userId))
      .orderBy(desc(employeePerformance.createdAt));

    if (result.length === 0) {
      return NextResponse.json(
        { data: [], meta: { total: 0, userId } }
      );
    }

    // Compute aggregate summary from all periods
    const totalAssigned = result.reduce((sum, r) => sum + (r.tasksAssigned ?? 0), 0);
    const totalCompleted = result.reduce((sum, r) => sum + (r.tasksCompleted ?? 0), 0);
    const totalMissed = result.reduce((sum, r) => sum + (r.tasksMissed ?? 0), 0);
    const avgScore =
      result.reduce((sum, r) => sum + Number(r.score ?? 0), 0) / result.length;

    return NextResponse.json({
      data: result,
      meta: {
        total: result.length,
        userId,
        summary: {
          tasksAssigned: totalAssigned,
          tasksCompleted: totalCompleted,
          tasksMissed: totalMissed,
          averageScore: Math.round(avgScore * 100) / 100,
          completionRate:
            totalAssigned > 0
              ? Math.round((totalCompleted / totalAssigned) * 10000) / 100
              : 0,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/v1/performance/[userId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }
}
