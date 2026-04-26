import { cn } from "@/lib/utils"
import { dashboardData } from "./data"

type KpiCardProps = {
  label: string
  value: string | number
  sub: string
  subType?: "up" | "down" | "neutral"
  accentColor: string
}

function KpiCard({ label, value, sub, subType = "neutral", accentColor }: KpiCardProps) {
  const subColor = {
    up:      "text-green-700 dark:text-green-400",
    down:    "text-red-700 dark:text-red-400",
    neutral: "text-muted-foreground",
  }[subType]

  return (
    <div
      className="rounded-md bg-muted/50 px-4 py-3.5 border-l-[3px]"
      style={{ borderLeftColor: accentColor }}
    >
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
        {label}
      </p>
      <p className="text-[26px] font-medium leading-none text-foreground">
        {value}
      </p>
      <p className={cn("text-[11px] mt-1.5", subColor)}>{sub}</p>
    </div>
  )
}

export function KpiGrid() {
  const { kpis } = dashboardData

  const cards: KpiCardProps[] = [
    {
      label: "Total Leads",
      value: kpis.totalLeads,
      sub: `↑ ${kpis.totalLeadsDelta} this week`,
      subType: "up",
      accentColor: "#378ADD",
    },
    {
      label: "Active Leads",
      value: kpis.activeLeads,
      sub: `${kpis.activeLeadsPct}% of total`,
      subType: "neutral",
      accentColor: "#639922",
    },
    {
      label: "Interested",
      value: kpis.interested,
      sub: `↑ ${kpis.interestedDelta} this week`,
      subType: "up",
      accentColor: "#BA7517",
    },
    {
      label: "Converted",
      value: kpis.converted,
      sub: `↑ ${kpis.convertedDelta} this week`,
      subType: "up",
      accentColor: "#1D9E75",
    },
    {
      label: "Campaigns",
      value: kpis.runningCampaigns,
      sub: "running now",
      subType: "neutral",
      accentColor: "#D85A30",
    },
    {
      label: "Avg Reply Rate",
      value: `${kpis.avgReplyRate}%`,
      sub: `↑ ${kpis.avgReplyRateDelta}% vs last batch`,
      subType: "up",
      accentColor: "#7F77DD",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-5">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  )
}