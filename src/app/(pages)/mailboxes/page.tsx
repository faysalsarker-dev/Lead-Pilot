"use client";

import { useState } from "react";
import { useGetMailboxesQuery } from "@/redux/hooks";
import { MailboxDialog } from "@/components/modules/mailboxes/MailboxDialog";
import { MailboxesTable } from "@/components/modules/mailboxes/MailboxesDataTable";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { StatCard, StatsGrid } from "@/components/modules/common/StatCard";
import { Mail, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function MailboxesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const { data: mailboxesData, isLoading } = useGetMailboxesQuery({
    page,
    limit,
  });

  const mailboxes = mailboxesData?.data || [];
  const pagination = mailboxesData?.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const activeMailboxes = mailboxes.filter((m) => m.isActive).length;
  const gmailMailboxes = mailboxes.filter((m) => m.type === "GMAIL_OAUTH").length;
  const smtpMailboxes = mailboxes.filter((m) => m.type === "CUSTOM_SMTP").length;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Mailboxes</h1>
          <p className="text-muted-foreground mt-2">
            Configure Gmail OAuth or custom SMTP mailboxes for sending campaigns
          </p>
        </div>
        <MailboxDialog>
          <Button>Add Mailbox</Button>
        </MailboxDialog>
      </div>

      {/* Info Alert */}
      <Alert>
        <Mail className="h-4 w-4" />
        <AlertTitle>Email Account Setup</AlertTitle>
        <AlertDescription>
          You need at least one mailbox configured to send email campaigns. Connect a Gmail account
          using OAuth or use a custom SMTP server.
        </AlertDescription>
      </Alert>

      {/* Stats Grid */}
      <StatsGrid title="Mailbox Overview" columns={4} gap="md">
        <StatCard
          title="Total Mailboxes"
          value={pagination.total}
          icon={<Mail className="h-5 w-5 text-blue-500" />}
        />
        <StatCard
          title="Active"
          value={activeMailboxes}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          description="Ready to send"
        />
        <StatCard
          title="Gmail OAuth"
          value={gmailMailboxes}
          icon={<Mail className="h-5 w-5 text-red-500" />}
          description="OAuth accounts"
        />
        <StatCard
          title="SMTP"
          value={smtpMailboxes}
          icon={<Mail className="h-5 w-5 text-purple-500" />}
          description="Custom SMTP"
        />
      </StatsGrid>

      {/* Setup Instructions */}
      {pagination.total === 0 ? (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              No Mailboxes Configured
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-blue-900">
            <p>To start sending campaigns, you need to configure at least one mailbox:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                <strong>Gmail OAuth</strong> - Connect your Google account securely (recommended)
              </li>
              <li>
                <strong>Custom SMTP</strong> - Use your own email server credentials
              </li>
            </ol>
            <p className="text-sm italic">
              You can add multiple mailboxes and set one as default for new campaigns.
            </p>
            <div className="pt-4">
              <MailboxDialog>
                <Button className="bg-blue-600 hover:bg-blue-700">Add Your First Mailbox</Button>
              </MailboxDialog>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Filters */}
      {pagination.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
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
      )}

      {/* Table */}
      {mailboxes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Mailboxes ({pagination.total} total)
            </CardTitle>
            <CardDescription>
              Page {page} of {pagination.totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MailboxesTable
              mailboxes={mailboxes}
              onDelete={(id) => {
                console.log("Delete mailbox:", id);
              }}
            />
          </CardContent>
        </Card>
      )}

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
