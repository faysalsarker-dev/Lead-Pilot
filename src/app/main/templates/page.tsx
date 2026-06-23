"use client";

import { useState } from "react";
import { useDeleteTemplateMutation, useGetTemplatesQuery } from "@/redux/hooks";
import { CreateTemplateDialog } from "@/components/modules/templates/CreateTemplateDialog";
import { EditTemplateDialog } from "@/components/modules/templates/EditTemplateDialog";
import { Pagination } from "@/components/modules/common/Pagination";
import { TemplateTypeBadge } from "@/components/modules/common/StatusBadges";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Copy,
  Edit,
  FileText,
  FlaskConical,
  Layers3,
  MoreHorizontal,
  Plus,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Template } from "@/redux/features/templates/templates.api";

const ALL_TEMPLATE_TYPES = "ALL_TEMPLATE_TYPES";
const ALL_VARIANTS = "ALL_VARIANTS";

type TemplateTypeFilter =
  | typeof ALL_TEMPLATE_TYPES
  | "INITIAL"
  | "FOLLOWUP_1"
  | "FOLLOWUP_2"
  | "FINAL";
type VariantFilter = typeof ALL_VARIANTS | "AB_TESTING" | "SINGLE_SUBJECT";

const templateTypeLabels: Record<Exclude<TemplateTypeFilter, typeof ALL_TEMPLATE_TYPES>, string> = {
  INITIAL: "Initial email",
  FOLLOWUP_1: "Follow-up 1",
  FOLLOWUP_2: "Follow-up 2",
  FINAL: "Final email",
};

function getMutationMessage(error: unknown, fallback: string) {
  const maybeError = error as { data?: { message?: string } };
  return maybeError.data?.message || fallback;
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function getTemplatePreview(template: Template) {
  return template.body.replace(/\s+/g, " ").trim();
}

function TemplateMetric({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-b p-5 sm:border-b-0 sm:border-r last:border-r-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {icon}
        </span>
      </div>
      <div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </div>
  );
}

export default function TemplatesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TemplateTypeFilter>(ALL_TEMPLATE_TYPES);
  const [variantFilter, setVariantFilter] = useState<VariantFilter>(ALL_VARIANTS);
  const [deletingTemplateId, setDeletingTemplateId] = useState<string | null>(null);
  const [deleteTemplate] = useDeleteTemplateMutation();

  const { data: templatesData, isLoading } = useGetTemplatesQuery({
    page,
    limit,
  });

  const templates = templatesData?.data || [];
  const pagination = templatesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-350 space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-9 w-36" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const hasTemplates = pagination.total > 0;
  const abTestingTemplates = templates.filter((template) => Boolean(template.subjectB)).length;
  const sequenceCoverage = ["INITIAL", "FOLLOWUP_1", "FOLLOWUP_2", "FINAL"].filter((type) =>
    templates.some((template) => template.type === type)
  ).length;
  const averageWords = templates.length
    ? Math.round(templates.reduce((total, template) => total + countWords(template.body), 0) / templates.length)
    : 0;

  const filteredTemplates = templates.filter((template) => {
    const query = searchTerm.trim().toLowerCase();
    const searchable = [
      template.name,
      template.subjectA,
      template.subjectB || "",
      template.body,
      templateTypeLabels[template.type],
    ]
      .join(" ")
      .toLowerCase();
    const matchesSearch = !query || searchable.includes(query);
    const matchesType = typeFilter === ALL_TEMPLATE_TYPES || template.type === typeFilter;
    const matchesVariant =
      variantFilter === ALL_VARIANTS ||
      (variantFilter === "AB_TESTING" && Boolean(template.subjectB)) ||
      (variantFilter === "SINGLE_SUBJECT" && !template.subjectB);

    return matchesSearch && matchesType && matchesVariant;
  });

  async function handleDelete(template: Template) {
    setDeletingTemplateId(template.id);
    try {
      await deleteTemplate(template.id).unwrap();
      toast.success("Template deleted successfully");
    } catch (error: unknown) {
      toast.error(getMutationMessage(error, "Failed to delete template"));
    } finally {
      setDeletingTemplateId(null);
    }
  }

  return (
    <div className="mx-auto max-w-350 space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5 text-primary" />
              Template library
            </Badge>
            {sequenceCoverage === 4 && (
              <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Full sequence ready
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Email Templates</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Build reusable outreach copy, manage A/B subject variants, and keep campaign sequences production-ready.
            </p>
          </div>
        </div>
        <CreateTemplateDialog>
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Create template
          </Button>
        </CreateTemplateDialog>
      </div>

      <Card className="overflow-hidden border-border/70 shadow-sm">
        <CardContent className="grid gap-0 p-0 sm:grid-cols-2 lg:grid-cols-4">
          <TemplateMetric
            title="Total templates"
            value={pagination.total}
            description={`${filteredTemplates.length} visible on this page`}
            icon={<FileText className="h-4 w-4" />}
          />
          <TemplateMetric
            title="Sequence coverage"
            value={`${sequenceCoverage}/4`}
            description="Initial, follow-ups, and final stages"
            icon={<Send className="h-4 w-4" />}
          />
          <TemplateMetric
            title="A/B variants"
            value={abTestingTemplates}
            description="Templates with subject B enabled"
            icon={<FlaskConical className="h-4 w-4" />}
          />
          <TemplateMetric
            title="Average length"
            value={averageWords}
            description="Words per loaded template"
            icon={<Sparkles className="h-4 w-4" />}
          />
        </CardContent>
      </Card>

      {!hasTemplates && (
        <Card className="border-dashed border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                <FileText className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Create your first outreach template</h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Start with an initial email, then add follow-ups so campaigns can run with a complete sequence.
                </p>
              </div>
            </div>
            <CreateTemplateDialog>
              <Button className="w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                New template
              </Button>
            </CreateTemplateDialog>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-base">Template library</CardTitle>
              <CardDescription>
                {hasTemplates
                  ? `Showing ${filteredTemplates.length} of ${templates.length} loaded templates on page ${page}.`
                  : "Reusable email copy will appear here after creation."}
              </CardDescription>
            </div>
            {hasTemplates && (
              <Select
                value={String(limit)}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[132px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          {hasTemplates && (
            <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search name, subject, or body..."
                  className="pl-9"
                />
              </div>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value as TemplateTypeFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Template type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_TEMPLATE_TYPES}>All types</SelectItem>
                  <SelectItem value="INITIAL">Initial email</SelectItem>
                  <SelectItem value="FOLLOWUP_1">Follow-up 1</SelectItem>
                  <SelectItem value="FOLLOWUP_2">Follow-up 2</SelectItem>
                  <SelectItem value="FINAL">Final email</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={variantFilter}
                onValueChange={(value) => {
                  setVariantFilter(value as VariantFilter);
                  setPage(1);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Variants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_VARIANTS}>All variants</SelectItem>
                  <SelectItem value="AB_TESTING">A/B testing</SelectItem>
                  <SelectItem value="SINGLE_SUBJECT">Single subject</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {hasTemplates ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => {
                  const preview = getTemplatePreview(template);

                  return (
                    <Card key={template.id} className="flex min-h-[310px] flex-col border-border/70 shadow-sm">
                      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <TemplateTypeBadge type={template.type} />
                            {template.subjectB && (
                              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                                A/B test
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="line-clamp-2 text-base leading-6">
                            {template.name}
                          </CardTitle>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                navigator.clipboard.writeText(template.id);
                                toast.success("Template ID copied");
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy ID
                            </DropdownMenuItem>
                            <EditTemplateDialog template={template}>
                              <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            </EditTemplateDialog>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(event) => event.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogMedia className="bg-red-100 text-red-600 dark:bg-red-950/40">
                                    <AlertTriangle className="h-5 w-5" />
                                  </AlertDialogMedia>
                                  <AlertDialogTitle>Delete template?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove &quot;{template.name}&quot;. Campaigns using this
                                    template may need to be updated before sending.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel disabled={deletingTemplateId === template.id}>
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    variant="destructive"
                                    onClick={() => handleDelete(template)}
                                    disabled={deletingTemplateId === template.id}
                                  >
                                    {deletingTemplateId === template.id ? "Deleting..." : "Delete template"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-4">
                        <div className="rounded-lg border bg-muted/20 p-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Subject A
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm font-medium">{template.subjectA}</p>
                        </div>
                        {template.subjectB && (
                          <div className="rounded-lg border bg-muted/20 p-3">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Subject B
                            </p>
                            <p className="mt-1 line-clamp-2 text-sm font-medium">{template.subjectB}</p>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Body preview
                          </p>
                          <p className="mt-2 line-clamp-5 text-sm leading-6 text-muted-foreground">
                            {preview || "No body content"}
                          </p>
                        </div>
                        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
                          <span>{countWords(template.body)} words</span>
                          <span>{template.subjectB ? "Two subject variants" : "Single subject"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="col-span-full flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                  <Search className="mb-4 h-10 w-10 text-muted-foreground/70" />
                  <h3 className="text-base font-semibold">No templates match your filters</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                    Clear the search or switch type and variant filters to see more templates.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <FileText className="mb-4 h-10 w-10 text-muted-foreground/70" />
              <h3 className="text-base font-semibold">No templates yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Create reusable copy for initial outreach, follow-ups, and final campaign touches.
              </p>
              <CreateTemplateDialog>
                <Button className="mt-5 gap-2">
                  <Plus className="h-4 w-4" />
                  Create template
                </Button>
              </CreateTemplateDialog>
            </div>
          )}
        </CardContent>
      </Card>

      {pagination.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={limit}
          onPageChange={setPage}
          className="rounded-lg border bg-card"
        />
      )}
    </div>
  );
}
