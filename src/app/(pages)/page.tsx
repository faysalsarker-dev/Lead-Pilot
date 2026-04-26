import { ActivityChart } from "@/components/modules/overview/ActivityChart";
import { CampaignTable } from "@/components/modules/overview/CampaignTable";
import { DashboardHeader } from "@/components/modules/overview/DashboardHeader";
import { FollowUpsDue } from "@/components/modules/overview/FollowUpsDue";
import { KpiGrid } from "@/components/modules/overview/KpiCard";
import { LeadPipeline } from "@/components/modules/overview/LeadPipeline";
import { LeadSources } from "@/components/modules/overview/LeadSources";
import { RecentReplies } from "@/components/modules/overview/RecentReplies";
import { WorkTypeSplit } from "@/components/modules/overview/WorkTypeSplit";


export default function DashboardPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto">

      {/* Greeting + alert bar */}
      <DashboardHeader />

      {/* Row 1 — 6 KPI stat cards */}
      <KpiGrid />

      {/* Row 2 — Pipeline funnel + Activity chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
        <LeadPipeline />
        <ActivityChart />
      </div>

      {/* Row 3 — Campaign table + Recent replies */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-3 mb-3">
        <CampaignTable />
        <RecentReplies />
      </div>

      {/* Row 4 — Work type split + Lead sources + Follow-ups */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <WorkTypeSplit />
        <LeadSources />
        <FollowUpsDue />
      </div>

    </div>
  )
}