"use client";

import { TopBar } from "@/components/layout/top-bar";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full">
      <TopBar title="Dashboard" />
      <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard Loading Test</h1>
        <p className="text-slate-500 mt-2">If you see this, the layout and TopBar work fine.</p>
      </div>
    </div>
  );
}
