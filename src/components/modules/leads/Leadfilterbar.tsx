"use client"

import { useCallback } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { BUSINESS_TYPES, COUNTRIES, LeadSource, LeadStatus, SOURCES, STATUSES } from "./data"


export interface LeadFilters {
  search: string
  status: LeadStatus | "All"
  workType: "All" | "Service" | "Project"
  source: LeadSource | "All"
  businessType: string
  country: string
  hasReplied: "All" | "Yes" | "No"
  isInterested: "All" | "Yes" | "No"
  campaignRunning: "All" | "Yes" | "No"
  scoreMin: string
  scoreMax: string
}

export const DEFAULT_FILTERS: LeadFilters = {
  search: "", status: "All", workType: "All", source: "All",
  businessType: "All", country: "All", hasReplied: "All",
  isInterested: "All", campaignRunning: "All", scoreMin: "", scoreMax: "",
}

function activeCount(f: LeadFilters): number {
  return [
    f.search, f.status !== "All", f.workType !== "All", f.source !== "All",
    f.businessType !== "All", f.country !== "All", f.hasReplied !== "All",
    f.isInterested !== "All", f.campaignRunning !== "All", f.scoreMin, f.scoreMax,
  ].filter(Boolean).length
}

interface Props {
  filters: LeadFilters
  onChange: (f: LeadFilters) => void
}

export function LeadFilterBar({ filters, onChange }: Props) {
  const set = useCallback(
    (patch: Partial<LeadFilters>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  )

  const count = activeCount(filters)

  return (
    <div className="rounded-lg border bg-card p-3 mb-4">
      {/* Row 1: search + status + work type + source */}
      <div className="flex flex-wrap gap-2 mb-2">
        <div className="relative flex-1 min-w-[180px]">
          <Input
            placeholder="Search name, business, email…"
            value={filters.search}
            onChange={e => set({ search: e.target.value })}
            className="h-8 text-xs pl-3"
          />
        </div>

        <Select value={filters.status} onValueChange={v => set({ status: v as LeadFilters["status"] })}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Work type — button group */}
        <div className="flex rounded-md border overflow-hidden h-8">
          {(["All", "Service", "Project"] as const).map(t => (
            <button
              key={t}
              onClick={() => set({ workType: t })}
              className={`px-3 text-xs transition-colors ${
                filters.workType === t
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Select value={filters.source} onValueChange={v => set({ source: v as LeadFilters["source"] })}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All sources</SelectItem>
            {SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Row 2: business type + country + replied + interested + campaign + score */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filters.businessType} onValueChange={v => set({ businessType: v })}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="Business type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            {BUSINESS_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.country} onValueChange={v => set({ country: v })}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All countries</SelectItem>
            {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filters.hasReplied} onValueChange={v => set({ hasReplied: v as LeadFilters["hasReplied"] })}>
          <SelectTrigger className="h-8 w-[110px] text-xs">
            <SelectValue placeholder="Replied" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Replied: all</SelectItem>
            <SelectItem value="Yes">Replied: yes</SelectItem>
            <SelectItem value="No">Replied: no</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.isInterested} onValueChange={v => set({ isInterested: v as LeadFilters["isInterested"] })}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue placeholder="Interested" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Interest: all</SelectItem>
            <SelectItem value="Yes">Interested</SelectItem>
            <SelectItem value="No">Not interested</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.campaignRunning} onValueChange={v => set({ campaignRunning: v as LeadFilters["campaignRunning"] })}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Campaign: all</SelectItem>
            <SelectItem value="Yes">In campaign</SelectItem>
            <SelectItem value="No">No campaign</SelectItem>
          </SelectContent>
        </Select>

        {/* AI score range */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Score</span>
          <Input
            type="number" min={1} max={10}
            placeholder="Min"
            value={filters.scoreMin}
            onChange={e => set({ scoreMin: e.target.value })}
            className="h-8 w-14 text-xs"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <Input
            type="number" min={1} max={10}
            placeholder="Max"
            value={filters.scoreMax}
            onChange={e => set({ scoreMax: e.target.value })}
            className="h-8 w-14 text-xs"
          />
        </div>

        {count > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground ml-auto"
            onClick={() => onChange(DEFAULT_FILTERS)}
          >
            <X className="h-3 w-3 mr-1" />
            Clear ({count})
          </Button>
        )}
      </div>
    </div>
  )
}