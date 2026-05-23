"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  Edit,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Sparkles,
  Star,
} from "lucide-react";
import { EditLeadDialog } from "@/components/modules/leads/EditLeadDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useGetConversationQuery, useGetLeadQuery } from "@/redux/hooks";

type DetailValue = string | number | boolean | null | undefined;

function formatEnum(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "Not set";
}

function formatDate(value?: string | Date | null) {
  return value ? new Date(value).toLocaleString() : "Not set";
}

function DetailRow({ label, value }: { label: string; value?: DetailValue }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm">{typeof value === "boolean" ? (value ? "Yes" : "No") : value || "Not set"}</p>
    </div>
  );
}

function TagList({ values, empty = "None" }: { values?: string[]; empty?: string }) {
  if (!values?.length) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <Badge key={value} variant="secondary">{formatEnum(value)}</Badge>
      ))}
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
    <div className="w-full max-w-7xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button asChild variant="ghost" size="sm" className="w-fit gap-2 px-0">
            <Link href="/leads"><ArrowLeft className="h-4 w-4" />Back to Leads</Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1>
              {lead.isFavorite && <Star className="h-5 w-5 fill-amber-400 text-amber-500" />}
              {lead.isPinned && <Badge variant="secondary">Pinned</Badge>}
            </div>
            <p className="mt-2 text-muted-foreground">{lead.businessName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{formatEnum(lead.status)}</Badge>
            <Badge variant="outline">{formatEnum(lead.priority)} priority</Badge>
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              {formatEnum(lead.enrichmentStatus)}
            </Badge>
            {lead.hasReplied && <Badge variant="secondary">Replied</Badge>}
            {lead.unsubscribed && <Badge variant="destructive">Unsubscribed</Badge>}
          </div>
        </div>
        <EditLeadDialog lead={lead}>
          <Button className="gap-2"><Edit className="h-4 w-4" />Edit Lead</Button>
        </EditLeadDialog>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Building2 className="h-4 w-4" />Identity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <DetailRow label="Business Type" value={lead.businessType} />
              <DetailRow label="Job Title" value={lead.jobTitle} />
              <DetailRow label="Internal Label" value={lead.internalLabel} />
              <DetailRow label="Source" value={formatEnum(lead.source)} />
              <DetailRow label="Work Type" value={formatEnum(lead.workType)} />
              <DetailRow label="Budget" value={formatEnum(lead.budgetRange)} />
              <DetailRow label="Urgency" value={formatEnum(lead.urgency)} />
              <DetailRow label="Created" value={formatDate(lead.createdAt)} />
              <DetailRow label="Updated" value={formatDate(lead.updatedAt)} />
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-4 w-4" />Contact Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <DetailRow label="Email" value={lead.email} />
                <DetailRow label="Email Verified" value={lead.emailVerified} />
                <DetailRow label="Phone" value={lead.phone} />
                <DetailRow label="WhatsApp" value={lead.whatsapp} />
                <DetailRow label="WhatsApp Opted In" value={lead.whatsappOptedIn} />
                <DetailRow label="Website" value={lead.website} />
                <DetailRow label="Facebook" value={lead.facebookUrl} />
                <DetailRow label="Instagram" value={lead.instagramHandle} />
                <DetailRow label="LinkedIn" value={lead.linkedinUrl} />
              </div>
              <Separator />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Button asChild variant="outline" className="justify-start gap-2" disabled={!lead.email}>
                  <a href={lead.email ? `mailto:${lead.email}` : "#"}><Mail className="h-4 w-4" />Email</a>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2" disabled={!lead.phone}>
                  <a href={lead.phone ? `tel:${lead.phone}` : "#"}><Phone className="h-4 w-4" />Call</a>
                </Button>
                <Button asChild variant="outline" className="justify-start gap-2" disabled={!lead.website}>
                  <a href={lead.website || "#"} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" />Website</a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MapPin className="h-4 w-4" />Location And Capture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                <DetailRow label="Country" value={lead.country} />
                <DetailRow label="City" value={lead.city} />
                <DetailRow label="Area" value={lead.area} />
                <DetailRow label="Timezone" value={lead.timezone} />
                <DetailRow label="Captured From" value={lead.capturedFrom} />
                <DetailRow label="Captured At" value={formatDate(lead.capturedAt)} />
                <DetailRow label="Google Maps" value={lead.googleMapsUrl} />
                <DetailRow label="Place ID" value={lead.googleMapsPlaceId} />
              </div>
              <Separator />
              <DetailRow label="Quick Note" value={lead.quickNote} />
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Observed Problems</p>
                <TagList values={lead.observedProblems} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4" />AI Enrichment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <DetailRow label="Score" value={lead.aiScore ? `${lead.aiScore}/10` : undefined} />
                <DetailRow label="Enriched At" value={formatDate(lead.aiEnrichedAt)} />
                <DetailRow label="Error" value={lead.enrichmentError} />
              </div>
              <DetailRow label="Summary" value={lead.aiSummary} />
              <DetailRow label="Email Opener" value={lead.aiEmailOpener} />
              <DetailRow label="Ad Copy" value={lead.aiAdCopy} />
              <div>
                <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">AI Pain Points</p>
                <TagList values={lead.aiPainPoints} />
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

        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="h-4 w-4" />Pipeline</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4">
              <DetailRow label="Status Updated" value={formatDate(lead.statusUpdatedAt)} />
              <DetailRow label="Active" value={lead.isActive} />
              <DetailRow label="Interested" value={lead.isInterested} />
              <DetailRow label="Campaign Running" value={lead.campaignRunning} />
              <DetailRow label="Last Contacted" value={formatDate(lead.lastContactedAt)} />
              <DetailRow label="Total Emails Sent" value={lead.totalEmailsSent} />
              <DetailRow label="Last Reply" value={formatDate(lead.lastReplyAt)} />
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><MessageSquare className="h-4 w-4" />Conversation</CardTitle>
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
                    <span className="text-xs text-muted-foreground">{formatDate(message.sentAt)}</span>
                  </div>
                  {message.subject && <p className="mb-1 text-sm font-medium">{message.subject}</p>}
                  <p className="line-clamp-4 text-sm text-muted-foreground">{message.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
