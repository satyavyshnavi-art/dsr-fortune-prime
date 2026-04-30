"use client";

import { TopBar } from "@/components/layout/top-bar";
import { AIChat } from "@/components/modules/ai-agent";

export default function AIAgentPage() {
  return (
    <div className="flex flex-col h-screen">
      <TopBar title="AI Agent" />
      <div className="flex-1 overflow-hidden bg-slate-50">
        <AIChat />
      </div>
    </div>
  );
}
