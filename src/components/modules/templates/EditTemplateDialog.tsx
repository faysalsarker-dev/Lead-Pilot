"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useUpdateTemplateMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { FileText, FlaskConical, Loader2, MailCheck, Sparkles } from "lucide-react";
import type { Template } from "@/redux/features/templates/templates.api";

const updateTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  type: z.enum(["INITIAL", "FOLLOWUP_1", "FOLLOWUP_2", "FINAL"]),
  subjectA: z.string().min(1, "Subject A is required"),
  subjectB: z.string().optional(),
  body: z.string().min(1, "Body is required"),
});

type UpdateTemplateFormValues = z.infer<typeof updateTemplateSchema>;

function getMutationMessage(error: unknown, fallback: string) {
  const maybeError = error as { data?: { message?: string } };
  return maybeError.data?.message || fallback;
}

interface EditTemplateDialogProps {
  template: Template;
  children?: React.ReactNode;
}

export function EditTemplateDialog({ template, children }: EditTemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const [updateTemplate, { isLoading }] = useUpdateTemplateMutation();

  const form = useForm<UpdateTemplateFormValues>({
    resolver: zodResolver(updateTemplateSchema),
    defaultValues: {
      name: template.name,
      type: template.type,
      subjectA: template.subjectA || "",
      subjectB: template.subjectB || "",
      body: template.body || "",
    },
  });

  useEffect(() => {
    if (!open) return;

    form.reset({
      name: template.name,
      type: template.type,
      subjectA: template.subjectA || "",
      subjectB: template.subjectB || "",
      body: template.body || "",
    });
  }, [form, open, template]);

  const bodyValue = form.watch("body") || "";
  const subjectBValue = form.watch("subjectB") || "";
  const wordCount = bodyValue.trim().split(/\s+/).filter(Boolean).length;

  async function onSubmit(values: UpdateTemplateFormValues) {
    try {
      await updateTemplate({
        id: template.id,
        data: {
          ...values,
          subjectB: values.subjectB || undefined,
        },
      }).unwrap();

      toast.success("Template updated successfully");
      setOpen(false);
    } catch (error: unknown) {
      toast.error(getMutationMessage(error, "Failed to update template"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        <DialogHeader className="border-b px-6 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle>Edit template</DialogTitle>
              <DialogDescription className="mt-1">
                Update sequence placement, subject variants, and body copy.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 px-6 py-5">
            <section className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Template name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Feature announcement follow-up" {...field} />
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

              <aside className="rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MailCheck className="h-4 w-4 text-primary" />
                  Delivery fit
                </div>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p>{wordCount} words in the current body.</p>
                  <p>{subjectBValue ? "A/B subject testing is enabled." : "Using one subject line."}</p>
                  <p>Keep edits aligned with the stage this template belongs to.</p>
                </div>
              </aside>
            </section>

            <Separator />

            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold">Subject variants</h3>
                  <p className="text-sm text-muted-foreground">
                    Tune the subject lines without losing the body context below.
                  </p>
                </div>
                <Badge variant="outline" className="gap-1.5">
                  <FlaskConical className="h-3.5 w-3.5" />
                  {subjectBValue ? "A/B enabled" : "Single subject"}
                </Badge>
              </div>

              <Tabs defaultValue="subject-a" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="subject-a">Subject A</TabsTrigger>
                  <TabsTrigger value="subject-b">Subject B</TabsTrigger>
                </TabsList>
                <TabsContent value="subject-a" className="mt-4">
                  <FormField
                    control={form.control}
                    name="subjectA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject A *</FormLabel>
                        <FormControl>
                          <Input placeholder="Quick idea for {{businessName}}" {...field} />
                        </FormControl>
                        <FormDescription>Main subject line used for this template.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
                <TabsContent value="subject-b" className="mt-4">
                  <FormField
                    control={form.control}
                    name="subjectB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject B</FormLabel>
                        <FormControl>
                          <Input placeholder="Worth a quick look, {{firstName}}?" {...field} />
                        </FormControl>
                        <FormDescription>Leave empty to disable A/B testing.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </section>

            <Separator />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <FormLabel>Email body *</FormLabel>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5" />
                      {wordCount} words
                    </span>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder={`Hi {{firstName}},

I wanted to reach out because...

Best,
{{your_name}}`}
                      className="min-h-64 resize-y font-mono text-sm leading-6"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Common placeholders: {"{{firstName}}"}, {"{{lastName}}"}, {"{{email}}"}, {"{{businessName}}"}.
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
                {isLoading ? "Updating..." : "Update template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
