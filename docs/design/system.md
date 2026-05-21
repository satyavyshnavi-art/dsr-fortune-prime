# Spotworks Design System

Extracted 2026-05-21 from 146 TSX files under `src/app/(dashboard)/` and `src/components/`. Values reflect what the codebase **actually uses today**, ranked by frequency. This is the starting baseline for the revamp — not the target. Drift and inconsistencies are documented so we can fix them deliberately.

---

## Type scale (canonical 4 sizes + 2 headings)

Today's reality: 10 distinct sizes from `text-[8px]` to `text-[36px]` are in use. Top 4 represent **96 %** of all custom-sized text. Standardize on these and ban the rest:

| Token | Class | Usage | When to use |
|---|---|---|---|
| `eyebrow` | `text-[10px]` | 370× | Uppercase eyebrows, tag badges, table-cell timestamps |
| `caption` | `text-[11px]` | 666× | Labels, secondary metadata |
| `body` | `text-[12px]` | 771× | **Default body text**, table cells, dropdown items |
| `value` | `text-[13px]` | 543× | Form values, input text, dialog body |
| `sectionTitle` | `text-[14px]` | 55× | Card/section headers, dialog titles |
| `pageTitle` | `text-[16px]` | 4× → bump usage | Page H1s (currently inconsistent — many pages use 14px) |

**Ban list:** `text-[8px]`, `text-[9px]` (50× — too small to be readable), `text-[15px]` (61× — falls between 14 and 16; choose one), `text-[36px]` (1× — outlier).

---

## Spacing scale (4-px base)

Top spacing values follow a clean 4-px base. The `.5` variants (gap-1.5, py-1.5, etc.) are heavily used but break the rhythm.

| Value | Class | Usage | Verdict |
|---|---|---|---|
| 4 px | `gap-1 / p-1` | 139× | ✓ keep |
| 8 px | `gap-2 / p-2 / py-2` | 207× / 141× | ✓ canonical small |
| 12 px | `gap-3 / p-3 / px-3` | 140× / 358× | ✓ canonical default |
| 16 px | `gap-4 / p-4 / px-4` | low / 48× | ✓ canonical large |
| 24 px | `gap-6 / p-6` | low | ✓ section spacing |

**Drift to remove:** `gap-1.5` (185×), `px-2.5` (87×), `py-1.5` (104×), `py-2.5` (44×), `py-3.5` (49×). Collapse each to its nearest base-4 neighbor.

---

## Border radius (single dominant scale)

| Token | Class | Usage |
|---|---|---|
| `sm` | `rounded` (4 px) | 128× — chips, small badges |
| `md` | `rounded-md` (6 px) | 98× — icon buttons, dropdown items |
| **`lg`** | **`rounded-lg` (8 px)** | **381×** — **default for everything: buttons, inputs, cards** |
| `xl` | `rounded-xl` (12 px) | 55× — large cards, dialog panels |
| `full` | `rounded-full` | 111× — avatars, status pills |

**Drift:** `rounded-2xl`/`rounded-3xl` not used. `rounded-sm` (7×) effectively absent — keep ban.

---

## Heights (canonical control sizes)

| Token | Class | Usage | Use for |
|---|---|---|---|
| `xs` | `h-6` (24 px) | 82× | Pill badges |
| `sm` | `h-7` (28 px) | 202× | Icon-only buttons, ghost actions |
| `md` | `h-8` (32 px) | 219× | Compact buttons, filter selects |
| **`lg`** | **`h-9` (36 px)** | **266×** | **Default input/button height** |
| icon-md | `h-3 / h-3.5` | 200×+ | Inline icons (lucide default) |
| icon-lg | `h-4` (16 px) | 77× | Section icons |

**Ban list:** `h-10` (6× — outliers in old date pickers, drop), `h-2`/`h-2.5` (29× — used for progress bars, OK to keep but namespace them).

---

## Depth strategy

**Borders-first.** 133 files use `border-*`, 41 use `shadow-*`. Shadows are limited to:
- Cards-with-hover (`hover:shadow-sm`)
- Dropdowns/dialogs (`shadow-lg` from base-ui defaults)
- One-offs in `dashboard/page.tsx` widgets

**Rule:** Default depth = 1px border + bg contrast. Shadow only for floating layers (dropdowns, dialogs, toasts) and explicit hover-affordance.

---

## Slate-grey scale (foundation neutrals)

Spotworks is a slate-based interface. Top usages:

| Token | Class | Usage | Use for |
|---|---|---|---|
| `text-muted` | `text-slate-400` | 543× | Placeholder, disabled, eyebrow values |
| `text-secondary` | `text-slate-500` | 400× | Captions, labels |
| `text-body` | `text-slate-600` | 286× | Default body text |
| `text-emphasis` | `text-slate-700` | 182× | Form labels, value text |
| `text-heading` | `text-slate-800` | 128× | Section titles |
| `text-strong` | `text-slate-900` | 58× | Page titles (under-used today) |
| `border-default` | `border-slate-200` | 199× | Default border |
| `border-subtle` | `border-slate-100` | 57× | Section dividers |
| `bg-muted` | `bg-slate-50` | 152× | Header bands, panel backgrounds |
| `bg-subtle` | `bg-slate-100` | 52× | Hover states, alternating rows |

---

## Action colors (semantic, NOT raw)

Today's drift: `bg-blue-600` (86×), `bg-emerald-600` (~33×), `bg-green-600` (33×), `bg-purple-600`, `bg-[#10b981]` all mean **"primary save/confirm"** in different files.

**Target — 3 semantic slots only:**

| Token | Resolved class | Usage |
|---|---|---|
| `primary` | `bg-blue-600 hover:bg-blue-700` | Create, save, submit |
| `destructive` | `bg-red-600 hover:bg-red-700` | Delete, cancel-with-loss |
| `subtle` | `bg-slate-100 hover:bg-slate-200 text-slate-700` | Secondary actions |

**Status variants (for badges only, NOT buttons):**
- `success` → emerald-50/700 (completed, resolved)
- `warning` → amber-50/700 (overdue, pending)
- `info` → blue-50/700 (in-progress, scheduled)
- `danger` → red-50/700 (escalated, breached)
- `neutral` → slate-100/600 (closed, archived)

**Hex hardcodes to remove:** `#10b981` (17×), `#ecfdf5` (5×), `#3b82f6` (7×) — all should be Tailwind classes. `#e2e8f0` (19×) is just slate-200 — replace.

---

## Component patterns extracted

### Button (default)
- Height: `h-9` (36 px) for full buttons, `h-8` for filter buttons, `h-7` for icon-only
- Padding: `px-3` (default), `px-4` (wide), no padding for icon-only
- Radius: `rounded-lg`
- Text: `text-[12px]` for filters, `text-[13px]` for primary actions
- Icon size: `h-3.5 w-3.5` for filter buttons, `h-4 w-4` for primary buttons

### Card / Section
- Container: `rounded-xl border border-slate-200 bg-white`
- Header band: `bg-slate-50` + section padding `p-3` or `p-4`
- Inner padding: `p-3` (compact) / `p-5` (form)

### Table row
- Cell padding: `py-3.5 px-3` (drift — should standardize to `py-3 px-3`)
- Header text: `text-[10px] font-medium text-slate-400 uppercase tracking-wide`
- Body text: `text-[12px] text-slate-600` (or 13px for emphasis)
- Hover: `hover:bg-slate-50/60`

### Form field
- Label: `text-[11px] text-slate-500 mb-1.5`
- Input: `h-9 text-[13px] rounded-lg`
- Error: `text-[10px] text-red-500 mt-0.5`
- Error border: `border-red-400 ring-1 ring-red-200`

### Dialog
- Width: `sm:max-w-[400px]` (confirm) → `sm:max-w-[480px]` (form) → `sm:max-w-[600px]` (detail)
- Padding: `p-5`
- Header title: `text-[14px] font-semibold text-slate-800`

---

## Missing primitives (highest-leverage additions)

From the UI audit — these should be built before the module rebuilds start:

1. **`PageTabs`** — wraps `Tabs` with the `border-b-2 + icon + label` pattern. Replaces 19 hand-rolled tab strips.
2. **`FormField`** — `Label + control + error` triple. Replaces ~30 hand-rolled error states.
3. **`ActionMenu`** — `DropdownMenu` taking `{label, icon, onClick, destructive?}[]`. Replaces the 4–5 icon shelf pattern in 6+ modules.
4. **`SectionCard`** — `Card` with optional icon header + accent variant. Replaces `<div className="rounded-xl border border-slate-200 bg-white">` (~40 places).
5. **`DateRangePicker`** — over shadcn `Calendar` + `Popover`. Eliminates raw `<input type="date">`.
6. **`Pagination`** — codifies the next/prev + numbered page pattern (currently 5 variants).

---

## Files that violate the system today

Tracking via `/audit` will catch all. Known biggest offenders (from UI audit):

- `src/components/modules/daily-updates/update-tab.tsx` — gradient banners, native selects, raw tables
- `src/components/modules/attendance/attendance-tab.tsx` — 1300+ lines, mix of raw + shadcn
- `src/components/modules/daily-updates/{projects,vendor,water,complaints,power,hygiene}-tab.tsx` — all raw tables + 4-icon action shelves
- `src/app/(dashboard)/dashboard/page.tsx` — `bg-[#10b981]` hardcoded Go button
- `src/components/shared/kpi-card.tsx` — duplicate hex bug (blue and green variants identical)

Reference of what "good" looks like: `src/components/modules/daily-updates/tasks-tab.tsx` (refactored 2026-05-21).
