"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTemplateMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { FileText, Loader2 } from "lucide-react";
import type { TemplateCreateInput } from "@/app/generated/prisma/models/Template";
import type { TemplateType as TemplateTypeEnum } from "@/app/generated/prisma/browser";
import { TemplateType as PrismaTemplateType } from "@/app/generated/prisma/browser";

const createTemplateSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.nativeEnum(PrismaTemplateType),
  subjectA: z.string().min(5, "Subject must be at least 5 characters"),
  subjectB: z.string().optional(),
  body: z.string().min(20, "Body must be at least 20 characters"),
});

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
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: "",
      type: "INITIAL",
      subjectA: "",
      subjectB: "",
      body: "",
    },
  });

  const bodyValue =
    useWatch<CreateTemplateFormValues>({
      control: form.control,
      name: "body",
      defaultValue: "",
    }) || "";
  const subjectBValue =
    useWatch<CreateTemplateFormValues>({
      control: form.control,
      name: "subjectB",
      defaultValue: "",
    }) || "";
  const formType =
    useWatch<CreateTemplateFormValues>({
      control: form.control,
      name: "type",
      defaultValue: "INITIAL",
    }) as TemplateTypeEnum;

  const wordCount = bodyValue.trim().split(/\s+/).filter(Boolean).length;
  const isABTest = Boolean(subjectBValue);

  async function onSubmit(values: CreateTemplateFormValues) {
    try {
      await createTemplate({
        ...values,
        subjectB: values.subjectB || undefined,
      }).unwrap();

      toast.success("Template created successfully");
      form.reset();
      setOpen(false);
    } catch (error: unknown) {
      toast.error(getMutationMessage(error, "Failed to create template"));
    }
  }

  const selectedStageLabel = TEMPLATE_STAGE_LABELS[formType] || "Initial email";
  const previewText = bodyValue
    ? bodyValue.trim().replace(/\s+/g, " ")
    : "Write the email body to preview it here.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">New template</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>New outreach template</DialogTitle>
              <DialogDescription className="mt-1 text-sm text-muted-foreground">
                Build a polished campaign template with subject variants and a concise body.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6 pt-5">
            <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template name *</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g. Design agency prospect" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sequence stage *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="INITIAL">Initial email</SelectItem>
                            <SelectItem value="FOLLOWUP_1">Follow-up 1</SelectItem>
                            <SelectItem value="FOLLOWUP_2">Follow-up 2</SelectItem>
                            <SelectItem value="FINAL">Final email</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="subjectA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject A *</FormLabel>
                        <FormControl>
                          <Input placeholder="Quick idea for {{businessName}}" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subjectB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject B</FormLabel>
                        <FormControl>
                          <Input placeholder="Worth a quick look, {{firstName}}?" {...field} />
                        </FormControl>
                        <FormDescription>Leave blank to keep one subject line.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <aside className="rounded-3xl border bg-muted/50 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                      Template summary
                    </p>
                    <p className="mt-3 text-sm font-medium">{selectedStageLabel}</p>
                  </div>
                  <Badge variant="outline" className="h-8 px-3 text-xs font-medium uppercase tracking-[0.24em]">
                    {isABTest ? "A/B" : "Single"}
                  </Badge>
                </div>

                <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                  <p>
                    Keep copy tight, relevant, and easy to respond to. The body should feel human
                    and direct.
                  </p>
                  <div className="rounded-2xl bg-background p-4 text-sm shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Preview
                    </p>
                    <p className="mt-3 min-h-20 text-sm leading-6 text-foreground">
                      {previewText}
                    </p>
                  </div>
                </div>
              </aside>
            </section>

            <Separator />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <FormLabel>Email body *</FormLabel>
                    <span className="text-xs text-muted-foreground">{wordCount} words</span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder={`Hi {{firstName}},

I noticed {{businessName}} and had a specific idea around {{your_service}}.

Would it be useful if I sent over a quick example?

Best,
{{your_name}}`}
                      className="min-h-64 resize-y font-mono text-sm leading-6"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Placeholder examples: {"{{firstName}}"}, {"{{businessName}}"}, {"{{your_service}}"}, {"{{your_name}}"}.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLoading ? "Creating..." : "Create template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
