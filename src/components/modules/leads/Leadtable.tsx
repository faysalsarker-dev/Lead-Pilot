"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Eye, Pencil, Trash2, ChevronUp, ChevronDown, ChevronsUpDown,
  MessageCircle, Phone
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Lead } from "./data"
import { AiScoreBadge, BoolBadge, SourceBadge, StatusBadge, WorkTypeBadge } from "./LeadsBadges"


type SortKey = "name" | "status" | "aiScore" | "addedAt" | "lastContacted"
type SortDir = "asc" | "desc"

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="h-3 w-3 text-muted-foreground/40" />
  return dir === "asc"
    ? <ChevronUp className="h-3 w-3 text-foreground" />
    : <ChevronDown className="h-3 w-3 text-foreground" />
}

function formatDate(d: string | null) {
  if (!d) return <span className="text-muted-foreground">—</span>
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
}

interface Props {
  leads: Lead[]
  onDelete: (id: string) => void
  selectedIds: Set<string>
  onSelectChange: (ids: Set<string>) => void
}

export function LeadTable({ leads, onDelete, selectedIds, onSelectChange }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("addedAt")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortKey(key); setSortDir("asc") }
  }

  const sorted = [...leads].sort((a, b) => {
    let av: string | number = a[sortKey] ?? ""
    let bv: string | number = b[sortKey] ?? ""
    if (sortKey === "aiScore") { av = a.aiScore; bv = b.aiScore }
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === "asc" ? cmp : -cmp
  })

  const allSelected = leads.length > 0 && leads.every(l => selectedIds.has(l.id))

  function toggleAll() {
    if (allSelected) onSelectChange(new Set())
    else onSelectChange(new Set(leads.map(l => l.id)))
  }

  function toggleOne(id: string) {
    const next = new Set(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectChange(next)
  }

  function SortHead({ label, col, className = "" }: { label: string; col: SortKey; className?: string }) {
    return (
      <TableHead
        className={`cursor-pointer select-none whitespace-nowrap ${className}`}
        onClick={() => toggleSort(col)}
      >
        <span className="flex items-center gap-1 text-xs">
          {label}
          <SortIcon active={sortKey === col} dir={sortDir} />
        </span>
      </TableHead>
    )
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border bg-card flex flex-col items-center justify-center py-20 text-muted-foreground">
        <span className="text-4xl mb-3">🔍</span>
        <p className="font-medium text-sm">No leads match your filters</p>
        <p className="text-xs mt-1">Try clearing some filters to see more results</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
            </TableHead>
            <SortHead label="Lead"         col="name"          className="min-w-[160px]" />
            <TableHead className="text-xs min-w-[160px]">Contact</TableHead>
            <TableHead className="text-xs">Type</TableHead>
            <SortHead label="Status"       col="status"        />
            <TableHead className="text-xs">Replied</TableHead>
            <TableHead className="text-xs">Interested</TableHead>
            <TableHead className="text-xs">Campaign</TableHead>
            <TableHead className="text-xs">Source</TableHead>
            <SortHead label="Score"        col="aiScore"       className="w-16" />
            <SortHead label="Added"        col="addedAt"       className="w-24" />
            <SortHead label="Last contact" col="lastContacted" className="w-28" />
            <TableHead className="text-xs w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {sorted.map((lead, i) => (
            <TableRow
              key={lead.id}
              className={`group text-sm transition-colors ${selectedIds.has(lead.id) ? "bg-blue-50/50 dark:bg-blue-950/20" : ""}`}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  onCheckedChange={() => toggleOne(lead.id)}
                  aria-label={`Select ${lead.name}`}
                />
              </TableCell>

              {/* Lead */}
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
                    style={{
                      backgroundColor: `hsl(${(lead.name.charCodeAt(0) * 37) % 360} 60% 92%)`,
                      color: `hsl(${(lead.name.charCodeAt(0) * 37) % 360} 50% 35%)`,
                    }}
                  >
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-xs text-foreground truncate">{lead.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{lead.business}</p>
                    <p className="text-[10px] text-muted-foreground/60">{lead.country}</p>
                  </div>
                </div>
              </TableCell>

              {/* Contact */}
              <TableCell>
                <div className="space-y-0.5">
                  <a href={`mailto:${lead.email}`} className="block text-[11px] text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[150px]">
                    {lead.email}
                  </a>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />{lead.phone}
                  </p>
                  {lead.whatsapp && (
                    <a
                      href={`https://wa.me/${lead.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-green-600 dark:text-green-400 hover:underline"
                    >
                      <MessageCircle className="h-3 w-3" />WA
                    </a>
                  )}
                </div>
              </TableCell>

              {/* Work type */}
              <TableCell><WorkTypeBadge type={lead.workType} /></TableCell>

              {/* Status */}
              <TableCell><StatusBadge status={lead.status} /></TableCell>

              {/* Replied */}
              <TableCell>
                <BoolBadge value={lead.hasReplied} trueLabel="Replied" trueColor="success" />
              </TableCell>

              {/* Interested */}
              <TableCell>
                <BoolBadge value={lead.isInterested} trueLabel="Interested" trueColor="info" />
              </TableCell>

              {/* Campaign running */}
              <TableCell>
                <BoolBadge value={lead.campaignRunning} trueLabel="Running" trueColor="warning" />
              </TableCell>

              {/* Source */}
              <TableCell><SourceBadge source={lead.source} /></TableCell>

              {/* AI Score */}
              <TableCell><AiScoreBadge score={lead.aiScore} /></TableCell>

              {/* Added */}
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(lead.addedAt)}
              </TableCell>

              {/* Last contacted */}
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(lead.lastContacted)}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={`/leads/${lead.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={`/leads/${lead.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {lead.name}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently remove {lead.name} from {lead.business} and all their campaign history. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => onDelete(lead.id)}
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}