import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { employees } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { sanitizeInput } from "@/lib/sanitize";

const createEmployeeSchema = z.object({
  facilityId: z.string().uuid(),
  empId: z.string().min(1).max(20),
  firstName: z.string().min(1).max(100).transform(sanitizeInput),
  lastName: z.string().max(100).transform(sanitizeInput).optional(),
  designation: z.string().max(100).optional(),
  department: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email().max(255).optional(),
  dateOfBirth: z.string().optional(),
  description: z.string().max(5000).transform(sanitizeInput).optional(),
  qrCodeData: z.string().optional(),
  smartcardId: z.string().max(50).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const facilityId = searchParams.get("facilityId");

    const query = facilityId
      ? db.select().from(employees).where(eq(employees.facilityId, facilityId))
      : db.select().from(employees);

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/v1/employees error:", error);
    return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0].message } },
        { status: 400 }
      );
    }

    const result = await db.insert(employees).values(parsed.data).returning();
    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/employees error:", error);
    return NextResponse.json({ error: "Failed to create employee" }, { status: 500 });
  }
}
