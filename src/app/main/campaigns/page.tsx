"use client";

import { useState } from "react";
import Link from "next/link";
import { CreateCampaignDialog } from "@/components/modules/campaigns/CreateCampaignDialog";
import { CampaignsTable } from "@/components/modules/campaigns/CampaignsDataTable";
import { Pagination } from "@/components/modules/common/Pagination";
import { StatCard, StatsGrid } from "@/components/modules/common/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useGetCampaignsQuery } from "@/redux/hooks";
import { Activity, BookOpen, CheckCircle2, Filter } from "lucide-react";

const ALL_CAMPAIGN_STATUSES = "ALL_CAMPAIGN_STATUSES";
type CampaignStatusFilter =
  | typeof ALL_CAMPAIGN_STATUSES
  | "DRAFT"
  | "RUNNING"
  | "PAUSED"
  | "COMPLETED";

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] =
    useState<CampaignStatusFilter>(ALL_CAMPAIGN_STATUSES);

  const { data: campaignsData, isLoading, isFetching } = useGetCampaignsQuery({
    page,
    limit,
    status: statusFilter === ALL_CAMPAIGN_STATUSES ? undefined : statusFilter,
  });

  const campaigns = campaignsData?.data || [];
  const pagination = campaignsData?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const stats = {
    total: pagination.total,
    active: campaigns.filter((campaign) => campaign.status === "RUNNING").length,
    drafts: campaigns.filter((campaign) => campaign.status === "DRAFT").length,
    completed: campaigns.filter((campaign) => campaign.status === "COMPLETED").length,
  };

  return (
    <div className="w-full max-w-none p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage email campaigns with automated follow-ups
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href="/campaigns/new">New Campaign</Link>
          </Button>
          <CreateCampaignDialog />
        </div>
      </div>

      <StatsGrid title="Campaign Overview" columns={4} gap="md">
        <StatCard
          title="Total Campaigns"
          value={stats.total}
          icon={<BookOpen className="h-5 w-5" />}
          accentClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={<Activity className="h-5 w-5" />}
          accentClassName="bg-emerald-50 text-emerald-600"
          description="Currently running"
        />
        <StatCard
          title="Draft"
          value={stats.drafts}
          icon={<BookOpen className="h-5 w-5" />}
          accentClassName="bg-slate-100 text-slate-700"
          description="Awaiting launch"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5" />}
          accentClassName="bg-violet-50 text-violet-600"
          description="Finished campaigns"
        />
      </StatsGrid>

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:max-w-3xl">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as CampaignStatusFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CAMPAIGN_STATUSES}>All statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="RUNNING">Running</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Rows per page
              </label>
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-base">Campaigns</CardTitle>
              <CardDescription>
                {pagination.total} total campaigns across {pagination.totalPages} page
                {pagination.totalPages === 1 ? "" : "s"}
              </CardDescription>
            </div>
            {isFetching && (
              <span className="text-sm text-muted-foreground">Refreshing...</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <CampaignsTable
            campaigns={campaigns}
            isLoading={isFetching}
            onEdit={(campaign) => {
              console.log("Edit campaign:", campaign);
            }}
            onDelete={(id) => {
              console.log("Delete campaign:", id);
            }}
          />
        </CardContent>
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={setPage}
        />
      </Card>
    </div>
  );
}
