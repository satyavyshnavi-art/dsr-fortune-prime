import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <div className="mx-auto rounded-full bg-slate-100 p-4 w-fit mb-5">
          <Search className="h-10 w-10 text-slate-400" aria-hidden="true" />
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Page not found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Home className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
