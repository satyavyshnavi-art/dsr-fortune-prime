import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceRecords } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const employeeId = searchParams.get("employee_id");

    if (!employeeId) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "employee_id query parameter is required" } },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check for active session (checked in but not checked out)
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

    const isCheckedIn = activeSessions.length > 0;
    const activeSession = isCheckedIn ? activeSessions[0] : null;

    // Check for active cooldown
    const recentRecords = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.employeeId, employeeId))
      .orderBy(desc(attendanceRecords.checkOut))
      .limit(1);

    let cooldownActive = false;
    let cooldownUntil: Date | null = null;
    let cooldownRemainingMinutes = 0;

    if (recentRecords.length > 0 && recentRecords[0].cooldownUntil) {
      const cooldownEnd = new Date(recentRecords[0].cooldownUntil);
      if (cooldownEnd > now) {
        cooldownActive = true;
        cooldownUntil = cooldownEnd;
        cooldownRemainingMinutes = Math.ceil(
          (cooldownEnd.getTime() - now.getTime()) / (1000 * 60)
        );
      }
    }

    // Calculate hours worked if checked in
    let hoursWorked = 0;
    if (isCheckedIn && activeSession?.checkIn) {
      hoursWorked =
        Math.round(
          ((now.getTime() - new Date(activeSession.checkIn).getTime()) /
            (1000 * 60 * 60)) *
            100
        ) / 100;
    }

    return NextResponse.json({
      data: {
        isCheckedIn,
        activeSession: activeSession
          ? {
              id: activeSession.id,
              checkIn: activeSession.checkIn,
              hoursWorked,
              geoLat: activeSession.geoLat,
              geoLng: activeSession.geoLng,
            }
          : null,
        cooldown: {
          active: cooldownActive,
          until: cooldownUntil,
          remainingMinutes: cooldownRemainingMinutes,
        },
      },
    });
  } catch (error) {
    console.error("GET /api/v1/attendance/status error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch attendance status" } },
      { status: 500 }
    );
  }
}
