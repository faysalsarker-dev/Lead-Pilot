import type { ReactNode } from "react";
import { Activity, CheckCircle2, MailCheck, Megaphone, MousePointer2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { dashboardData } from "./data";

type KpiCardProps = {
  label: string;
  value: string | number;
  sub: string;
  subType?: "up" | "down" | "neutral";
  accentColor: string;
  icon: ReactNode;
};

function KpiCard({
  label,
  value,
  sub,
  subType = "neutral",
  accentColor,
  icon,
}: KpiCardProps) {
  const subColor = {
    up: "text-emerald-700 dark:text-emerald-400",
    down: "text-red-700 dark:text-red-400",
    neutral: "text-muted-foreground",
  }[subType];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: accentColor }}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-semibold leading-none tracking-tight text-foreground">{value}</p>
      <p className={cn("mt-2 text-xs", subColor)}>{sub}</p>
    </div>
  );
}

export function KpiGrid() {
  const { kpis } = dashboardData;

  const cards: KpiCardProps[] = [
    {
      label: "Total Leads",
      value: kpis.totalLeads,
      sub: `+${kpis.totalLeadsDelta} this week`,
      subType: "up",
      accentColor: "#2563eb",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Active Leads",
      value: kpis.activeLeads,
      sub: `${kpis.activeLeadsPct}% of total`,
      subType: "neutral",
      accentColor: "#059669",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      label: "Interested",
      value: kpis.interested,
      sub: `+${kpis.interestedDelta} this week`,
      subType: "up",
      accentColor: "#b45309",
      icon: <MousePointer2 className="h-4 w-4" />,
    },
    {
      label: "Converted",
      value: kpis.converted,
      sub: `+${kpis.convertedDelta} this week`,
      subType: "up",
      accentColor: "#0f766e",
      icon: <CheckCircle2 className="h-4 w-4" />,
    },
    {
      label: "Campaigns",
      value: kpis.runningCampaigns,
      sub: "running now",
      subType: "neutral",
      accentColor: "#ea580c",
      icon: <Megaphone className="h-4 w-4" />,
    },
    {
      label: "Avg Reply Rate",
      value: `${kpis.avgReplyRate}%`,
      sub: `+${kpis.avgReplyRateDelta}% vs last batch`,
      subType: "up",
      accentColor: "#7c3aed",
      icon: <MailCheck className="h-4 w-4" />,
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-6">
      {cards.map((card) => (
        <KpiCard key={card.label} {...card} />
      ))}
    </div>
  );
}
