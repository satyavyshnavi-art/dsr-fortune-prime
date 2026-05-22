"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "neutral";
type Tone = "violet" | "emerald" | "orange" | "sky" | "rose" | "amber";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: Trend;
  trendValue?: string;
  tone?: Tone;
  color?: string;
  spark?: number[];
  className?: string;
}

const toneStyles: Record<Tone, { tile: string; spark: string }> = {
  violet:  { tile: "bg-gradient-to-br from-teal-500 to-teal-600",          spark: "bg-teal-300" },
  emerald: { tile: "bg-gradient-to-br from-emerald-500 to-teal-600",      spark: "bg-emerald-300" },
  orange:  { tile: "bg-gradient-to-br from-orange-400 to-amber-600",      spark: "bg-orange-300" },
  sky:     { tile: "bg-gradient-to-br from-sky-500 to-blue-600",          spark: "bg-sky-300" },
  rose:    { tile: "bg-gradient-to-br from-rose-400 to-pink-600",         spark: "bg-rose-300" },
  amber:   { tile: "bg-gradient-to-br from-amber-400 to-yellow-500",      spark: "bg-amber-300" },
};

const legacyToTone: Record<string, Tone> = {
  blue: "sky",
  green: "emerald",
  red: "rose",
  yellow: "amber",
  slate: "violet",
};

function resolveTone(tone: Tone | undefined, legacy: string | undefined): Tone {
  if (tone) return tone;
  if (legacy && legacyToTone[legacy]) return legacyToTone[legacy];
  return "violet";
}

const trendStyles: Record<Trend, string> = {
  up: "bg-emerald-50 text-emerald-600",
  down: "bg-rose-50 text-rose-600",
  neutral: "bg-slate-50 text-slate-500",
};

const trendGlyph: Record<Trend, string> = {
  up: "↗",
  down: "↘",
  neutral: "→",
};

const defaultSpark = [0.45, 0.6, 0.4, 0.55, 0.72, 0.5, 0.8, 0.95];

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  tone,
  color,
  spark,
  className,
}: KPICardProps) {
  const resolved = resolveTone(tone, color);
  const t = toneStyles[resolved];
  const bars = spark && spark.length > 0 ? spark : defaultSpark;
  const max = Math.max(...bars, 0.01);

  return (
    <div
      className={cn(
        "relative bg-white border border-slate-100 rounded-2xl p-4 transition-shadow hover:shadow-[0_1px_12px_-4px_rgb(15_23_42_/_0.08)]",
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-2 mb-4">
        {Icon && (
          <div
            className={cn(
              "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center",
              t.tile
            )}
          >
            <Icon className="h-4 w-4 text-white" aria-hidden="true" strokeWidth={2} />
          </div>
        )}
        {trend && trendValue && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums",
              trendStyles[trend]
            )}
          >
            {trendGlyph[trend]} {trendValue}
          </span>
        )}
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 mb-0.5">
        {title}
      </p>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[22px] font-bold leading-none text-slate-900 tabular-nums tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[10.5px] text-slate-400 mt-1 truncate">{subtitle}</p>
          )}
        </div>

        <div className="flex items-end gap-[2px] h-7 shrink-0" aria-hidden="true">
          {bars.map((v, i) => (
            <span
              key={i}
              className={cn("w-[3px] rounded-sm opacity-60", t.spark)}
              style={{ height: `${Math.max(15, (v / max) * 100)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
