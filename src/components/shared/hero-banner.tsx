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
  rightSlot?: React.ReactNode;
  className?: string;
}

/**
 * Gradient hero banner used at the top of dashboard / module pages.
 * Pattern from the Adivo reference: bold title, optional subtitle and
 * status badge on the left, action buttons on the right, all on a
 * vibrant gradient surface.
 */
export function HeroBanner({
  title,
  subtitle,
  icon: Icon,
  tone = "violet",
  badge,
  actions,
  rightSlot,
  className,
}: HeroBannerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br text-white p-6 md:p-7",
        toneStyles[tone],
        className
      )}
    >
      {/* Soft glow overlay for richness */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-black/10 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {Icon && (
            <div className="h-12 w-12 shrink-0 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <Icon className="h-6 w-6 text-white" aria-hidden="true" strokeWidth={2} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight leading-tight text-white">
                {title}
              </h1>
              {badge}
            </div>
            {subtitle && (
              <div className="mt-1.5 text-[14px] text-white/85 leading-snug">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {actions}
          {rightSlot}
        </div>
      </div>
    </div>
  );
}

/** Live status badge — the "● Live" / "Sprint 24 Active" pill from the reference. */
export function HeroBadge({
  children,
  dot = true,
}: {
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm px-2.5 py-1 text-[11.5px] font-medium text-white ring-1 ring-white/20">
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

/** White outline pill button for the banner — secondary action style. */
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
        "inline-flex items-center gap-2 rounded-full px-4 h-9 text-[12.5px] font-semibold transition-colors",
        variant === "solid"
          ? "bg-white text-violet-700 hover:bg-white/95"
          : "bg-white/15 backdrop-blur-sm text-white ring-1 ring-white/25 hover:bg-white/25"
      )}
    >
      {Icon && <Icon className="h-4 w-4" aria-hidden="true" strokeWidth={2} />}
      {children}
    </button>
  );
}
