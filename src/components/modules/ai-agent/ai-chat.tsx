"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Sparkles } from "lucide-react";
import { ChatMessage, type Message } from "./chat-message";
import { ChatInput } from "./chat-input";

const DEMO_RESPONSES = [
  "I can help you with facility management tasks like tracking attendance, managing assets, reviewing daily updates, and generating reports. What would you like to know?",
  "Based on today's data, the facility is operating at 92% staff attendance. Housekeeping and Security teams are fully staffed. Would you like a detailed breakdown?",
  "I've analyzed the recent maintenance logs. There are 3 pending work orders: 1 HVAC inspection, 1 plumbing repair in Block C, and 1 electrical audit scheduled for this week.",
  "The water consumption for this month is tracking 8% below the monthly target. The recycling rate has improved to 72%. Want me to generate a full utilities report?",
  "I can help you set up alerts for specific conditions like low attendance, overdue maintenance tasks, or unusual utility consumption patterns. What alerts would you like to configure?",
];

function getDemoResponse(): string {
  return DEMO_RESPONSES[Math.floor(Math.random() * DEMO_RESPONSES.length)];
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm the DSR Fortune Prime AI Assistant. I can help you with facility management queries, generate reports, analyze data, and answer questions about your facility operations. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function handleSend(content: string) {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: getDemoResponse(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1200);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-200 bg-white">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ecfdf5] text-[#10b981]">
          <Bot className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold text-slate-800">
            DSR Fortune Prime AI Assistant
          </h2>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-[#ecfdf5] px-1.5 py-0.5 text-[10px] font-medium text-[#10b981] border border-[#a7f3d0]">
            <Sparkles className="h-2.5 w-2.5" />
            Powered by Gemini
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2 mr-auto max-w-[80%]">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 shrink-0 mt-0.5">
              <Bot className="h-3 w-3" />
            </div>
            <div className="rounded-xl rounded-bl-sm bg-white border border-slate-200 px-3 py-2">
              <div className="flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
}
