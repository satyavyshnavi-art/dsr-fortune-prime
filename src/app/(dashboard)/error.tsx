"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="mx-auto rounded-full bg-red-50 p-3 w-fit mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500" aria-hidden="true" />
        </div>
        <h2 className="text-[15px] font-semibold text-slate-800 mb-1">Something went wrong</h2>
        <p className="text-[12px] text-slate-500 max-w-sm mx-auto mb-4">
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[12px] font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white text-slate-700 text-[12px] font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Home className="h-3.5 w-3.5" aria-hidden="true" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
