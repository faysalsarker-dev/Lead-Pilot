import Link from "next/link"
import { cn } from "@/lib/utils"
import { dashboardData } from "./data"

const STATUS_STYLES: Record<string, string> = {
  Active:     "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  Interested: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Contacted:  "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
}

export function RecentReplies() {
  const { recentReplies } = dashboardData

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Recent replies</p>
        <p className="text-xs text-muted-foreground">unread first</p>
      </div>

      <div className="divide-y">
        {recentReplies.map((reply) => (
          <div key={reply.name} className="flex items-start gap-2.5 py-2.5">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-medium"
              style={{ backgroundColor: reply.avatarBg, color: reply.avatarColor }}
            >
              {reply.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[13px] font-medium text-foreground">
                  {reply.name}
                </span>
                <span
                  className={cn(
                    "inline-block rounded-full px-1.5 py-px text-[10px] font-medium",
                    STATUS_STYLES[reply.status] ?? "bg-muted text-muted-foreground"
                  )}
                >
                  {reply.status}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">{reply.business}</p>
              <p className="text-[12px] text-muted-foreground/70 truncate mt-0.5">
                {reply.snippet}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              {reply.unread && (
                <span className="h-2 w-2 rounded-full bg-red-500" />
              )}
              <span className="text-[11px] text-muted-foreground/60">{reply.time}</span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/inbox"
        className="mt-3 flex w-full items-center justify-center rounded-md border border-border py-1.5 text-xs text-muted-foreground hover:bg-muted transition-colors"
      >
        View all in Inbox →
      </Link>
    </div>
  )
}