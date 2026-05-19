"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreateLeadDialog } from "@/components/modules/leads/CreateLeadDialog";
import { LeadsTable } from "@/components/modules/leads/LeadsDataTable";
import { Pagination } from "@/components/modules/common/Pagination";
import { StatCard, StatsGrid } from "@/components/modules/common/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {  
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetLeadsQuery } from "@/redux/hooks";
import { Filter, MessageSquare, Search, TrendingUp, Upload, Users, Zap } from "lucide-react";
import type { Lead } from "@/redux/features/leads/leads.api";

const ALL_STATUSES = "ALL_STATUSES";
const ALL_AI_ENRICHMENT = "ALL_AI_ENRICHMENT";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | typeof ALL_STATUSES>(
    ALL_STATUSES
  );
  const [aiEnrichedFilter, setAiEnrichedFilter] = useState<
    typeof ALL_AI_ENRICHMENT | "enriched" | "not-enriched"
  >(ALL_AI_ENRICHMENT);

  const { data: leadsData, isLoading, isFetching } = useGetLeadsQuery({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter === ALL_STATUSES ? undefined : statusFilter,
    aiEnriched:
      aiEnrichedFilter === ALL_AI_ENRICHMENT
        ? undefined
        : aiEnrichedFilter === "enriched",
  });

  const leads = useMemo(() => leadsData?.data || [], [leadsData?.data]);
  const pagination = leadsData?.pagination || {
    total: 0,
    page: 1,
    limit,
    totalPages: 1,
  };

  const stats = useMemo(() => {
    const total = pagination.total;
    const contacted = leads.filter((lead) => lead.status !== "NEW").length;
    const converted = leads.filter((lead) => lead.status === "CONVERTED").length;
    const replied = leads.filter((lead) => lead.hasReplied).length;
    const enriched = leads.filter((lead) => lead.aiEnriched).length;

    return {
      total,
      contacted,
      converted,
      replied,
      enriched,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : "0",
    };
  }, [leads, pagination.total]);

  const getPercent = (value: number) =>
    stats.total > 0 ? `${Math.round((value / stats.total) * 100)}%` : "0%";

  if (isLoading) {
    return (
      <div className="w-full max-w-none space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-none p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your outreach prospects
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href="/leads/import">
            <Upload className="h-4 w-4" />
            Import CSV
            </Link>
          </Button>
          <CreateLeadDialog />
        </div>
      </div>

      <StatsGrid title="Overview" columns={5} gap="md">
        <StatCard
          title="Total Leads"
          value={stats.total}
          icon={<Users className="h-5 w-5" />}
          accentClassName="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          icon={<MessageSquare className="h-5 w-5" />}
          accentClassName="bg-violet-50 text-violet-600"
          description={`${getPercent(stats.contacted)} of total`}
        />
        <StatCard
          title="Converted"
          value={stats.converted}
          icon={<TrendingUp className="h-5 w-5" />}
          accentClassName="bg-emerald-50 text-emerald-600"
          description={`${stats.conversionRate}% conversion rate`}
        />
        <StatCard
          title="Replied"
          value={stats.replied}
          icon={<MessageSquare className="h-5 w-5" />}
          accentClassName="bg-indigo-50 text-indigo-600"
          description={`${getPercent(stats.replied)} reply rate`}
        />
        <StatCard
          title="AI Enriched"
          value={stats.enriched}
          icon={<Zap className="h-5 w-5" />}
          accentClassName="bg-amber-50 text-amber-600"
          description={`${getPercent(stats.enriched)} enriched`}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or business..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                Status
              </label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value as Lead["status"] | typeof ALL_STATUSES);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="CONTACTED">Contacted</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INTERESTED">Interested</SelectItem>
                  <SelectItem value="CONVERTED">Converted</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-muted-foreground">
                AI Enrichment
              </label>
              <Select
                value={aiEnrichedFilter}
                onValueChange={(value) => {
                  setAiEnrichedFilter(
                    value as typeof ALL_AI_ENRICHMENT | "enriched" | "not-enriched"
                  );
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All leads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_AI_ENRICHMENT}>All leads</SelectItem>
                  <SelectItem value="enriched">Enriched</SelectItem>
                  <SelectItem value="not-enriched">Not enriched</SelectItem>
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
              <CardTitle className="text-base">Leads</CardTitle>
              <CardDescription>
                {pagination.total} total prospects across {pagination.totalPages} page
                {pagination.totalPages === 1 ? "" : "s"}
              </CardDescription>
            </div>
            {isFetching && (
              <span className="text-sm text-muted-foreground">Refreshing...</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <LeadsTable
            leads={leads}
            isLoading={isFetching}
            onEdit={(lead) => {
              console.log("Edit lead:", lead);
            }}
            onDelete={(id) => {
              console.log("Delete lead:", id);
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
