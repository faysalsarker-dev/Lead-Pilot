"use client";

import { use } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Mail, Pause, Play, RotateCcw, Send, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatsGrid } from "@/components/modules/common/StatCard";
import { useGetCampaignQuery, useLaunchCampaignMutation, usePauseCampaignMutation, useResumeCampaignMutation } from "@/redux/hooks";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useGetCampaignQuery(id);
  const [launchCampaign, { isLoading: isLaunching }] = useLaunchCampaignMutation();
  const [pauseCampaign, { isLoading: isPausing }] = usePauseCampaignMutation();
  const [resumeCampaign, { isLoading: isResuming }] = useResumeCampaignMutation();
  const campaign = data?.data;

  async function runAction(action: "launch" | "pause" | "resume") {
    try {
      if (action === "launch") await launchCampaign(id).unwrap();
      if (action === "pause") await pauseCampaign(id).unwrap();
      if (action === "resume") await resumeCampaign(id).unwrap();
      toast.success(`Campaign ${action === "launch" ? "launched" : action === "pause" ? "paused" : "resumed"}`);
    } catch {
      toast.error(`Failed to ${action} campaign`);
    }
  }

  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="w-full max-w-3xl p-6 space-y-4">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/campaigns"><ArrowLeft className="h-4 w-4" />Back to Campaigns</Link>
        </Button>
        <Card><CardHeader><CardTitle>Campaign not found</CardTitle><CardDescription>This campaign could not be loaded.</CardDescription></CardHeader></Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="w-fit gap-2 px-0">
            <Link href="/campaigns"><ArrowLeft className="h-4 w-4" />Back to Campaigns</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge>{campaign.status}</Badge>
              <span className="text-sm text-muted-foreground">Created {new Date(campaign.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {campaign.status === "DRAFT" && <Button onClick={() => runAction("launch")} disabled={isLaunching} className="gap-2"><Send className="h-4 w-4" />Launch</Button>}
          {campaign.status === "RUNNING" && <Button onClick={() => runAction("pause")} disabled={isPausing} variant="outline" className="gap-2"><Pause className="h-4 w-4" />Pause</Button>}
          {campaign.status === "PAUSED" && <Button onClick={() => runAction("resume")} disabled={isResuming} className="gap-2"><Play className="h-4 w-4" />Resume</Button>}
        </div>
      </div>

      <StatsGrid title="Performance" columns={4} gap="md">
        <StatCard title="Leads" value={campaign.leadCount || 0} icon={<Users className="h-5 w-5" />} accentClassName="bg-blue-50 text-blue-600" />
        <StatCard title="Sent" value={campaign.sentCount || 0} icon={<Mail className="h-5 w-5" />} accentClassName="bg-emerald-50 text-emerald-600" />
        <StatCard title="Send Window" value={campaign.sendWindow || `${campaign.sendWindowStart || 9}:00-${campaign.sendWindowEnd || 17}:00`} icon={<RotateCcw className="h-5 w-5" />} accentClassName="bg-amber-50 text-amber-600" />
        <StatCard title="Follow-up 1" value={`${campaign.followup1Days || campaign.followupDay1 || 3} days`} icon={<Send className="h-5 w-5" />} accentClassName="bg-violet-50 text-violet-600" />
      </StatsGrid>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Setup</CardTitle>
            <CardDescription>Mailbox and template references used by this campaign.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><p className="text-xs uppercase text-muted-foreground">Mailbox ID</p><p className="mt-1 break-all text-sm">{campaign.mailboxId}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Initial Template</p><p className="mt-1 break-all text-sm">{campaign.initialTemplateId}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Follow-up 1</p><p className="mt-1 break-all text-sm">{campaign.followup1TemplateId || "None"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Follow-up 2</p><p className="mt-1 break-all text-sm">{campaign.followup2TemplateId || "None"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Final</p><p className="mt-1 break-all text-sm">{campaign.finalTemplateId || "None"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Launched</p><p className="mt-1 text-sm">{campaign.launchedAt ? new Date(campaign.launchedAt).toLocaleString() : "Not launched"}</p></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notes and Body</CardTitle>
            <CardDescription>Draft fields stored on the campaign record.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><p className="text-xs uppercase text-muted-foreground">Subject</p><p className="mt-1 text-sm">{campaign.subject || "Template subject will be used"}</p></div>
            <div><p className="text-xs uppercase text-muted-foreground">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{campaign.notes || "No notes."}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
