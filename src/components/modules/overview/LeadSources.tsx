import { dashboardData } from "./data"

export function LeadSources() {
  const { leadSources } = dashboardData
  const max = leadSources[0].count

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Lead sources</p>
        <p className="text-xs text-muted-foreground">where leads come from</p>
      </div>

      <div className="space-y-2.5">
        {leadSources.map(({ source, count, color }) => {
          const pct = Math.round((count / max) * 100)
          return (
            <div key={source} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs text-muted-foreground">{source}</span>
              <div className="flex-1 h-2 rounded-sm bg-muted overflow-hidden">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs text-muted-foreground/60">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}