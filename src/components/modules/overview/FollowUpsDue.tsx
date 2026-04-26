import { dashboardData } from "./data"

export function FollowUpsDue() {
  const { followUps } = dashboardData

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Follow-ups due</p>
        <p className="text-xs text-muted-foreground">today &amp; tomorrow</p>
      </div>

      <div className="divide-y">
        {followUps.map(({ name, daysSince }) => (
          <div key={name} className="flex items-center gap-3 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{name}</p>
              <p className="text-[11px] text-muted-foreground">
                No reply · {daysSince} days since contact
              </p>
            </div>
            <button className="shrink-0 rounded-md border border-border bg-transparent px-2.5 py-1 text-[11px] text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
              Send ↗
            </button>
          </div>
        ))}
      </div>

      <p className="mt-3 border-t pt-3 text-[11px] text-muted-foreground/70">
        Most replies come on follow-up 2 — don&apos;t skip these.
      </p>
    </div>
  )
}