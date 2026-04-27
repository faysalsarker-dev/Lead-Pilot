
"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Plus, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Lead, LEADS, LeadStatus } from "@/components/modules/leads/data"
import { DEFAULT_FILTERS, LeadFilterBar, LeadFilters } from "@/components/modules/leads/Leadfilterbar"
import { LeadStatStrip } from "@/components/modules/leads/LeadStatStrip"
import { BulkActionBar } from "@/components/modules/leads/BulkActionBar"
import { LeadTable } from "@/components/modules/leads/Leadtable"
import { LeadPagination } from "@/components/modules/leads/LeadPagination"



const PER_PAGE = 8

function applyFilters(leads: Lead[], f: LeadFilters): Lead[] {
  return leads.filter(l => {
    const q = f.search.toLowerCase()
    if (q && ![l.name, l.business, l.email].some(v => v.toLowerCase().includes(q))) return false
    if (f.status       !== "All" && l.status       !== f.status)                    return false
    if (f.workType     !== "All" && l.workType     !== f.workType)                  return false
    if (f.source       !== "All" && l.source       !== f.source)                    return false
    if (f.businessType !== "All" && l.businessType !== f.businessType)              return false
    if (f.country      !== "All" && l.country      !== f.country)                   return false
    if (f.hasReplied   === "Yes" && !l.hasReplied)                                  return false
    if (f.hasReplied   === "No"  &&  l.hasReplied)                                  return false
    if (f.isInterested === "Yes" && !l.isInterested)                                return false
    if (f.isInterested === "No"  &&  l.isInterested)                                return false
    if (f.campaignRunning === "Yes" && !l.campaignRunning)                          return false
    if (f.campaignRunning === "No"  &&  l.campaignRunning)                          return false
    if (f.scoreMin && l.aiScore < Number(f.scoreMin))                               return false
    if (f.scoreMax && l.aiScore > Number(f.scoreMax))                               return false
    return true
  })
}

export default function LeadsPage() {
  const [leads, setLeads]             = useState<Lead[]>(LEADS)
  const [filters, setFilters]         = useState<LeadFilters>(DEFAULT_FILTERS)
  const [page, setPage]               = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => applyFilters(leads, filters), [leads, filters])
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleFilterChange(f: LeadFilters) {
    setFilters(f)
    setPage(1)
    setSelectedIds(new Set())
  }

  function handleDelete(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n })
    toast.success("Lead deleted")
  }

  function handleBulkDelete() {
    setLeads(prev => prev.filter(l => !selectedIds.has(l.id)))
    toast.success(`${selectedIds.size} leads deleted`)
    setSelectedIds(new Set())
  }

  function handleBulkStatus(status: LeadStatus) {
    setLeads(prev =>
      prev.map(l => selectedIds.has(l.id) ? { ...l, status } : l)
    )
    toast.success(`${selectedIds.size} leads updated to ${status}`)
    setSelectedIds(new Set())
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Leads</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage and track all your outreach prospects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" asChild>
            <Link href="/leads/import">
              <Upload className="h-3.5 w-3.5" />
              Import CSV
            </Link>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" asChild>
            <Link href="/leads/add">
              <Plus className="h-3.5 w-3.5" />
              Add Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <LeadFilterBar filters={filters} onChange={handleFilterChange} />

      {/* ── Quick stat strip ── */}
      <LeadStatStrip leads={filtered} total={filtered.length} />

      {/* ── Bulk action bar (visible when rows selected) ── */}
      <BulkActionBar
        count={selectedIds.size}
        onClearSelection={() => setSelectedIds(new Set())}
        onBulkStatus={handleBulkStatus}
        onBulkDelete={handleBulkDelete}
      />

      {/* ── Table ── */}
      <LeadTable
        leads={paginated}
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelectChange={setSelectedIds}
      />

      {/* ── Pagination ── */}
      <LeadPagination
        total={filtered.length}
        page={page}
        perPage={PER_PAGE}
        onPageChange={setPage}
      />

    </div>
  )
}