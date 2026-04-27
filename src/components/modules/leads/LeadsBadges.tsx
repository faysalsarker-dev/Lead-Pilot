import { cn } from "@/lib/utils"
import { LeadSource, LeadStatus } from "./data";

// ── Status badge ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<LeadStatus, { bg: string; text: string; label: string }> = {
  New:        { bg: "bg-blue-50 dark:bg-blue-950",   text: "text-blue-700 dark:text-blue-300",   label: "New"        },
  Contacted:  { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", label: "Contacted"  },
  Active:     { bg: "bg-green-50 dark:bg-green-950", text: "text-green-700 dark:text-green-300", label: "Active"     },
  Interested: { bg: "bg-teal-50 dark:bg-teal-950",   text: "text-teal-700 dark:text-teal-300",   label: "Interested" },
  Rejected:   { bg: "bg-red-50 dark:bg-red-950",     text: "text-red-700 dark:text-red-300",     label: "Rejected"   },
  Converted:  { bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", label: "Converted" },
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { bg, text, label } = STATUS_MAP[status]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", bg, text)}>
      {label}
    </span>
  )
}

// ── AI score badge ──────────────────────────────────────────────────────────
export function AiScoreBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    : score >= 5 ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"

  return (
    <span className={cn("inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium", color)}>
      {score}
    </span>
  )
}

// ── Work type badge ─────────────────────────────────────────────────────────
export function WorkTypeBadge({ type }: { type: "Service" | "Project" }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
      type === "Service"
        ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
        : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
    )}>
      {type}
    </span>
  )
}

// ── Source badge with icon ──────────────────────────────────────────────────
const SOURCE_MAP: Record<LeadSource, { color: string; icon: string }> = {
  Facebook:    { color: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",       icon: "f" },
  "Google Maps":{ color: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",          icon: "g" },
  LinkedIn:    { color: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",           icon: "in" },
  Instagram:   { color: "bg-pink-50 text-pink-700 dark:bg-pink-950 dark:text-pink-300",       icon: "ig" },
  Referral:    { color: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",   icon: "ref" },
  Manual:      { color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",      icon: "man" },
  Twitter:     { color: "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300",   icon: "x" },
}

export function SourceBadge({ source }: { source: LeadSource }) {
  const { color, icon } = SOURCE_MAP[source]
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", color)}>
      <span className="uppercase font-bold tracking-tight">{icon}</span>
      <span>{source}</span>
    </span>
  )
}

// ── Bool indicator (replied / interested / campaign) ───────────────────────
export function BoolBadge({
  value, trueLabel, falseLabel = "—", trueColor = "success",
}: {
  value: boolean
  trueLabel: string
  falseLabel?: string
  trueColor?: "success" | "info" | "warning"
}) {
  if (!value) return <span className="text-xs text-muted-foreground">{falseLabel}</span>

  const colorMap = {
    success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
    info:    "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  }

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", colorMap[trueColor])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {trueLabel}
    </span>
  )
}