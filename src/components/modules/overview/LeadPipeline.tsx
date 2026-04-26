import { dashboardData } from "./data"

export function LeadPipeline() {
  const { pipeline } = dashboardData
  const max = pipeline[0].count

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Lead pipeline</p>
        <p className="text-xs text-muted-foreground">where are leads dropping off?</p>
      </div>

      <div className="space-y-2.5">
        {pipeline.map(({ status, count, color }) => {
          const pct = Math.round((count / max) * 100)
          return (
            <div key={status} className="flex items-center gap-2.5">
              <span className="w-[72px] shrink-0 text-xs text-muted-foreground">
                {status}
              </span>
              <div className="flex-1 h-2.5 rounded-sm bg-muted overflow-hidden">
                <div
                  className="h-full rounded-sm transition-all"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-7 shrink-0 text-right text-xs text-muted-foreground">
                {count}
              </span>
              <span className="w-8 shrink-0 text-right text-[10px] text-muted-foreground/60">
                {pct}%
              </span>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-[11px] text-muted-foreground/70 border-t pt-3">
        Biggest drop: Interested → Converted. Focus on closing.
      </p>
    </div>
  )
}