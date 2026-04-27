"use client"

import { Trash2, Tag, BarChart2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LeadStatus, STATUSES } from "./data"


interface Props {
  count: number
  onClearSelection: () => void
  onBulkStatus: (status: LeadStatus) => void
  onBulkDelete: () => void
}

export function BulkActionBar({ count, onClearSelection, onBulkStatus, onBulkDelete }: Props) {
  if (count === 0) return null

  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 px-4 py-2 mb-3 text-sm">
      <span className="font-medium text-blue-700 dark:text-blue-300">
        {count} lead{count > 1 ? "s" : ""} selected
      </span>

      <div className="flex items-center gap-2 ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <BarChart2 className="h-3 w-3" />
              Change status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUSES.map(s => (
              <DropdownMenuItem key={s} onClick={() => onBulkStatus(s)}>
                {s}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Tag className="h-3 w-3" />
          Add tag
        </Button>

        <Button
          variant="outline" size="sm"
          className="h-7 text-xs gap-1 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={onBulkDelete}
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </Button>
      </div>

      <Button
        variant="ghost" size="icon" className="h-7 w-7 ml-auto"
        onClick={onClearSelection}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
