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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUpdateTemplateMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Template } from "@/redux/features/templates/templates.api";

const updateTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  type: z.enum(["INITIAL", "FOLLOWUP_1", "FOLLOWUP_2", "FINAL"]),
  subjectA: z.string().min(1, "Subject A is required"),
  subjectB: z.string().optional(),
  body: z.string().min(1, "Body is required"),
});

type UpdateTemplateFormValues = z.infer<typeof updateTemplateSchema>;

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

  async function onSubmit(values: UpdateTemplateFormValues) {
    try {
      await updateTemplate({
        id: template.id,
        data: values,
      }).unwrap();

      toast.success("Template updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update template");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm" variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Email Template</DialogTitle>
          <DialogDescription>
            Update template content and A/B test variants
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name and Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Feature Announcement" {...field} />
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
                    <FormLabel>Template Type *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INITIAL">Initial Outreach</SelectItem>
                        <SelectItem value="FOLLOWUP_1">Follow-up 1</SelectItem>
                        <SelectItem value="FOLLOWUP_2">Follow-up 2</SelectItem>
                        <SelectItem value="FINAL">Final Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* A/B Testing Section */}
            <div className="border rounded-lg p-4 bg-muted/40">
              <h3 className="font-semibold text-sm mb-4">A/B Test Subjects</h3>
              <Tabs defaultValue="subject-a" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="subject-a">Subject A (Primary)</TabsTrigger>
                  <TabsTrigger value="subject-b">Subject B (Optional)</TabsTrigger>
                </TabsList>

                <TabsContent value="subject-a" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="subjectA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject A *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Check out our latest update"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          This is the main subject line used for this template
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="subject-b" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="subjectB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject B (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Quick question about your business"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty to disable A/B testing for this template
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Body */}
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Body *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Hi {{firstName}},

I wanted to reach out because...

Best regards"
                      className="resize-none font-mono text-sm"
                      rows={8}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Use {{firstName}}, {{lastName}}, {{email}} for personalization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
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
                {isLoading ? "Updating..." : "Update Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
