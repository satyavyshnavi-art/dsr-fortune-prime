/**
 * Spotworks Design Tokens
 *
 * Single source of truth for the design system. Extracted from `docs/design/system.md`.
 * Import these instead of hand-writing Tailwind classes for type/spacing/colors/radii.
 *
 * Usage:
 *   import { text, height, action, status, radius } from "@/styles/tokens";
 *   <p className={text.body}>Hello</p>
 *   <Button className={action.primary}>Save</Button>
 *
 * Why constants instead of @apply or theme()? Two reasons:
 *   1. TypeScript catches typos at compile time.
 *   2. Codemods can scan & migrate consistently — search-replace on the token
 *      name is more reliable than on raw class strings.
 *
 * If you find yourself writing a literal `text-[Npx]` or `bg-blue-600`, check
 * here first; if the value is missing, add it deliberately rather than drift.
 */

// ──────────────────────────────────────────────────────────────────────────────
// TYPOGRAPHY — six sizes, no exceptions
// ──────────────────────────────────────────────────────────────────────────────

export const text = {
  /** 10 px — uppercase eyebrow labels, table-cell timestamps, tag badges */
  eyebrow: "text-[10px]",
  /** 11 px — form labels, secondary metadata */
  caption: "text-[11px]",
  /** 12 px — DEFAULT body, table cells, dropdown items, filter text */
  body: "text-[12px]",
  /** 13 px — form values, input text, dialog body, emphasized body */
  value: "text-[13px]",
  /** 14 px — section/card headers, dialog titles */
  sectionTitle: "text-[14px] font-semibold",
  /** 16 px — page titles (currently under-used; reach for this for H1s) */
  pageTitle: "text-[16px] font-semibold",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// SLATE NEUTRALS — six text + four background/border
// ──────────────────────────────────────────────────────────────────────────────

export const slate = {
  textMuted: "text-slate-400",       // placeholder, disabled
  textSecondary: "text-slate-500",   // captions, labels
  textBody: "text-slate-600",        // default body
  textEmphasis: "text-slate-700",    // form values
  textHeading: "text-slate-800",     // section titles
  textStrong: "text-slate-900",      // page titles

  borderDefault: "border-slate-200",
  borderSubtle: "border-slate-100",

  bgMuted: "bg-slate-50",            // panel/header bands
  bgSubtle: "bg-slate-100",          // hover state, alternating rows
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// CONTROL HEIGHTS — five canonical sizes
// ──────────────────────────────────────────────────────────────────────────────

export const height = {
  xs: "h-6",   // 24 px — pill badges
  sm: "h-7",   // 28 px — icon-only ghost buttons
  md: "h-8",   // 32 px — compact buttons, filter selects
  lg: "h-9",   // 36 px — DEFAULT for inputs and primary buttons
} as const;

export const icon = {
  /** 12 px — inline within text */
  sm: "h-3 w-3",
  /** 14 px — inside small buttons and filter chips */
  md: "h-3.5 w-3.5",
  /** 16 px — section icons, primary action buttons */
  lg: "h-4 w-4",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// BORDER RADIUS — four sizes plus full
// ──────────────────────────────────────────────────────────────────────────────

export const radius = {
  sm: "rounded",      // 4 px — chips, small badges
  md: "rounded-md",   // 6 px — icon buttons, dropdown items
  lg: "rounded-lg",   // 8 px — DEFAULT for buttons, inputs, cards
  xl: "rounded-xl",   // 12 px — large cards, dialog panels
  full: "rounded-full", // pills, avatars
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// ACTION COLORS — three semantic slots
// ──────────────────────────────────────────────────────────────────────────────
//
// EDITORIAL ARCHITECTURAL — DSR Fortune Prime, 2026-05-22.
// Primary is the single brand accent: blueprint navy (--mark / #1a3a5c).
// Destructive is burgundy redline. Subtle is parchment/ink. NO TEAL, NO PASTEL.

export const action = {
  /** Create, save, submit, primary affordance — blueprint navy */
  primary: "bg-[var(--mark)] hover:bg-[#142e48] text-white",
  /** Delete, cancel-with-data-loss, irreversible negative — burgundy redline */
  destructive: "bg-[var(--redline)] hover:bg-[#6e1f1f] text-white",
  /** Secondary actions, neutral confirmations */
  subtle: "bg-[var(--rule-soft)] hover:bg-[var(--rule)] text-[var(--ink)]",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// EDITORIAL TYPE — three voices
// ──────────────────────────────────────────────────────────────────────────────

export const type = {
  /** Cormorant Garamond — for page titles, hero numbers in serif treatment */
  display: "font-display",
  /** Manrope — body, labels, navigation (the workhorse) */
  sans: "font-sans",
  /** JetBrains Mono — meter readings, IDs, all data */
  mono: "font-mono",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// INK SCALE — text hierarchy (replaces the slate.* names)
// ──────────────────────────────────────────────────────────────────────────────

export const ink = {
  primary: "text-[var(--ink)]",
  muted: "text-[var(--ink-muted)]",
  faint: "text-[var(--ink-faint)]",
} as const;

export const surface = {
  page: "bg-[var(--parchment)]",
  card: "bg-[var(--vellum)]",
  rule: "border-[var(--rule)]",
  ruleSoft: "border-[var(--rule-soft)]",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// ACCENT TILES — pastel surfaces for KPI icons, highlight cards, callouts
// ──────────────────────────────────────────────────────────────────────────────
//
// Each accent has matched tile (icon container), pill (status chip), and
// gradient (large highlight card) variants. Cycle through them in KPI rows
// so each tile has a distinct color (matches the reference dashboard).

export const accent = {
  mint: {
    tile: "bg-emerald-100 text-emerald-600",
    pill: "bg-emerald-100 text-emerald-700",
    gradient: "bg-gradient-to-br from-emerald-50 to-emerald-100/40",
    progress: "bg-emerald-500",
  },
  peach: {
    tile: "bg-amber-100 text-amber-600",
    pill: "bg-amber-100 text-amber-700",
    gradient: "bg-gradient-to-br from-amber-50 to-amber-100/40",
    progress: "bg-amber-400",
  },
  coral: {
    tile: "bg-rose-100 text-rose-500",
    pill: "bg-rose-100 text-rose-700",
    gradient: "bg-gradient-to-br from-rose-50 to-rose-100/40",
    progress: "bg-rose-500",
  },
  lavender: {
    tile: "bg-violet-100 text-violet-600",
    pill: "bg-violet-100 text-violet-700",
    gradient: "bg-gradient-to-br from-violet-50 to-violet-100/40",
    progress: "bg-violet-500",
  },
  sky: {
    tile: "bg-sky-100 text-sky-600",
    pill: "bg-sky-100 text-sky-700",
    gradient: "bg-gradient-to-br from-sky-50 to-sky-100/40",
    progress: "bg-sky-500",
  },
  teal: {
    tile: "bg-teal-100 text-teal-600",
    pill: "bg-teal-100 text-teal-700",
    gradient: "bg-gradient-to-br from-teal-50 to-teal-100/40",
    progress: "bg-teal-500",
  },
} as const;

export type AccentToken = keyof typeof accent;

// ──────────────────────────────────────────────────────────────────────────────
// STATUS COLORS — for badges only, NOT buttons
// ──────────────────────────────────────────────────────────────────────────────

// Softer pill style: no border, lighter background. Matches the reference's
// `4.2%` / `Alert` / `Active` chips at the top-right of each KPI card.
export const status = {
  /** Completed, resolved, healthy */
  success: "bg-emerald-100 text-emerald-700",
  /** Overdue, pending review, attention needed */
  warning: "bg-amber-100 text-amber-700",
  /** In progress, scheduled, neutral-positive */
  info: "bg-sky-100 text-sky-700",
  /** Escalated, breached, critical */
  danger: "bg-rose-100 text-rose-700",
  /** Closed, archived, inactive */
  neutral: "bg-slate-100 text-slate-600",
  /** Medium priority, in-between states */
  purple: "bg-violet-100 text-violet-700",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// LAYOUT — page/section spacing
// ──────────────────────────────────────────────────────────────────────────────

export const layout = {
  /** Page-level wrapper: matches the dashboard route page.tsx pattern */
  page: "p-5 space-y-4",
  /** Section stack inside a page */
  section: "space-y-4",
  /** Tight stack inside a card */
  stack: "space-y-3",
  /** Card panel */
  card: "rounded-xl border border-slate-200 bg-white",
  /** Card padding (compact) */
  cardPad: "p-3",
  /** Card padding (form/dialog) */
  cardPadLg: "p-5",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// DIALOG WIDTHS — three canonical sizes
// ──────────────────────────────────────────────────────────────────────────────

export const dialog = {
  /** Confirmation dialogs (delete, simple yes/no) */
  confirm: "sm:max-w-[400px]",
  /** Form dialogs (edit, create with <8 fields) */
  form: "sm:max-w-[480px]",
  /** Detail/info dialogs (task detail, large content) */
  detail: "sm:max-w-[600px]",
} as const;

// ──────────────────────────────────────────────────────────────────────────────
// TYPE EXPORTS — for prop typing
// ──────────────────────────────────────────────────────────────────────────────

export type TextToken = keyof typeof text;
export type SlateToken = keyof typeof slate;
export type HeightToken = keyof typeof height;
export type IconToken = keyof typeof icon;
export type RadiusToken = keyof typeof radius;
export type ActionToken = keyof typeof action;
export type StatusToken = keyof typeof status;
