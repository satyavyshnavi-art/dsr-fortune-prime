import { NextRequest, NextResponse } from "next/server";

/**
 * Public routes that do not require authentication.
 */
const PUBLIC_PATHS = [
  "/login",
  "/api/auth",
  "/api/v1/whatsapp/webhook",
  "/api/cron",
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

/**
 * Session cookie names used by Auth0 NextJS SDK v4.
 * The SDK uses "appSession" by default, and "__Secure-next-auth.session-token"
 * when running behind HTTPS.
 */
const SESSION_COOKIES = ["appSession", "__Secure-next-auth.session-token"];

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => request.cookies.has(name));
}

/**
 * Security headers applied to every response.
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through with security headers only
  if (isPublicRoute(pathname)) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Check for Auth0 session cookie on protected routes
  if (!hasSessionCookie(request)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("returnTo", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
