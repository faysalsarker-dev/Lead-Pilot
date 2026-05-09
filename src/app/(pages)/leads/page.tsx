
"use client";

import { useState, useMemo } from "react";
import { useGetLeadsQuery } from "@/redux/hooks";
import { CreateLeadDialog } from "@/components/modules/leads/CreateLeadDialog";
import { LeadsTable } from "@/components/modules/leads/LeadsDataTable";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard, StatsGrid } from "@/components/modules/common/StatCard";
import { Upload, Search, Filter, Users, MessageSquare, Zap, TrendingUp } from "lucide-react";
import type { Lead } from "@/redux/features/leads/leads.api";

const ALL_STATUSES = "ALL_STATUSES";
const ALL_AI_ENRICHMENT = "ALL_AI_ENRICHMENT";

export default function LeadsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Lead["status"] | typeof ALL_STATUSES>(ALL_STATUSES);
  const [aiEnrichedFilter, setAiEnrichedFilter] = useState<
    typeof ALL_AI_ENRICHMENT | "enriched" | "not-enriched"
  >(ALL_AI_ENRICHMENT);

  const { data: leadsData, isLoading, isFetching } = useGetLeadsQuery({
    page,
    limit,
    search: searchQuery || undefined,
    status: statusFilter === ALL_STATUSES ? undefined : statusFilter,
    aiEnriched: aiEnrichedFilter === ALL_AI_ENRICHMENT ? undefined : aiEnrichedFilter === "enriched",
  });

  const leads = useMemo(() => leadsData?.data || [], [leadsData?.data]);
  const pagination = leadsData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  // Calculate stats
  const stats = useMemo(() => {
    const total = pagination.total;
    const contacted = leads.filter((l) => l.status !== "NEW").length;
    const converted = leads.filter((l) => l.status === "CONVERTED").length;
    const replied = leads.filter((l) => l.hasReplied).length;
    const enriched = leads.filter((l) => l.aiEnriched).length;

    return {
      total,
      contacted,
      converted,
      replied,
      enriched,
      conversionRate: total > 0 ? ((converted / total) * 100).toFixed(1) : "0",
    };
  }, [leads, pagination.total]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all your outreach prospects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <CreateLeadDialog />
        </div>
      </div>

      {/* Stats Grid */}
      <StatsGrid title="Overview" columns={5} gap="md">
        <StatCard
          title="Total Leads"
          value={stats.total}
          icon={<Users className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
          description={`${Math.round((stats.contacted / stats.total) * 100)}% of total`}
        />
        <StatCard
          title="Converted"
          value={stats.converted}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          description={`${stats.conversionRate}% conversion rate`}
        />
        <StatCard
          title="Replied"
          value={stats.replied}
          icon={<MessageSquare className="h-5 w-5 text-indigo-500" />}
          description={`${Math.round((stats.replied / stats.total) * 100)}% reply rate`}
        />
        <StatCard
          title="AI Enriched"
          value={stats.enriched}
          icon={<Zap className="h-5 w-5 text-yellow-500" />}
          description={`${Math.round((stats.enriched / stats.total) * 100)}% enriched`}
        />
      </StatsGrid>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, email, or business..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
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
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                AI Enrichment
              </label>
              <Select
                value={aiEnrichedFilter}
                onValueChange={(value) => {
                  setAiEnrichedFilter(value as typeof ALL_AI_ENRICHMENT | "enriched" | "not-enriched");
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
            Leads ({pagination.total} total)
          </CardTitle>
          <CardDescription>
            Page {page} of {pagination.totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
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
