import { cn } from "@/lib/utils"
import { dashboardData } from "./data"

const STATUS_STYLES: Record<string, string> = {
  Running: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Done:    "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
  Paused:  "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
}

function replyRateColor(rate: number) {
  if (rate >= 15) return "text-green-700 dark:text-green-400"
  if (rate >= 7)  return "text-amber-700 dark:text-amber-400"
  return "text-red-700 dark:text-red-400"
}

export function CampaignTable() {
  const { campaigns } = dashboardData

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Campaign performance</p>
        <p className="text-xs text-muted-foreground">last 5 campaigns</p>
      </div>

      <div className="flex gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/60 pb-2 border-b mb-1">
        <span className="flex-1">Name</span>
        <span className="w-10 text-right">Sent</span>
        <span className="w-12 text-right">Reply%</span>
        <span className="w-14 text-right">Status</span>
      </div>

      <div className="divide-y">
        {campaigns.map(({ name, sent, replyRate, status }) => (
          <div key={name} className="flex items-center gap-1.5 py-2.5 text-xs">
            <span className="flex-1 font-medium text-foreground truncate" title={name}>
              {name}
            </span>
            <span className="w-10 text-right text-muted-foreground">{sent}</span>
            <span className={cn("w-12 text-right font-medium", replyRateColor(replyRate))}>
              {replyRate}%
            </span>
            <span className="w-14 text-right">
              <span className={cn("inline-block rounded-full px-2 py-0.5 text-[10px] font-medium", STATUS_STYLES[status])}>
                {status}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}