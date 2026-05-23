"use client";

import { FormEvent, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import {
  BudgetRange,
  LeadSource,
  LeadStatus,
  Priority,
  Urgency,
  WorkType,
  type Lead,
} from "@/app/generated/prisma/browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useGetLeadQuery, useUpdateLeadMutation } from "@/redux/hooks";

const OPTIONAL = "__optional__";

const emptyToUndefined = (value: FormDataEntryValue | null) => {
  const text = typeof value === "string" ? value.trim() : "";
  return text || undefined;
};

const enumValue = (value: FormDataEntryValue | null) => {
  const text = emptyToUndefined(value);
  return text === OPTIONAL ? undefined : text;
};

const splitList = (value: FormDataEntryValue | null) =>
  (typeof value === "string" ? value : "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);

function formatEnum(value: string) {
  return value.replaceAll("_", " ");
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  return "Failed to update lead";
}

export default function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: leadData, isLoading } = useGetLeadQuery(id);
  const [updateLead, { isLoading: isSaving }] = useUpdateLeadMutation();
  const lead = leadData?.data;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = emptyToUndefined(formData.get("name"));
    const businessName = emptyToUndefined(formData.get("businessName"));

    if (!name || !businessName) {
      toast.error("Name and business name are required");
      return;
    }

    try {
      await updateLead({
        id,
        data: {
          name,
          businessName,
          email: emptyToUndefined(formData.get("email")),
          businessType: emptyToUndefined(formData.get("businessType")),
          jobTitle: emptyToUndefined(formData.get("jobTitle")),
          phone: emptyToUndefined(formData.get("phone")),
          whatsapp: emptyToUndefined(formData.get("whatsapp")),
          website: emptyToUndefined(formData.get("website")),
          country: emptyToUndefined(formData.get("country")),
          city: emptyToUndefined(formData.get("city")),
          area: emptyToUndefined(formData.get("area")),
          timezone: emptyToUndefined(formData.get("timezone")),
          status: enumValue(formData.get("status")) as Lead["status"],
          source: enumValue(formData.get("source")) as Lead["source"],
          workType: enumValue(formData.get("workType")) as Lead["workType"],
          budgetRange: enumValue(formData.get("budgetRange")) as Lead["budgetRange"],
          urgency: enumValue(formData.get("urgency")) as Lead["urgency"],
          priority: enumValue(formData.get("priority")) as Lead["priority"],
          quickNote: emptyToUndefined(formData.get("quickNote")),
          observedProblems: splitList(formData.get("observedProblems")),
          internalLabel: emptyToUndefined(formData.get("internalLabel")),
          notes: emptyToUndefined(formData.get("notes")),
        },
      }).unwrap();
      toast.success("Lead updated");
      router.push(`/leads/${id}`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  }

  function renderEnumSelect<T extends string>({
    label,
    name,
    defaultValue,
    values,
    required,
  }: {
    name: string;
    label: string;
    defaultValue?: T | null;
    values: Record<string, T>;
    required?: boolean;
  }) {
    return (
      <label className="space-y-2 text-sm font-medium">
        {label}
        <select
          name={name}
          defaultValue={defaultValue ?? OPTIONAL}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {!required && <option value={OPTIONAL}>Not set</option>}
          {Object.values(values).map((item) => (
            <option key={item} value={item}>{formatEnum(item)}</option>
          ))}
        </select>
      </label>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full p-6 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="w-full max-w-3xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Lead not found</CardTitle>
            <CardDescription>This lead could not be loaded for editing.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Lead</h1>
          <p className="text-muted-foreground mt-2">Update profile and outreach status for {lead.name}.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link href={`/leads/${id}`}><ArrowLeft className="h-4 w-4" />Back to Lead</Link>
        </Button>
      </div>

      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle>Lead Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Name *<Input name="name" required minLength={2} defaultValue={lead.name} /></label>
              <label className="space-y-2 text-sm font-medium">Email<Input name="email" type="email" defaultValue={lead.email ?? ""} /></label>
              {renderEnumSelect({ name: "status", label: "Status", defaultValue: lead.status, values: LeadStatus, required: true })}
              <label className="space-y-2 text-sm font-medium">Business Name *<Input name="businessName" required minLength={2} defaultValue={lead.businessName} /></label>
              <label className="space-y-2 text-sm font-medium">Business Type<Input name="businessType" defaultValue={lead.businessType ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">Job Title<Input name="jobTitle" defaultValue={lead.jobTitle ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">Phone<Input name="phone" defaultValue={lead.phone ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">WhatsApp<Input name="whatsapp" defaultValue={lead.whatsapp ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">Website<Input name="website" type="url" defaultValue={lead.website ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">Country<Input name="country" defaultValue={lead.country ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">City<Input name="city" defaultValue={lead.city ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">Area<Input name="area" defaultValue={lead.area ?? ""} /></label>
              <label className="space-y-2 text-sm font-medium">Timezone<Input name="timezone" defaultValue={lead.timezone ?? ""} /></label>
              {renderEnumSelect({ name: "source", label: "Source", defaultValue: lead.source, values: LeadSource })}
              {renderEnumSelect({ name: "workType", label: "Work Type", defaultValue: lead.workType, values: WorkType })}
              {renderEnumSelect({ name: "budgetRange", label: "Budget", defaultValue: lead.budgetRange, values: BudgetRange })}
              {renderEnumSelect({ name: "urgency", label: "Urgency", defaultValue: lead.urgency, values: Urgency })}
              {renderEnumSelect({ name: "priority", label: "Priority", defaultValue: lead.priority, values: Priority, required: true })}
              <label className="space-y-2 text-sm font-medium">Internal Label<Input name="internalLabel" defaultValue={lead.internalLabel ?? ""} /></label>
            </div>
            <label className="space-y-2 text-sm font-medium">Quick Note<Textarea name="quickNote" className="min-h-24 resize-none" defaultValue={lead.quickNote ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Observed Problems<Textarea name="observedProblems" className="min-h-24 resize-none" defaultValue={lead.observedProblems.join(", ")} /></label>
            <label className="space-y-2 text-sm font-medium">Notes<Textarea name="notes" className="min-h-28 resize-none" defaultValue={lead.notes ?? ""} /></label>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push(`/leads/${id}`)} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
