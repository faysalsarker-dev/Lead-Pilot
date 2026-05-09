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
import { useCreateCampaignMutation, useGetMailboxesQuery, useGetTemplatesQuery } from "@/redux/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const NO_TEMPLATE = "NO_TEMPLATE";

const createCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").min(3, "Name must be at least 3 characters"),
  mailboxId: z.string().min(1, "Mailbox is required"),
  initialTemplateId: z.string().min(1, "Initial template is required"),
  followup1TemplateId: z.string().optional(),
  followup2TemplateId: z.string().optional(),
  finalTemplateId: z.string().optional(),
  sendWindow: z.string().optional(),
  followup1Days: z.coerce.number().positive().optional(),
  followup2Days: z.coerce.number().positive().optional(),
  finalDays: z.coerce.number().positive().optional(),
});

type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>;

export function CreateCampaignDialog() {
  const [open, setOpen] = useState(false);
  const [createCampaign, { isLoading }] = useCreateCampaignMutation();
  const { data: mailboxesData } = useGetMailboxesQuery({});
  const { data: templatesData } = useGetTemplatesQuery({});

  const form = useForm<CreateCampaignFormValues>({
    resolver: zodResolver(createCampaignSchema),
    defaultValues: {
      name: "",
      mailboxId: "",
      initialTemplateId: "",
      followup1TemplateId: "",
      followup2TemplateId: "",
      finalTemplateId: "",
      sendWindow: "09:00-11:00",
      followup1Days: 3,
      followup2Days: 5,
      finalDays: 7,
    },
  });

  async function onSubmit(values: CreateCampaignFormValues) {
    try {
      await createCampaign({
        name: values.name,
        mailboxId: values.mailboxId,
        initialTemplateId: values.initialTemplateId,
        followup1TemplateId: values.followup1TemplateId || undefined,
        followup2TemplateId: values.followup2TemplateId || undefined,
        finalTemplateId: values.finalTemplateId || undefined,
        sendWindow: values.sendWindow,
        followup1Days: values.followup1Days,
        followup2Days: values.followup2Days,
        finalDays: values.finalDays,
      }).unwrap();

      toast.success("Campaign created successfully");
      form.reset();
      setOpen(false);
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

  const mailboxes = mailboxesData?.data || [];
  const templates = templatesData?.data || [];
  const initialTemplates = templates.filter((t) => t.type === "INITIAL");
  const followup1Templates = templates.filter((t) => t.type === "FOLLOWUP_1");
  const followup2Templates = templates.filter((t) => t.type === "FOLLOWUP_2");
  const finalTemplates = templates.filter((t) => t.type === "FINAL");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Create Campaign</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Email Campaign</DialogTitle>
          <DialogDescription>
            Set up a new email campaign with templates and follow-up timing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Campaign Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Q2 Outreach Campaign" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mailbox Selection */}
            <FormField
              control={form.control}
              name="mailboxId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mailbox *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a mailbox" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {mailboxes.map((mailbox) => (
                        <SelectItem key={mailbox.id} value={mailbox.id}>
                          {mailbox.label} ({mailbox.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template Selection */}
            <div className="space-y-4 p-4 bg-muted/40 rounded-lg">
              <h3 className="font-semibold text-sm">Email Templates</h3>

              <FormField
                control={form.control}
                name="initialTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Email *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select initial template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {initialTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followup1TemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up #1</FormLabel>
                    <Select
                      value={field.value || NO_TEMPLATE}
                      onValueChange={(value) => field.onChange(value === NO_TEMPLATE ? "" : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select follow-up template (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_TEMPLATE}>None</SelectItem>
                        {followup1Templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="followup2TemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up #2</FormLabel>
                    <Select
                      value={field.value || NO_TEMPLATE}
                      onValueChange={(value) => field.onChange(value === NO_TEMPLATE ? "" : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select follow-up template (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_TEMPLATE}>None</SelectItem>
                        {followup2Templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="finalTemplateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Email</FormLabel>
                    <Select
                      value={field.value || NO_TEMPLATE}
                      onValueChange={(value) => field.onChange(value === NO_TEMPLATE ? "" : value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select final template (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={NO_TEMPLATE}>None</SelectItem>
                        {finalTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Send Window and Timing */}
            <div className="space-y-4 p-4 bg-muted/40 rounded-lg">
              <h3 className="font-semibold text-sm">Timing & Schedule</h3>

              <FormField
                control={form.control}
                name="sendWindow"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Window (Local Time)</FormLabel>
                    <FormControl>
                      <Input placeholder="09:00-11:00" {...field} />
                    </FormControl>
                    <FormDescription>
                      Recipients will receive emails within this time window in their timezone
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="followup1Days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up #1 (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="followup2Days"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Follow-up #2 (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="finalDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final (Days)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="7" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
                {isLoading ? "Creating..." : "Create Campaign"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
