"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

/**
 * Adivo-style KPI card.
 *
 * Structure (matches the reference exactly):
 *   - Gradient colored icon tile top-left (color varies per card)
 *   - Trend pill top-right (green ↗ / red ↘)
 *   - Uppercase eyebrow label
 *   - Large bold number (hero)
 *   - Optional mini bar-spark in the matching tone at the bottom
 */

type Trend = "up" | "down" | "neutral";

type Tone = "violet" | "emerald" | "orange" | "sky" | "rose" | "amber";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: Trend;
  trendValue?: string;
  /** Card accent tone — cycle through to give a row of KPIs visual variety. */
  tone?: Tone;
  /** Legacy color prop (mapped to a tone for backward compat). */
  color?: string;
  /** Optional mini bar values 0–1 for the sparkline. */
  spark?: number[];
  className?: string;
}

const toneStyles: Record<Tone, { tile: string; spark: string }> = {
  violet:  { tile: "bg-gradient-to-br from-violet-500 to-purple-600",     spark: "bg-violet-400" },
  emerald: { tile: "bg-gradient-to-br from-emerald-500 to-teal-600",      spark: "bg-emerald-400" },
  orange:  { tile: "bg-gradient-to-br from-orange-500 to-amber-600",      spark: "bg-orange-400" },
  sky:     { tile: "bg-gradient-to-br from-sky-500 to-blue-600",          spark: "bg-sky-400" },
  rose:    { tile: "bg-gradient-to-br from-rose-500 to-pink-600",         spark: "bg-rose-400" },
  amber:   { tile: "bg-gradient-to-br from-amber-400 to-yellow-500",      spark: "bg-amber-400" },
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
  up: "bg-emerald-100 text-emerald-700",
  down: "bg-rose-100 text-rose-700",
  neutral: "bg-slate-100 text-slate-600",
};

const trendGlyph: Record<Trend, string> = {
  up: "↗",
  down: "↘",
  neutral: "→",
};

// Default sparkline shape so every card has the visual without callers having to pass one.
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
        "relative bg-white border border-slate-100 rounded-2xl p-5 transition-all hover:shadow-[0_2px_18px_-8px_rgb(15_23_42_/_0.12)]",
        className
      )}
      role="region"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3 mb-5">
        {Icon && (
          <div
            className={cn(
              "h-11 w-11 shrink-0 rounded-xl flex items-center justify-center shadow-sm",
              t.tile
            )}
          >
            <Icon className="h-5 w-5 text-white" aria-hidden="true" strokeWidth={2} />
          </div>
        )}
        {trend && trendValue && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums",
              trendStyles[trend]
            )}
          >
            {trendGlyph[trend]} {trendValue}
          </span>
        )}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 mb-1">
        {title}
      </p>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[26px] font-bold leading-none text-slate-900 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-1.5 truncate">{subtitle}</p>
          )}
        </div>

        {/* Sparkline — 8 thin bars in the card's tone */}
        <div className="flex items-end gap-[2px] h-9 shrink-0" aria-hidden="true">
          {bars.map((v, i) => (
            <span
              key={i}
              className={cn("w-[3px] rounded-sm opacity-80", t.spark)}
              style={{ height: `${Math.max(15, (v / max) * 100)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
