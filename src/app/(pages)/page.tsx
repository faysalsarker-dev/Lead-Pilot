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
    <div className="w-full max-w-none bg-slate-50/60 p-6">
      <DashboardHeader />
      <KpiGrid />

      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <LeadPipeline />
        <ActivityChart />
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <CampaignTable />
        <RecentReplies />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <WorkTypeSplit />
        <LeadSources />
        <FollowUpsDue />
      </div>
    </div>
  );
}
