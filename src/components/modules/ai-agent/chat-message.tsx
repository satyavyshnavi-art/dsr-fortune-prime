"use client";

import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-2 max-w-[80%]",
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0 mt-0.5">
          <Bot className="h-3 w-3" />
        </div>
      )}

      {/* Message bubble */}
      <div
        className={cn(
          "rounded-xl px-3 py-2 text-[12px] leading-relaxed",
          isUser
            ? "bg-[#10b981] text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isUser ? "text-blue-200" : "text-slate-400"
          )}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
