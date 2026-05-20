"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto rounded-full bg-red-50 p-4 w-fit mb-5">
          <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
        <p className="text-sm text-slate-500 mb-6">
          {error.message || "An unexpected error occurred. Please try again or return to the dashboard."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
