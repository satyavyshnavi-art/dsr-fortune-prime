"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf } from "lucide-react";
import { demoLogin } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@dsrfortuneprime.com");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = demoLogin(email, password);

    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100">
      <div className="w-full max-w-sm mx-4">
        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/60 border border-slate-200/80 px-8 py-10">
          {/* Branding */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563eb] mb-3">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-slate-800 tracking-tight">
              DSR Fortune Prime
            </h1>
            <p className="text-[12px] text-slate-400 mt-0.5">
              Facility Management Portal
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-slate-600 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
              />
            </div>

            {error && (
              <p className="text-[12px] text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#10b981] py-2.5 text-[13px] font-semibold text-white hover:bg-[#059669] active:bg-[#047857] transition-colors mt-2 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100">
            <p className="text-center text-[10px] text-slate-400 mb-2">
              Demo Account
            </p>
            <button
              type="button"
              onClick={() => { setEmail("demo@dsrfortuneprime.com"); setPassword("demo123"); }}
              className="w-full flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5 text-[11px] text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>demo@dsrfortuneprime.com</span>
              <span className="text-[10px] text-slate-400">Facility Manager</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
