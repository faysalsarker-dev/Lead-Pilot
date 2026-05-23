"use client";

import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  BudgetRange,
  EnrichmentStatus,
  LeadSource,
  LeadStatus,
  Priority,
  Urgency,
  WorkType,
  type Lead,
} from "@/app/generated/prisma/browser";
import { useUpdateLeadMutation } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const OPTIONAL = "__optional__";

interface EditLeadDialogProps {
  lead: Lead;
  children?: React.ReactNode;
}

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

const listText = (value?: string[]) => value?.join(", ") ?? "";

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

export function EditLeadDialog({ lead, children }: EditLeadDialogProps) {
  const [open, setOpen] = useState(false);
  const [updateLead, { isLoading }] = useUpdateLeadMutation();

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
        id: lead.id,
        data: {
          name,
          businessName,
          email: emptyToUndefined(formData.get("email")),
          businessType: emptyToUndefined(formData.get("businessType")),
          jobTitle: emptyToUndefined(formData.get("jobTitle")),
          phone: emptyToUndefined(formData.get("phone")),
          whatsapp: emptyToUndefined(formData.get("whatsapp")),
          website: emptyToUndefined(formData.get("website")),
          facebookUrl: emptyToUndefined(formData.get("facebookUrl")),
          instagramHandle: emptyToUndefined(formData.get("instagramHandle")),
          linkedinUrl: emptyToUndefined(formData.get("linkedinUrl")),
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
          enrichmentStatus: enumValue(formData.get("enrichmentStatus")) as Lead["enrichmentStatus"],
          isActive: formData.has("isActive"),
          hasReplied: formData.has("hasReplied"),
          isInterested: formData.has("isInterested"),
          unsubscribed: formData.has("unsubscribed"),
          isPinned: formData.has("isPinned"),
          isFavorite: formData.has("isFavorite"),
          quickNote: emptyToUndefined(formData.get("quickNote")),
          observedProblems: splitList(formData.get("observedProblems")),
          notes: emptyToUndefined(formData.get("notes")),
          internalLabel: emptyToUndefined(formData.get("internalLabel")),
        },
      }).unwrap();

      toast.success("Lead updated successfully");
      setOpen(false);
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

  function renderFlag(name: keyof Pick<Lead, "isActive" | "hasReplied" | "isInterested" | "unsubscribed" | "isPinned" | "isFavorite">) {
    return (
      <label key={name} className="flex items-center gap-2 rounded-md border p-3 text-sm">
        <input type="checkbox" name={name} defaultChecked={Boolean(lead[name])} className="h-4 w-4" />
        {formatEnum(name)}
      </label>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm" variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>Update Prisma generated Lead fields.</DialogDescription>
        </DialogHeader>

        <form key={`${lead.id}-${open}`} onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">Contact Name *<Input name="name" required minLength={2} defaultValue={lead.name} /></label>
            <label className="space-y-2 text-sm font-medium">Business Name *<Input name="businessName" required minLength={2} defaultValue={lead.businessName} /></label>
            <label className="space-y-2 text-sm font-medium">Email<Input name="email" type="email" defaultValue={lead.email ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Phone<Input name="phone" defaultValue={lead.phone ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">WhatsApp<Input name="whatsapp" defaultValue={lead.whatsapp ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Job Title<Input name="jobTitle" defaultValue={lead.jobTitle ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Business Type<Input name="businessType" defaultValue={lead.businessType ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Website<Input name="website" type="url" defaultValue={lead.website ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Facebook URL<Input name="facebookUrl" type="url" defaultValue={lead.facebookUrl ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Instagram Handle<Input name="instagramHandle" defaultValue={lead.instagramHandle ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">LinkedIn URL<Input name="linkedinUrl" type="url" defaultValue={lead.linkedinUrl ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Timezone<Input name="timezone" defaultValue={lead.timezone ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Country<Input name="country" defaultValue={lead.country ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">City<Input name="city" defaultValue={lead.city ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Area<Input name="area" defaultValue={lead.area ?? ""} /></label>
            <label className="space-y-2 text-sm font-medium">Internal Label<Input name="internalLabel" defaultValue={lead.internalLabel ?? ""} /></label>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {renderEnumSelect({ name: "status", label: "Status", defaultValue: lead.status, values: LeadStatus, required: true })}
            {renderEnumSelect({ name: "priority", label: "Priority", defaultValue: lead.priority, values: Priority, required: true })}
            {renderEnumSelect({ name: "enrichmentStatus", label: "Enrichment", defaultValue: lead.enrichmentStatus, values: EnrichmentStatus, required: true })}
            {renderEnumSelect({ name: "source", label: "Source", defaultValue: lead.source, values: LeadSource })}
            {renderEnumSelect({ name: "workType", label: "Work Type", defaultValue: lead.workType, values: WorkType })}
            {renderEnumSelect({ name: "budgetRange", label: "Budget", defaultValue: lead.budgetRange, values: BudgetRange })}
            {renderEnumSelect({ name: "urgency", label: "Urgency", defaultValue: lead.urgency, values: Urgency })}
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {renderFlag("isActive")}
            {renderFlag("hasReplied")}
            {renderFlag("isInterested")}
            {renderFlag("unsubscribed")}
            {renderFlag("isPinned")}
            {renderFlag("isFavorite")}
          </div>

          <label className="space-y-2 text-sm font-medium">Quick Note<Textarea name="quickNote" className="min-h-20 resize-none" defaultValue={lead.quickNote ?? ""} /></label>
          <label className="space-y-2 text-sm font-medium">Observed Problems<Textarea name="observedProblems" className="min-h-20 resize-none" defaultValue={listText(lead.observedProblems)} /></label>
          <label className="space-y-2 text-sm font-medium">Notes<Textarea name="notes" className="min-h-24 resize-none" defaultValue={lead.notes ?? ""} /></label>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
