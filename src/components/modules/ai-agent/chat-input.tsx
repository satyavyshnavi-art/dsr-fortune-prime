"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("Please enter a message");
      return;
    }
    onSend(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-200 bg-white">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 h-9 rounded-full border border-slate-200 bg-slate-50 px-4 text-[12px] text-slate-700 placeholder:text-slate-400 placeholder:text-[12px] outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 focus:bg-white transition-colors disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
