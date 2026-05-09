"use client";

import { useState } from "react";
import { useGetTemplatesQuery } from "@/redux/hooks";
import { CreateTemplateDialog } from "@/components/modules/templates/CreateTemplateDialog";
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
import { TemplateTypeBadge } from "@/components/modules/common/StatusBadges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Copy, Edit, Trash2, MoreHorizontal } from "lucide-react";

const ALL_TEMPLATE_TYPES = "ALL_TEMPLATE_TYPES";
type TemplateTypeFilter = typeof ALL_TEMPLATE_TYPES | "INITIAL" | "FOLLOWUP_1" | "FOLLOWUP_2" | "FINAL";

export default function TemplatesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [typeFilter, setTypeFilter] = useState<TemplateTypeFilter>(ALL_TEMPLATE_TYPES);

  const { data: templatesData, isLoading } = useGetTemplatesQuery({
    page,
    limit,
  });

  const templates = templatesData?.data || [];
  const pagination = templatesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

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
    initial: templates.filter((t) => t.type === "INITIAL").length,
    followups: templates.filter((t) => t.type.startsWith("FOLLOWUP")).length,
    final: templates.filter((t) => t.type === "FINAL").length,
  };

  const filteredTemplates = typeFilter !== ALL_TEMPLATE_TYPES
    ? templates.filter((t) => t.type === typeFilter)
    : templates;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage reusable email templates with A/B testing
          </p>
        </div>
        <CreateTemplateDialog />
      </div>

      {/* Stats Grid */}
      <StatsGrid title="Template Overview" columns={4} gap="md">
        <StatCard
          title="Total Templates"
          value={stats.total}
          icon={<FileText className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Initial Emails"
          value={stats.initial}
          icon={<FileText className="h-5 w-5 text-green-500" />}
          description="First contact"
        />
        <StatCard
          title="Follow-ups"
          value={stats.followups}
          icon={<FileText className="h-5 w-5 text-orange-500" />}
          description="Reminders"
        />
        <StatCard
          title="Final Emails"
          value={stats.final}
          icon={<FileText className="h-5 w-5 text-red-500" />}
          description="Last attempt"
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
                Template Type
              </label>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as TemplateTypeFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_TEMPLATE_TYPES}>All types</SelectItem>
                  <SelectItem value="INITIAL">Initial Email</SelectItem>
                  <SelectItem value="FOLLOWUP_1">Follow-up 1</SelectItem>
                  <SelectItem value="FOLLOWUP_2">Follow-up 2</SelectItem>
                  <SelectItem value="FINAL">Final Email</SelectItem>
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

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="mt-1">
                    <TemplateTypeBadge type={template.type} />
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Subject A
                    </p>
                    <p className="text-sm line-clamp-2">{template.subjectA}</p>
                  </div>
                  {template.subjectB && (
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1">
                        Subject B
                      </p>
                      <p className="text-sm line-clamp-2">{template.subjectB}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Body
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {template.body}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-3" />
            <p className="text-muted-foreground">No templates found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
      )}
    </div>
  );
}
