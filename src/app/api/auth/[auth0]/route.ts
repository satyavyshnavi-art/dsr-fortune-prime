import { NextRequest } from "next/server";
import { auth0 } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  return auth0.middleware(req);
}

export async function POST(req: NextRequest) {
  return auth0.middleware(req);
}
