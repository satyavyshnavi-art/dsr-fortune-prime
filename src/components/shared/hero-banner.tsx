"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type Tone = "violet" | "magenta" | "teal" | "sunset";

const toneStyles: Record<Tone, string> = {
  violet: "from-violet-600 via-violet-500 to-fuchsia-500",
  magenta: "from-fuchsia-600 via-purple-600 to-violet-700",
  teal: "from-teal-600 via-cyan-600 to-blue-600",
  sunset: "from-rose-500 via-orange-500 to-amber-500",
};

interface HeroBannerProps {
  title: string;
  subtitle?: React.ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function HeroBanner({
  title,
  subtitle,
  icon: Icon,
  tone = "violet",
  badge,
  actions,
  className,
}: HeroBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white px-6 py-5",
        toneStyles[tone],
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-white/8 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-24 -left-16 h-56 w-56 rounded-full bg-black/8 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {Icon && (
            <div className="h-10 w-10 shrink-0 rounded-xl bg-white/12 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/15">
              <Icon className="h-5 w-5 text-white/90" aria-hidden="true" strokeWidth={1.75} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[20px] font-semibold tracking-[-0.01em] leading-tight text-white">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <div className="mt-1 text-[12.5px] text-white/70 leading-snug">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroBadge({
  children,
  dot = true,
}: {
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-medium text-white/90 ring-1 ring-white/15">
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

export function HeroButton({
  children,
  onClick,
  variant = "ghost",
  icon: Icon,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "ghost" | "solid";
  icon?: LucideIcon;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 h-8 text-[12px] font-medium transition-colors",
        variant === "solid"
          ? "bg-white text-violet-700 hover:bg-white/90 shadow-sm"
          : "bg-white/10 backdrop-blur-sm text-white/90 ring-1 ring-white/15 hover:bg-white/20"
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.75} />}
      {children}
    </button>
  );
}
