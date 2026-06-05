"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTemplateMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const createTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required").min(3, "Name must be at least 3 characters"),
  type: z.enum(["INITIAL", "FOLLOWUP_1", "FOLLOWUP_2", "FINAL"]),
  subjectA: z.string().min(1, "Subject A is required").min(5, "Subject must be at least 5 characters"),
  subjectB: z.string().optional(),
  body: z.string().min(1, "Email body is required").min(20, "Body must be at least 20 characters"),
});

type CreateTemplateFormValues = z.infer<typeof createTemplateSchema>;

function getMutationMessage(error: unknown, fallback: string) {
  const maybeError = error as { data?: { message?: string } };
  return maybeError.data?.message || fallback;
}

export function CreateTemplateDialog() {
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

  async function onSubmit(values: CreateTemplateFormValues) {
    try {
      await createTemplate({
        name: values.name,
        type: values.type,
        subjectA: values.subjectA,
        subjectB: values.subjectB,
        body: values.body,
      }).unwrap();

      toast.success("Template created successfully");
      form.reset();
      setOpen(false);
    } catch (error: unknown) {
      toast.error(getMutationMessage(error, "Failed to create template"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Email Template</DialogTitle>
          <DialogDescription>
            Create a reusable email template with A/B testing support for subject lines.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cold Outreach #1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Type *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INITIAL">Initial Email</SelectItem>
                      <SelectItem value="FOLLOWUP_1">Follow-up #1</SelectItem>
                      <SelectItem value="FOLLOWUP_2">Follow-up #2</SelectItem>
                      <SelectItem value="FINAL">Final Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Determines when this email is sent in the campaign sequence
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject A/B Testing */}
            <div className="space-y-3 p-4 bg-muted/40 rounded-lg">
              <h3 className="font-semibold text-sm">Subject Lines (A/B Testing)</h3>

              <FormField
                control={form.control}
                name="subjectA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line A (Variant 1) *</FormLabel>
                    <FormControl>
                      <Input placeholder="Quick question about your {{businessType}}" {...field} />
                    </FormControl>
                    <FormDescription>
                      50% of recipients will receive this subject line
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subjectB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Line B (Variant 2)</FormLabel>
                    <FormControl>
                      <Input placeholder="Can I help you with {{your_service}}?" {...field} />
                    </FormControl>
                    <FormDescription>
                      50% of recipients will receive this subject line (leave empty to skip A/B testing)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Email Body */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Body *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hi {{name}},

I came across {{businessName}} and thought of you because...

Your service: {{your_service}}

Looking forward to hearing from you!

Best regards,
{{your_name}}"
                      className="resize-none h-48"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use placeholders: {"{{"} name {"}}"}, {"{{"} businessName {"}}"}, {"{{"} your_service {"}}"}, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
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
                {isLoading ? "Creating..." : "Create Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
