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
import { useGetMailboxesQuery, useUpdateCampaignMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Campaign } from "@/redux/features/campaigns/campaigns.api";

const updateCampaignSchema = z.object({
  name: z.string().min(1, "Name is required").min(2, "Name must be at least 2 characters"),
  mailboxId: z.string().min(1, "Mailbox is required"),
  subject: z.string().min(1, "Subject is required"),
  bodyTemplate: z.string().min(1, "Body is required"),
  sendWindowStart: z.coerce.number().int().min(0).max(23),
  sendWindowEnd: z.coerce.number().int().min(0).max(23),
  followupDay1: z.coerce.number().int().min(0).max(30),
  followupDay2: z.coerce.number().int().min(0).max(30),
  notes: z.string().optional(),
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

  const mailboxes = mailboxesData?.data || [];

  const form = useForm<UpdateCampaignFormValues>({
    resolver: zodResolver(updateCampaignSchema) as unknown as Resolver<UpdateCampaignFormValues>,
    defaultValues: {
      name: campaign.name,
      mailboxId: campaign.mailboxId,
      subject: campaign.subject || "",
      bodyTemplate: campaign.bodyTemplate || "",
      sendWindowStart: campaign.sendWindowStart || 9,
      sendWindowEnd: campaign.sendWindowEnd || 17,
      followupDay1: campaign.followupDay1 || 3,
      followupDay2: campaign.followupDay2 || 7,
      notes: campaign.notes || "",
    },
  });

  async function onSubmit(values: UpdateCampaignFormValues) {
    try {
      await updateCampaign({
        id: campaign.id,
        data: values,
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm" variant="outline">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden p-0 sm:max-w-[860px]">
        <DialogHeader className="border-b px-6 py-5 pr-12">
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>
            Update campaign settings and content
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-h-[inherit] flex-col">
            <div className="space-y-5 overflow-y-auto px-6 py-5">
              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Campaign Setup</h3>
                  <p className="text-sm text-muted-foreground">
                    Update the campaign identity and sending account.
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
                          <Input placeholder="Summer Product Launch" {...field} />
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
                              <SelectValue />
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
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Email Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep the subject and body aligned with this campaign.
                  </p>
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject *</FormLabel>
                        <FormControl>
                          <Input placeholder="Check out our new features" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bodyTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Body *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write your email content..."
                            className="min-h-36 resize-y"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold">Timing & Follow-ups</h3>
                  <p className="text-sm text-muted-foreground">
                    Set the sending window and follow-up delays.
                  </p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sendWindowStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Window Start (Hour)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="23" {...field} />
                    </FormControl>
                    <FormDescription>24-hour format (0-23)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sendWindowEnd"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send Window End (Hour)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="23" {...field} />
                    </FormControl>
                    <FormDescription>24-hour format (0-23)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="followupDay1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up 1 (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="30" {...field} />
                    </FormControl>
                    <FormDescription>Days until first follow-up</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="followupDay2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up 2 (Days)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="30" {...field} />
                    </FormControl>
                    <FormDescription>Days until second follow-up</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add internal notes..."
                          className="min-h-24 resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
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
