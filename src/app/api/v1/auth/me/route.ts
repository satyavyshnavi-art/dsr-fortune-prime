import { NextResponse } from "next/server";
import { getAuthUser, auth0 } from "@/lib/rbac";

export async function GET() {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/v1/auth/me error:", error);
    return NextResponse.json(
      { error: "Failed to get user session" },
      { status: 500 }
    );
  }
}
