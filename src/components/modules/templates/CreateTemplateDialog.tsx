"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
 Badge,
 Button ,
 Input,
Textarea } from "@/components/ui";
import { useCreateTemplateMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { FileText, Sparkles, HelpCircle } from "lucide-react";
import type { TemplateCreateInput } from "@/app/generated/prisma/models/Template";
import type { TemplateType as TemplateTypeEnum } from "@/app/generated/prisma/browser";

const TEMPLATE_STAGE_LABELS: Record<TemplateTypeEnum, string> = {
  INITIAL: "Initial email",
  FOLLOWUP_1: "Follow-up 1",
  FOLLOWUP_2: "Follow-up 2",
  FINAL: "Final email",
};

type CreateTemplateFormValues = Omit<
  TemplateCreateInput,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "user"
  | "campaignsAsInitial"
  | "campaignsAsFollowup1"
  | "campaignsAsFollowup2"
  | "campaignsAsFinal"
  | "emailQueue"
> & {
  subjectB?: string;
};

interface CreateTemplateDialogProps {
  children?: React.ReactNode;
}

function getMutationMessage(error: unknown, fallback: string) {
  const maybeError = error as { data?: { message?: string } };
  return maybeError.data?.message || fallback;
}

export function CreateTemplateDialog({ children }: CreateTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [createTemplate, { isLoading }] = useCreateTemplateMutation();

  const form = useForm<CreateTemplateFormValues>({
    defaultValues: {
      name: "",
      type: "INITIAL" as TemplateTypeEnum,
      subjectA: "",
      subjectB: "",
      body: "",
      usedVariables: [],
    },
  });

  const bodyValue = useWatch({ control: form.control, name: "body" }) || "";
  const subjectAValue = useWatch({ control: form.control, name: "subjectA" }) || "";
  const subjectBValue = useWatch({ control: form.control, name: "subjectB" }) || "";
  const formType = useWatch({ control: form.control, name: "type" }) || ("INITIAL" as TemplateTypeEnum);

  const wordCount = bodyValue.trim().split(/\s+/).filter(Boolean).length;
  const isABTest = Boolean(subjectBValue.trim());

  // Automatically extracts variables matching {{variable_name}} syntax dynamically
  const extractedVariables = Array.from(
    new Set(
      bodyValue.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g)?.map((v) => v.replace(/[\{\}\s]/g, "")) || []
    )
  );

  async function onSubmit(values: CreateTemplateFormValues) {
    // Custom native validation layer safely bypassing third-party zod schemas
    let hasErrors = false;

    if (!values.name || values.name.trim().length < 3) {
      form.setError("name", { type: "manual", message: "Name must be at least 3 characters" });
      hasErrors = true;
    }
    if (!values.subjectA || values.subjectA.trim().length < 5) {
      form.setError("subjectA", { type: "manual", message: "Subject A must be at least 5 characters" });
      hasErrors = true;
    }
    if (!values.body || values.body.trim().length < 20) {
      form.setError("body", { type: "manual", message: "Body text must be at least 20 characters" });
      hasErrors = true;
    }

    if (hasErrors) return;

    try {
      await createTemplate({
        ...values,
        subjectB: values.subjectB?.trim() || undefined,
        usedVariables: extractedVariables,
      }).unwrap();

      toast.success("Template created successfully");
      form.reset();
      setOpen(false);
    } catch (error: unknown) {
      toast.error(getMutationMessage(error, "Failed to create template"));
    }
  }

  const selectedStageLabel = TEMPLATE_STAGE_LABELS[formType] || "Initial email";
  const previewText = bodyValue.trim() ? bodyValue : "No body content yet. Write some copy to populate the live preview panel.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">New Template</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-5xl! h-[85vh] flex flex-col p-0 gap-0 overflow-hidden border-muted shadow-2xl">
        {/* Header section */}
        <DialogHeader className="border-b bg-muted/10 px-6 py-4 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold tracking-tight">New Outreach Template</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Configure messaging variants and review variable parsing in real time.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Dynamic Split Working Workspace */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 overflow-hidden">
            
            {/* Primary Fields Panel */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-background">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90">Template Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Inbound Pitch — Variant A" className="bg-background shadow-none" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90">Sequence Stage *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="bg-background shadow-none">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INITIAL">Initial outreach</SelectItem>
                          <SelectItem value="FOLLOWUP_1">Follow-up 1</SelectItem>
                          <SelectItem value="FOLLOWUP_2">Follow-up 2</SelectItem>
                          <SelectItem value="FINAL">Breakup / Final</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="subjectA"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90">Subject Line A *</FormLabel>
                      <FormControl>
                        <Input placeholder="Quick thought regarding {{businessName}}" className="bg-background shadow-none" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subjectB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90 flex items-center justify-between">
                        Subject Line B
                        <span className="text-[10px] font-normal normal-case text-muted-foreground">Optional A/B Variant</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Partnership opportunity for {{firstName}}?" className="bg-background shadow-none" {...field} />
                      </FormControl>
                      <FormMessage className="text-xs font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="flex items-center justify-between mb-1">
                      <FormLabel className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground/90">Email Content *</FormLabel>
                      <span className="text-[11px] font-mono text-muted-foreground/70 bg-muted px-2 py-0.5 rounded-sm">{wordCount} words</span>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder={`Hi {{firstName}},\n\nI spent some time looking into {{businessName}} and noticed an optimization opportunity.\n\nAre you open to a brief alignment call next week?\n\nBest regards,\n{{your_name}}`}
                        className="min-h-[240px] font-mono text-xs leading-relaxed p-4 resize-none bg-background border-input shadow-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-[11px] text-muted-foreground/80 flex items-start gap-1 mt-1.5">
                      <HelpCircle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground/60" />
                      Use brackets like {"{{firstName}}"} or {"{{businessName}}"} to inject dynamic data context per prospect.
                    </FormDescription>
                    <FormMessage className="text-xs font-medium" />
                  </FormItem>
                )}
              />
            </div>

            {/* Premium Enterprise Context Inspector & Live Preview Side panel */}
            <div className="w-[320px] bg-muted/20 border-l p-5 space-y-5 flex flex-col justify-between">
              <div className="space-y-5 flex-1 overflow-y-auto">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90">Metadata Summary</h4>
                    <Badge variant={isABTest ? "default" : "secondary"} className="rounded text-[10px] tracking-wide font-medium shadow-none px-2 py-0">
                      {isABTest ? "A/B SPLIT ACTIVE" : "SINGLE TEST"}
                    </Badge>
                  </div>
                  <div className="rounded-md border bg-background p-3 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sequence State:</span>
                      <span className="font-semibold text-foreground">{selectedStageLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Auto-Extracted Tokens ({extractedVariables.length})
                  </h4>
                  {extractedVariables.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {extractedVariables.map((variable) => (
                        <Badge key={variable} variant="outline" className="font-mono text-[10px] bg-background border-primary/20 text-primary rounded px-1.5 py-0">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-center bg-background/50">
                      <p className="text-[11px] text-muted-foreground/70">
                        No dynamic tokens detected in copy body.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex flex-col">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/90">Real-Time Preview</h4>
                  <div className="rounded-md border bg-background p-3 overflow-y-auto max-h-[190px] text-xs">
                    <div className="text-[11px] font-mono text-muted-foreground/80 border-b pb-1.5 mb-2 space-y-0.5">
                      <div className="truncate"><span className="font-medium text-foreground/80">Sub A:</span> {subjectAValue || "(Empty)"}</div>
                      {isABTest && <div className="truncate"><span className="font-medium text-foreground/80">Sub B:</span> {subjectBValue}</div>}
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed font-sans text-foreground/90 text-[11px]">
                      {previewText}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div className="pt-4 border-t flex flex-col-reverse gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                  className="w-full text-xs shadow-none border-input h-9"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isLoading} className="w-full text-xs font-medium h-9 shadow-none">
                  {isLoading ? "Saving Template..." : "Create Template"}
                </Button>
              </div>
            </div>

          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}