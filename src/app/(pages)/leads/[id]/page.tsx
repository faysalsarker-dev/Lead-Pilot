"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Edit, Globe, Mail, MessageSquare, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useGetConversationQuery, useGetLeadQuery } from "@/redux/hooks";

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm">{value || "Not set"}</p>
    </div>
  );
}

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: leadData, isLoading: leadLoading } = useGetLeadQuery(id);
  const { data: conversationData, isLoading: conversationLoading } = useGetConversationQuery(id);
  const lead = leadData?.data;
  const messages = conversationData?.data.messages || [];

  if (leadLoading) {
    return (
      <div className="w-full p-6 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="w-full max-w-3xl p-6 space-y-4">
        <Button asChild variant="outline" className="gap-2">
          <Link href="/leads"><ArrowLeft className="h-4 w-4" />Back to Leads</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Lead not found</CardTitle>
            <CardDescription>This lead could not be loaded from the API.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="w-fit gap-2 px-0">
            <Link href="/leads"><ArrowLeft className="h-4 w-4" />Back to Leads</Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
            <p className="text-muted-foreground mt-2">{lead.email}</p>
          </div>
        </div>
        <Button asChild className="gap-2">
          <Link href={`/leads/${lead.id}/edit`}><Edit className="h-4 w-4" />Edit Lead</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Core lead and company information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-2">
                <Badge>{lead.status}</Badge>
                {lead.aiEnriched && <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" />AI enriched</Badge>}
                {lead.hasReplied && <Badge variant="outline">Replied</Badge>}
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <DetailRow label="Business" value={lead.businessName} />
                <DetailRow label="Business Type" value={lead.businessType} />
                <DetailRow label="Country" value={lead.country} />
                <DetailRow label="Timezone" value={lead.timezone} />
                <DetailRow label="AI Score" value={lead.aiScore} />
                <DetailRow label="Created" value={new Date(lead.createdAt).toLocaleDateString()} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button asChild variant="outline" className="gap-2 justify-start">
                  <a href={`mailto:${lead.email}`}><Mail className="h-4 w-4" />Email</a>
                </Button>
                <Button asChild variant="outline" className="gap-2 justify-start" disabled={!lead.website}>
                  <a href={lead.website || "#"} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" />Website</a>
                </Button>
                <Button asChild variant="outline" className="gap-2 justify-start">
                  <Link href={`/inbox/${lead.id}`}><MessageSquare className="h-4 w-4" />Conversation</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{lead.notes || "No internal notes yet."}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Conversation
            </CardTitle>
            <CardDescription>{messages.length} message{messages.length === 1 ? "" : "s"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversationLoading && <Skeleton className="h-32 w-full" />}
            {!conversationLoading && messages.length === 0 && (
              <p className="text-sm text-muted-foreground">No conversation messages yet.</p>
            )}
            {messages.slice(-5).map((message, index) => (
              <div key={`${message.sentAt}-${index}`} className="rounded-lg border p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <Badge variant={message.role === "user" ? "default" : "secondary"}>
                    {message.role === "user" ? "You" : "Lead"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{new Date(message.sentAt).toLocaleString()}</span>
                </div>
                {message.subject && <p className="mb-1 text-sm font-medium">{message.subject}</p>}
                <p className="text-sm text-muted-foreground line-clamp-4">{message.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
