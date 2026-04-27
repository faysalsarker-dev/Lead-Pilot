import { Lead } from "./data";

interface Props { leads: Lead[]; total: number }

export function LeadStatStrip({ leads, total }: Props) {
  const counts = {
    active:     leads.filter(l => l.isActive).length,
    interested: leads.filter(l => l.isInterested).length,
    replied:    leads.filter(l => l.hasReplied).length,
    running:    leads.filter(l => l.campaignRunning).length,
  }

  const stats = [
    { label: "Total",      value: total,             color: "text-foreground" },
    { label: "Active",     value: counts.active,     color: "text-green-600 dark:text-green-400" },
    { label: "Interested", value: counts.interested, color: "text-teal-600 dark:text-teal-400" },
    { label: "Replied",    value: counts.replied,    color: "text-blue-600 dark:text-blue-400" },
    { label: "In campaign",value: counts.running,    color: "text-amber-600 dark:text-amber-400" },
  ]

  return (
    <div className="flex items-center gap-5 mb-3 px-1">
      {stats.map(({ label, value, color }, i) => (
        <span key={label} className="flex items-baseline gap-1.5 text-xs">
          {i > 0 && <span className="text-border mr-2">|</span>}
          <span className={`font-semibold text-sm ${color}`}>{value}</span>
          <span className="text-muted-foreground">{label}</span>
        </span>
      ))}
    </div>
  )
}
