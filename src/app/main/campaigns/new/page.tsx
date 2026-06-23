"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Check, Loader2, Mail, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateCampaignMutation, useGetLeadsQuery, useGetMailboxesQuery, useGetTemplatesQuery } from "@/redux/hooks";

const NO_TEMPLATE = "NO_TEMPLATE";

export default function NewCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    mailboxId: "",
    initialTemplateId: "",
    followup1TemplateId: NO_TEMPLATE,
    followup2TemplateId: NO_TEMPLATE,
    finalTemplateId: NO_TEMPLATE,
    sendWindow: "09:00-11:00",
    followup1Days: "3",
    followup2Days: "5",
    finalDays: "7",
  });

  const { data: mailboxesData } = useGetMailboxesQuery({ limit: 100 });
  const { data: templatesData } = useGetTemplatesQuery({ limit: 100 });
  const { data: leadsData } = useGetLeadsQuery({ limit: 50 });
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();

  const templates = templatesData?.data || [];
  const leads = useMemo(() => leadsData?.data || [], [leadsData?.data]);
  const mailboxes = mailboxesData?.data || [];
  const stepItems = [
    { id: 1, label: "Setup", icon: Settings },
    { id: 2, label: "Templates", icon: Mail },
    { id: 3, label: "Leads", icon: Users },
    { id: 4, label: "Review", icon: Check },
  ];

  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedLeadIds.includes(lead.id)),
    [leads, selectedLeadIds]
  );

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function toggleLead(leadId: string) {
    setSelectedLeadIds((current) =>
      current.includes(leadId)
        ? current.filter((id) => id !== leadId)
        : [...current, leadId]
    );
  }

  async function handleCreate() {
    if (!form.name || !form.mailboxId || !form.initialTemplateId) {
      toast.error("Campaign name, mailbox, and initial template are required");
      setStep(1);
      return;
    }

    try {
      const response = await createCampaign({
        name: form.name,
        mailboxId: form.mailboxId,
        initialTemplateId: form.initialTemplateId,
        followup1TemplateId: form.followup1TemplateId === NO_TEMPLATE ? undefined : form.followup1TemplateId,
        followup2TemplateId: form.followup2TemplateId === NO_TEMPLATE ? undefined : form.followup2TemplateId,
        finalTemplateId: form.finalTemplateId === NO_TEMPLATE ? undefined : form.finalTemplateId,
        sendWindow: form.sendWindow,
        followup1Days: Number(form.followup1Days) || undefined,
        followup2Days: Number(form.followup2Days) || undefined,
        finalDays: Number(form.finalDays) || undefined,
        leadIds: selectedLeadIds,
      }).unwrap();
      toast.success("Campaign created");
      router.push(`/campaigns/${response.data.id}`);
    } catch (error) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to create campaign";
      toast.error(message);
    }
  }

  return (
    <div className="w-full max-w-6xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Campaign</h1>
          <p className="text-muted-foreground mt-2">Build a campaign sequence and choose the initial audience.</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/campaigns")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stepItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setStep(item.id)}
              className={`flex h-16 items-center gap-3 rounded-lg border px-4 text-left transition-colors ${
                step === item.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Setup</CardTitle>
            <CardDescription>Name the campaign and pick the sending mailbox.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name *</Label>
              <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} placeholder="Q2 founders outreach" />
            </div>
            <div className="space-y-2">
              <Label>Mailbox *</Label>
              <Select value={form.mailboxId} onValueChange={(value) => updateField("mailboxId", value)}>
                <SelectTrigger><SelectValue placeholder="Select mailbox" /></SelectTrigger>
                <SelectContent>
                  {mailboxes.map((mailbox) => (
                    <SelectItem key={mailbox.id} value={mailbox.id}>{mailbox.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sendWindow">Send Window</Label>
              <Input id="sendWindow" value={form.sendWindow} onChange={(event) => updateField("sendWindow", event.target.value)} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Email Sequence</CardTitle>
            <CardDescription>Choose the initial message and optional follow-ups.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Initial Template *</Label>
              <Select value={form.initialTemplateId} onValueChange={(value) => updateField("initialTemplateId", value)}>
                <SelectTrigger><SelectValue placeholder="Select initial template" /></SelectTrigger>
                <SelectContent>
                  {templates.filter((template) => template.type === "INITIAL").map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(["followup1TemplateId", "followup2TemplateId", "finalTemplateId"] as const).map((field) => (
              <div key={field} className="space-y-2">
                <Label>{field === "followup1TemplateId" ? "Follow-up 1" : field === "followup2TemplateId" ? "Follow-up 2" : "Final Template"}</Label>
                <Select value={form[field]} onValueChange={(value) => updateField(field, value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_TEMPLATE}>None</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3 md:col-span-2">
              <div className="space-y-2"><Label>Follow-up 1 Days</Label><Input type="number" value={form.followup1Days} onChange={(event) => updateField("followup1Days", event.target.value)} /></div>
              <div className="space-y-2"><Label>Follow-up 2 Days</Label><Input type="number" value={form.followup2Days} onChange={(event) => updateField("followup2Days", event.target.value)} /></div>
              <div className="space-y-2"><Label>Final Days</Label><Input type="number" value={form.finalDays} onChange={(event) => updateField("finalDays", event.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Leads</CardTitle>
            <CardDescription>{selectedLeadIds.length} lead{selectedLeadIds.length === 1 ? "" : "s"} selected.</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[520px] overflow-auto space-y-2">
            {leads.map((lead) => (
              <label key={lead.id} className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-muted/50">
                <Checkbox checked={selectedLeadIds.includes(lead.id)} onCheckedChange={() => toggleLead(lead.id)} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{lead.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{lead.email}</span>
                </span>
              </label>
            ))}
            {leads.length === 0 && <p className="text-sm text-muted-foreground">No leads are available yet.</p>}
          </CardContent>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review</CardTitle>
            <CardDescription>Confirm the campaign before creating it as a draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea readOnly className="min-h-52" value={[
              `Name: ${form.name || "Not set"}`,
              `Mailbox: ${mailboxes.find((mailbox) => mailbox.id === form.mailboxId)?.label || "Not set"}`,
              `Initial Template: ${templates.find((template) => template.id === form.initialTemplateId)?.name || "Not set"}`,
              `Leads: ${selectedLeads.length}`,
              `Send Window: ${form.sendWindow}`,
            ].join("\n")} />
            <Button onClick={handleCreate} disabled={isLoading} className="gap-2">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Create Campaign
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Previous</Button>
        <Button onClick={() => setStep(Math.min(4, step + 1))} disabled={step === 4}>Next</Button>
      </div>
    </div>
  );
}
