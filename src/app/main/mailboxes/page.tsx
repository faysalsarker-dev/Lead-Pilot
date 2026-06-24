"use client";

import { useState } from "react";
import { useGetMailboxesQuery } from "@/redux/hooks";
import { MailboxDialog } from "@/components/modules/mailboxes/MailboxDialog";
import { MailboxesTable } from "@/components/modules/mailboxes/MailboxesDataTable";
import { Pagination } from "@/components/modules/common/Pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@/components/ui";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Mail,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";

const ALL_PROVIDERS = "ALL_PROVIDERS";
const ALL_STATUSES = "ALL_STATUSES";

type ProviderFilter =
  | typeof ALL_PROVIDERS
  | "GMAIL_OAUTH"
  | "GMAIL_IMAP"
  | "CUSTOM_SMTP"
  | "CLOUDFLARE_WORKER";
type StatusFilter = typeof ALL_STATUSES | "ACTIVE" | "INACTIVE" | "DEFAULT";

function getMailboxAddress(mailbox: {
  smtpUser?: string | null;
  imapUser?: string | null;
  gmailEmail?: string | null;
  replyTo?: string | null;
}) {
  return (
    mailbox.smtpUser ||
    mailbox.imapUser ||
    mailbox.gmailEmail ||
    mailbox.replyTo ||
    ""
  );
}

function formatMailboxType(type: string) {
  const labels: Record<string, string> = {
    GMAIL_OAUTH: "Gmail OAuth",
    GMAIL_IMAP: "Gmail IMAP",
    CUSTOM_SMTP: "Custom SMTP",
    CLOUDFLARE_WORKER: "Cloudflare Worker",
  };

  return labels[type] || type.replaceAll("_", " ");
}

export default function MailboxesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] =
    useState<ProviderFilter>(ALL_PROVIDERS);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(ALL_STATUSES);

  const { data: mailboxesData, isLoading } = useGetMailboxesQuery({
    page,
    limit,
  });

  const mailboxes = mailboxesData?.data || [];
  const pagination = mailboxesData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-350 space-y-6 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  const activeMailboxes = mailboxes.filter((m) => m.isActive).length;
  const inactiveMailboxes = mailboxes.length - activeMailboxes;
  const gmailMailboxes = mailboxes.filter(
    (m) => m.type === "GMAIL_OAUTH",
  ).length;
  const gmailImapMailboxes = mailboxes.filter(
    (m) => m.type === "GMAIL_IMAP",
  ).length;
  const smtpMailboxes = mailboxes.filter(
    (m) => m.type === "CUSTOM_SMTP",
  ).length;
  const defaultMailbox = mailboxes.find((m) => m.isDefault);
  const receivingEnabled = mailboxes.filter(
    (m) => m.imapEnabled || m.type === "GMAIL_OAUTH",
  ).length;
  const hasMailboxes = pagination.total > 0;
  const hasInactiveMailboxes = inactiveMailboxes > 0;

  const filteredMailboxes = mailboxes.filter((mailbox) => {
    const query = searchTerm.trim().toLowerCase();
    const address = getMailboxAddress(mailbox).toLowerCase();
    const label = mailbox.label.toLowerCase();
    const type = formatMailboxType(mailbox.type).toLowerCase();
    const matchesSearch =
      !query ||
      label.includes(query) ||
      address.includes(query) ||
      type.includes(query);
    const matchesProvider =
      providerFilter === ALL_PROVIDERS || mailbox.type === providerFilter;
    const matchesStatus =
      statusFilter === ALL_STATUSES ||
      (statusFilter === "ACTIVE" && mailbox.isActive) ||
      (statusFilter === "INACTIVE" && !mailbox.isActive) ||
      (statusFilter === "DEFAULT" && mailbox.isDefault);

    return matchesSearch && matchesProvider && matchesStatus;
  });

  const connectedRate = mailboxes.length
    ? Math.round((activeMailboxes / mailboxes.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-350 space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="gap-1.5 px-2.5 py-1 text-muted-foreground"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              Sender infrastructure
            </Badge>
            {defaultMailbox && (
              <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                Default: {defaultMailbox.label}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Mailboxes
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
              Connect sending accounts, monitor readiness, and route campaign
              replies from one clean control center.
            </p>
          </div>
        </div>
        <MailboxDialog>
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="h-4 w-4" />
            Add mailbox
          </Button>
        </MailboxDialog>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <Card className="overflow-hidden border-border/70 shadow-sm">
          <CardContent className="p-0">
            <div className="grid gap-0 sm:grid-cols-3">
              <div className="border-b p-5 sm:border-b-0 sm:border-r">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total accounts
                  </p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                  {pagination.total}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {activeMailboxes} active, {inactiveMailboxes} paused
                </p>
              </div>

              <div className="border-b p-5 sm:border-b-0 sm:border-r">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Readiness
                  </p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Activity className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                  {connectedRate}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Accounts available for sending
                </p>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Reply tracking
                  </p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-700">
                    <Inbox className="h-4 w-4" />
                  </span>
                </div>
                <div className="mt-4 text-3xl font-semibold tracking-tight tabular-nums">
                  {receivingEnabled}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mailboxes watching for replies
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {hasInactiveMailboxes ? (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
              Infrastructure health
            </CardTitle>
            <CardDescription>
              {hasMailboxes
                ? hasInactiveMailboxes
                  ? "Some accounts are paused and will not send campaigns."
                  : "Your configured accounts are ready for campaign sending."
                : "Add your first sender account to unlock campaign delivery."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <div className="text-lg font-semibold tabular-nums">
                  {gmailMailboxes + gmailImapMailboxes}
                </div>
                <div className="text-[11px] text-muted-foreground">Gmail</div>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <div className="text-lg font-semibold tabular-nums">
                  {smtpMailboxes}
                </div>
                <div className="text-[11px] text-muted-foreground">SMTP</div>
              </div>
              <div className="rounded-lg border bg-muted/30 px-3 py-2">
                <div className="text-lg font-semibold tabular-nums">
                  {defaultMailbox ? 1 : 0}
                </div>
                <div className="text-[11px] text-muted-foreground">Default</div>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border bg-muted/25 p-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-primary" />
              <p className="text-sm leading-5 text-muted-foreground">
                Keep one primary mailbox as default, then rotate additional
                active accounts to protect deliverability.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {!hasMailboxes && (
        <Card className="border-dashed border-primary/30 bg-primary/5 shadow-sm">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
                <Server className="h-5 w-5" />
              </span>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">
                  No mailboxes connected yet
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Start with Gmail OAuth for the smoothest setup, or connect a
                  custom SMTP account when you need a dedicated sending domain.
                </p>
              </div>
            </div>
            <MailboxDialog>
              <Button className="w-full gap-2 sm:w-auto">
                <Plus className="h-4 w-4" />
                Add first mailbox
              </Button>
            </MailboxDialog>
          </CardContent>
        </Card>
      )}

      <Card className="border-border/70 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <CardTitle className="text-base">Connected mailboxes</CardTitle>
              <CardDescription>
                {hasMailboxes
                  ? `Showing ${filteredMailboxes.length} of ${mailboxes.length} loaded accounts on page ${page}.`
                  : "Your sender accounts will appear here after setup."}
              </CardDescription>
            </div>
            {hasMailboxes && (
              <div className="flex items-center gap-2">
                <Select
                  value={String(limit)}
                  onValueChange={(val) => {
                    setLimit(Number(val));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-33">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 per page</SelectItem>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="20">20 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {hasMailboxes && (
            <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_180px_160px]">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search label, email, or provider..."
                  className="pl-9"
                />
              </div>
              <Select
                value={providerFilter}
                onValueChange={(value) =>
                  setProviderFilter(value as ProviderFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PROVIDERS}>All providers</SelectItem>
                  <SelectItem value="GMAIL_OAUTH">Gmail OAuth</SelectItem>
                  <SelectItem value="GMAIL_IMAP">Gmail IMAP</SelectItem>
                  <SelectItem value="CUSTOM_SMTP">Custom SMTP</SelectItem>
                  <SelectItem value="CLOUDFLARE_WORKER">
                    Cloudflare Worker
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DEFAULT">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {hasMailboxes ? (
            <MailboxesTable
              mailboxes={filteredMailboxes}
              onDelete={(id) => {
                console.log("Delete mailbox:", id);
              }}
            />
          ) : (
            <div className="flex min-h-65 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
              <Mail className="mb-4 h-10 w-10 text-muted-foreground/70" />
              <h3 className="text-base font-semibold">
                Build your sending pool
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Add a Gmail or SMTP mailbox, set the default sender, and keep
                reply tracking enabled for cleaner follow-up workflows.
              </p>
              <MailboxDialog>
                <Button className="mt-5 gap-2">
                  <Plus className="h-4 w-4" />
                  Add mailbox
                </Button>
              </MailboxDialog>
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
