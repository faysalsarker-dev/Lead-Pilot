"use client";

import { FormEvent, useState, useId } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  BudgetRange,
  LeadSource,
  Priority,
  Urgency,
  WorkType,
  type Lead,
} from "@/app/generated/prisma/browser";

import { useCreateLeadMutation } from "@/redux/hooks";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const OPTIONAL = "__optional__";

type LeadSelectValue =
  | Lead["source"]
  | Lead["workType"]
  | Lead["budgetRange"]
  | Lead["urgency"]
  | Lead["priority"];

const emptyToUndefined = (v: FormDataEntryValue | null) => {
  const t = typeof v === "string" ? v.trim() : "";
  return t || undefined;
};

const splitList = (v: FormDataEntryValue | null) =>
  (typeof v === "string" ? v : "")
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter(Boolean);

/* ---------------- UI BUILDING BLOCKS ---------------- */

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function EnumSelect<T extends LeadSelectValue>({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value?: T;
  values: Record<string, T>;
  onChange: (value: T | undefined) => void;
}) {
  const id = useId();

  const list = Object.values(values).filter(Boolean) as string[];

  return (
    <Field label={label}>
      <Select value={value ?? OPTIONAL} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={OPTIONAL}>Not set</SelectItem>
          {list.map((v) => (
            <SelectItem key={v} value={v}>
              {v.replaceAll("_", " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

/* ---------------- MAIN COMPONENT ---------------- */

export function CreateLeadDialog() {
  const [open, setOpen] = useState(false);

  const [source, setSource] = useState<Lead["source"]>();
  const [workType, setWorkType] = useState<Lead["workType"]>();
  const [budgetRange, setBudgetRange] = useState<Lead["budgetRange"]>();
  const [urgency, setUrgency] = useState<Lead["urgency"]>();
  const [priority, setPriority] = useState<Lead["priority"]>(Priority.MEDIUM);

  const [createLead, { isLoading }] = useCreateLeadMutation();

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    const name = emptyToUndefined(form.get("name"));
    const businessName = emptyToUndefined(form.get("businessName"));

    if (!name || !businessName) {
      toast.error("Name + Business required");
      return;
    }

    try {
      await createLead({
        name,
        businessName,

        phone: emptyToUndefined(form.get("phone")),
        whatsapp: emptyToUndefined(form.get("whatsapp")),
        email: emptyToUndefined(form.get("email")),

        jobTitle: emptyToUndefined(form.get("jobTitle")),
        businessType: emptyToUndefined(form.get("businessType")),

        city: emptyToUndefined(form.get("city")),
        capturedFrom: emptyToUndefined(form.get("capturedFrom")),

        quickNote: emptyToUndefined(form.get("quickNote")),
        observedProblems: splitList(form.get("observedProblems")),

        source,
        workType,
        budgetRange,
        urgency,
        priority,

        capturedAt: new Date(),
      }).unwrap();

      toast.success("Lead created");
      setOpen(false);
      e.currentTarget.reset();
    } catch (err) {
      toast.error("Failed to create lead");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[95vh] w-[96vw] !max-w-6xl overflow-hidden p-0 rounded-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>Create Lead</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col">
          <Tabs defaultValue="basic" className="flex-1">
            {/* TAB NAV */}
            <div className="border-b px-6 pt-3">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="intel">Intel</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
            </div>

            {/* BODY */}
            <div className="max-h-[65vh] overflow-y-auto px-6 py-5 space-y-6">

              {/* BASIC */}
              <TabsContent value="basic" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Name">
                    <Input name="name" className="h-9" />
                  </Field>

                  <Field label="Business">
                    <Input name="businessName" className="h-9" />
                  </Field>

                  <Field label="Job Title">
                    <Input name="jobTitle" className="h-9" />
                  </Field>

                  <Field label="Business Type">
                    <Input name="businessType" className="h-9" />
                  </Field>
                </div>
              </TabsContent>

              {/* CONTACT */}
              <TabsContent value="contact" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Email">
                    <Input name="email" className="h-9" />
                  </Field>

                  <Field label="Phone">
                    <Input name="phone" className="h-9" />
                  </Field>

                  <Field label="WhatsApp">
                    <Input name="whatsapp" className="h-9" />
                  </Field>

                  <Field label="City">
                    <Input name="city" className="h-9" />
                  </Field>
                </div>
              </TabsContent>

              {/* INTEL */}
              <TabsContent value="intel" className="space-y-4">
                <Field label="Captured From">
                  <Input name="capturedFrom" className="h-9" />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <EnumSelect label="Source" value={source} values={LeadSource} onChange={setSource} />
                  <EnumSelect label="Work Type" value={workType} values={WorkType} onChange={setWorkType} />
                  <EnumSelect label="Budget" value={budgetRange} values={BudgetRange} onChange={setBudgetRange} />
                  <EnumSelect label="Urgency" value={urgency} values={Urgency} onChange={setUrgency} />
                </div>

                <EnumSelect label="Priority" value={priority} values={Priority} onChange={setPriority} />
              </TabsContent>

              {/* NOTES */}
              <TabsContent value="notes" className="space-y-4">
                <Field label="Quick Note">
                  <Textarea name="quickNote" className="min-h-20" />
                </Field>

                <Field label="Observed Problems">
                  <Textarea
                    name="observedProblems"
                    placeholder="bad_website, no_booking_system"
                    className="min-h-20"
                  />
                </Field>
              </TabsContent>
            </div>
          </Tabs>

          {/* FOOTER */}
          <DialogFooter className="sticky bottom-0 border-t bg-background px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Lead
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
