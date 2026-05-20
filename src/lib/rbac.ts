import { NextRequest, NextResponse } from "next/server";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { db } from "@/lib/db";
import {
  roles,
  rolePermissions,
  permissions,
  userProfiles,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// ==================== Auth0 Client ====================

export const auth0 = new Auth0Client();

// ==================== Types ====================

export interface AuthUser {
  userId: string;
  auth0UserId: string;
  orgId: string | null;
  role: string | null;
  facilityId: string | null;
  email: string | null;
  displayName: string | null;
}

// ==================== Session Helpers ====================

/**
 * Get the authenticated user from the Auth0 session and enrich
 * with local profile data (orgId, role, facilityId).
 * Returns null if the user is not authenticated.
 */
export async function getAuthUser(
  request?: NextRequest
): Promise<AuthUser | null> {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return null;

    const auth0UserId = session.user.sub as string;

    // Look up local profile
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.auth0UserId, auth0UserId))
      .limit(1);

    if (!profile) return null;

    return {
      userId: profile.id,
      auth0UserId,
      orgId: null, // populated when org context is added to userProfiles
      role: profile.role,
      facilityId: profile.facilityId,
      email: profile.email,
      displayName: profile.displayName,
    };
  } catch {
    return null;
  }
}

// ==================== Permission Checking ====================

/**
 * Check whether a role has a specific module+action permission.
 */
export async function hasPermission(
  roleName: string,
  module: string,
  action: string
): Promise<boolean> {
  const result = await db
    .select({ id: permissions.id })
    .from(permissions)
    .innerJoin(rolePermissions, eq(rolePermissions.permissionId, permissions.id))
    .innerJoin(roles, eq(roles.id, rolePermissions.roleId))
    .where(
      and(
        eq(roles.name, roleName),
        eq(permissions.module, module),
        eq(permissions.action, action)
      )
    )
    .limit(1);

  return result.length > 0;
}

// ==================== Middleware Wrapper ====================

type ApiHandler = (
  request: NextRequest,
  context: { params?: Record<string, string> }
) => Promise<NextResponse>;

/**
 * Wrap an API route handler with authentication and optional permission check.
 *
 * Usage:
 *   export const GET = withAuth(async (req, ctx) => { ... });
 *   export const POST = withAuth(async (req, ctx) => { ... }, "tasks", "create");
 */
export function withAuth(
  handler: (
    request: NextRequest & { auth: AuthUser },
    context: { params?: Record<string, string> }
  ) => Promise<NextResponse>,
  module?: string,
  action?: string
): ApiHandler {
  return async (request: NextRequest, context) => {
    const user = await getAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check permission if module+action specified
    if (module && action && user.role) {
      const allowed = await hasPermission(user.role, module, action);
      if (!allowed) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    // Attach auth user to request
    (request as NextRequest & { auth: AuthUser }).auth = user;

    return handler(request as NextRequest & { auth: AuthUser }, context);
  };
}
