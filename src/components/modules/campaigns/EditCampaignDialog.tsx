"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import {
  useGetMailboxesQuery,
  useGetTemplatesQuery,
  useUpdateCampaignMutation,
} from "@/redux/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Campaign } from "@/redux/features/campaigns/campaigns.api";

const NO_TEMPLATE = "NO_TEMPLATE";

const updateCampaignSchema = z.object({
  name: z.string().min(1, "Campaign name is required").min(3, "Name must be at least 3 characters"),
  category: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  mailboxId: z.string().min(1, "Mailbox is required"),
  initialTemplateId: z.string().min(1, "Initial template is required"),
  followup1TemplateId: z.string().optional(),
  followup2TemplateId: z.string().optional(),
  finalTemplateId: z.string().optional(),
  sendWindow: z.string().min(1, "Send window is required"),
  followup1Days: z.coerce.number().positive(),
  followup2Days: z.coerce.number().positive(),
  finalDays: z.coerce.number().positive(),
});

type UpdateCampaignFormValues = z.infer<typeof updateCampaignSchema>;

interface EditCampaignDialogProps {
  campaign: Campaign;
  children?: React.ReactNode;
}

export function EditCampaignDialog({ campaign, children }: EditCampaignDialogProps) {
  const [open, setOpen] = useState(false);
  const [updateCampaign, { isLoading }] = useUpdateCampaignMutation();
  const { data: mailboxesData } = useGetMailboxesQuery({ page: 1, limit: 100 });
  const { data: templatesData } = useGetTemplatesQuery({ page: 1, limit: 100 });

  const form = useForm<UpdateCampaignFormValues>({
    resolver: zodResolver(updateCampaignSchema) as unknown as Resolver<UpdateCampaignFormValues>,
    defaultValues: {
      name: campaign.name,
      category: campaign.category ?? "",
      country: campaign.country ?? "",
      city: campaign.city ?? "",
      mailboxId: campaign.mailboxId,
      initialTemplateId: campaign.initialTemplateId,
      followup1TemplateId: campaign.followup1TemplateId ?? "",
      followup2TemplateId: campaign.followup2TemplateId ?? "",
      finalTemplateId: campaign.finalTemplateId ?? "",
      sendWindow: campaign.sendWindow,
      followup1Days: campaign.followup1Days,
      followup2Days: campaign.followup2Days,
      finalDays: campaign.finalDays,
    },
  });

  async function onSubmit(values: UpdateCampaignFormValues) {
    try {
      await updateCampaign({
        id: campaign.id,
        data: {
          ...values,
          category: values.category || undefined,
          country: values.country || undefined,
          city: values.city || undefined,
          followup1TemplateId: values.followup1TemplateId || null,
          followup2TemplateId: values.followup2TemplateId || null,
          finalTemplateId: values.finalTemplateId || null,
        },
      }).unwrap();

      toast.success("Campaign updated successfully");
      setOpen(false);
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof error.data === "object" &&
        error.data !== null &&
        "message" in error.data &&
        typeof error.data.message === "string"
          ? error.data.message
          : "Failed to update campaign";

      toast.error(message);
    }
  }

  const mailboxes = mailboxesData?.data || [];
  const templates = templatesData?.data || [];
  const initialTemplates = templates.filter((template) => template.type === "INITIAL");
  const followup1Templates = templates.filter((template) => template.type === "FOLLOWUP_1");
  const followup2Templates = templates.filter((template) => template.type === "FOLLOWUP_2");
  const finalTemplates = templates.filter((template) => template.type === "FINAL");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm" variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-[860px]">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update targeting, sending account, templates, and follow-up timing.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[inherit] flex-col">
            <div className="space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Campaign Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Update the campaign identity, targeting, and sending account.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="car wash" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Auckland" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="New Zealand" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Email Templates</h3>
                  <p className="text-sm text-muted-foreground">
                    Change the initial email or optional follow-up sequence.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                              <SelectValue placeholder="Select follow-up template" />
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
                              <SelectValue placeholder="Select follow-up template" />
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
                              <SelectValue placeholder="Select final template" />
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
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Timing & Schedule</h3>
                  <p className="text-sm text-muted-foreground">
                    Control when emails are sent and how long each follow-up waits.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="sendWindow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Send Window *</FormLabel>
                      <FormControl>
                        <Input placeholder="09:00-11:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="followup1Days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Follow-up #1 (Days)</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
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
                          <Input type="number" min="1" {...field} />
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
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="border-t px-6 py-5">
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
                {isLoading ? "Updating..." : "Update Campaign"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
