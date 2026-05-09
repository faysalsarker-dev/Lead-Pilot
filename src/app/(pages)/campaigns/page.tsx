"use client";

import { useState } from "react";
import { useGetCampaignsQuery } from "@/redux/hooks";
import { CreateCampaignDialog } from "@/components/modules/campaigns/CreateCampaignDialog";
import { CampaignsTable } from "@/components/modules/campaigns/CampaignsDataTable";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatsGrid } from "@/components/modules/common/StatCard";
import { Activity, BookOpen, CheckCircle2 } from "lucide-react";

const ALL_CAMPAIGN_STATUSES = "ALL_CAMPAIGN_STATUSES";
type CampaignStatusFilter = typeof ALL_CAMPAIGN_STATUSES | "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";

export default function CampaignsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<CampaignStatusFilter>(ALL_CAMPAIGN_STATUSES);

  const { data: campaignsData, isLoading, isFetching } = useGetCampaignsQuery({
    page,
    limit,
    status: statusFilter === ALL_CAMPAIGN_STATUSES ? undefined : statusFilter,
  });

  const campaigns = campaignsData?.data || [];
  const pagination = campaignsData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const stats = {
    total: pagination.total,
    active: campaigns.filter((c) => c.status === "RUNNING").length,
    drafts: campaigns.filter((c) => c.status === "DRAFT").length,
    completed: campaigns.filter((c) => c.status === "COMPLETED").length,
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage email campaigns with automated follow-ups
          </p>
        </div>
        <CreateCampaignDialog />
      </div>

      {/* Stats Grid */}
      <StatsGrid title="Campaign Overview" columns={4} gap="md">
        <StatCard
          title="Total Campaigns"
          value={stats.total}
          icon={<BookOpen className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Active"
          value={stats.active}
          icon={<Activity className="h-5 w-5 text-green-500" />}
          description="Currently running"
        />
        <StatCard
          title="Draft"
          value={stats.drafts}
          icon={<BookOpen className="h-5 w-5 text-slate-500" />}
          description="Awaiting launch"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle2 className="h-5 w-5 text-purple-500" />}
          description="Finished campaigns"
        />
      </StatsGrid>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
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
            <div className="flex-1">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Rows per page
              </label>
              <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
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

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Campaigns ({pagination.total} total)
          </CardTitle>
          <CardDescription>
            Page {page} of {pagination.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing page {page} of {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            const pageNum = page > 3 ? page - 2 + i : i + 1;
            if (pageNum > pagination.totalPages) return null;
            return (
              <Button
                key={pageNum}
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
