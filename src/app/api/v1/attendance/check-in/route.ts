import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { attendanceRecords } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { z } from "zod";

const checkInSchema = z.object({
  employeeId: z.string().uuid(),
  source: z.enum(["manual", "qr", "biometric"]).default("manual"),
  geoLat: z.string().optional(),
  geoLng: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const { employeeId, source, geoLat, geoLng } = parsed.data;
    const now = new Date();
    const today = now.toISOString().split("T")[0];

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

    if (activeSessions.length > 0) {
      return NextResponse.json(
        { error: { code: "ACTIVE_SESSION", message: "Employee already has an active check-in session. Please check out first." } },
        { status: 400 }
      );
    }

    // Check cooldown — find the most recent record with cooldownUntil
    const recentRecords = await db
      .select()
      .from(attendanceRecords)
      .where(eq(attendanceRecords.employeeId, employeeId))
      .orderBy(attendanceRecords.checkIn)
      .limit(1);

    // Check if any recent record has an active cooldown
    for (const record of recentRecords) {
      if (record.cooldownUntil && new Date(record.cooldownUntil) > now) {
        const cooldownRemaining = Math.ceil(
          (new Date(record.cooldownUntil).getTime() - now.getTime()) / (1000 * 60)
        );
        return NextResponse.json(
          {
            error: {
              code: "COOLDOWN_ACTIVE",
              message: `Cooldown active. ${cooldownRemaining} minutes remaining before next check-in.`,
              cooldownUntil: record.cooldownUntil,
            },
          },
          { status: 400 }
        );
      }
    }

    // Create attendance record with check-in
    const result = await db
      .insert(attendanceRecords)
      .values({
        employeeId,
        date: today,
        status: "present",
        checkIn: now,
        source: source as any,
        geoLat,
        geoLng,
      })
      .returning();

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/attendance/check-in error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to check in" } },
      { status: 500 }
    );
  }
}
