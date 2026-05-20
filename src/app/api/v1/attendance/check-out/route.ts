import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceRecords } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

const checkOutSchema = z.object({
  employeeId: z.string().uuid(),
  shiftsSelected: z.array(z.string()).optional(),
});

// Shift type definitions based on hours worked
// Single shift (G, A, B, C): <= 12 hours
// Double shift (AB, BC, AC): 12-18 hours
// Triple shift (ABC): > 18 hours
const SINGLE_SHIFTS = ["G", "A", "B", "C"];
const DOUBLE_SHIFTS = ["AB", "BC", "AC"];
const TRIPLE_SHIFT = "ABC";

function determineShiftCategory(hoursWorked: number): {
  category: "single" | "double" | "triple";
  allowedShifts: string[];
  isMultiShift: boolean;
} {
  if (hoursWorked <= 12) {
    return { category: "single", allowedShifts: SINGLE_SHIFTS, isMultiShift: false };
  } else if (hoursWorked <= 18) {
    return { category: "double", allowedShifts: DOUBLE_SHIFTS, isMultiShift: true };
  } else {
    return { category: "triple", allowedShifts: [TRIPLE_SHIFT], isMultiShift: true };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkOutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { employeeId, shiftsSelected } = parsed.data;
    const now = new Date();

    // Find active session
    const activeSessions = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.employeeId, employeeId),
          isNull(attendanceRecords.checkOut)
        )
      )
      .limit(1);

    if (activeSessions.length === 0) {
      return NextResponse.json(
        { error: { code: "NO_ACTIVE_SESSION", message: "No active check-in session found for this employee." } },
        { status: 400 }
      );
    }

    const activeRecord = activeSessions[0];
    const checkInTime = new Date(activeRecord.checkIn!);
    const hoursWorked = (now.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const shiftInfo = determineShiftCategory(hoursWorked);

    // For triple shifts, auto-select ABC
    let finalShifts = shiftsSelected;
    if (shiftInfo.category === "triple") {
      finalShifts = [TRIPLE_SHIFT];
    }

    // Validate shift selection if provided
    if (finalShifts && finalShifts.length > 0) {
      const invalidShift = finalShifts.find(
        (s) => !shiftInfo.allowedShifts.includes(s)
      );
      if (invalidShift) {
        return NextResponse.json(
          {
            error: {
              code: "INVALID_SHIFT",
              message: `Shift "${invalidShift}" is not valid for ${shiftInfo.category} shift (${hoursWorked.toFixed(1)}h worked). Allowed: ${shiftInfo.allowedShifts.join(", ")}`,
            },
          },
          { status: 400 }
        );
      }
    }

    // Calculate cooldown for multi-shift: checkout + 8 hours
    const cooldownUntil = shiftInfo.isMultiShift
      ? new Date(now.getTime() + 8 * 60 * 60 * 1000)
      : null;

    // Update the attendance record
    const result = await db
      .update(attendanceRecords)
      .set({
        checkOut: now,
        isMultiShift: shiftInfo.isMultiShift,
        shiftsSelected: finalShifts || null,
        cooldownUntil,
      })
      .where(eq(attendanceRecords.id, activeRecord.id))
      .returning();

    return NextResponse.json({
      data: {
        ...result[0],
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        shiftCategory: shiftInfo.category,
        allowedShifts: shiftInfo.allowedShifts,
        cooldownUntil,
      },
    });
  } catch (error) {
    console.error("POST /api/v1/attendance/check-out error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to check out" } },
      { status: 500 }
    );
  }
}
