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
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateMailboxMutation, useUpdateMailboxMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Mailbox } from "@/redux/features/mailboxes/mailboxes.api";

const mailboxSchema = z.object({
  label: z.string().min(1, "Label is required").min(2, "Label must be at least 2 characters"),
  type: z.enum(["GMAIL_OAUTH", "CUSTOM_SMTP"]),
  isDefault: z.boolean().default(false),
  // Gmail OAuth fields
  gmailRefreshToken: z.string().optional(),
  // SMTP fields
  smtpHost: z.string().optional(),
  smtpPort: z.coerce.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassEnc: z.string().optional(),
  // IMAP fields (both types)
  imapHost: z.string().optional(),
  imapPort: z.coerce.number().optional(),
  imapUser: z.string().optional(),
  imapPassEnc: z.string().optional(),
});

type MailboxFormValues = z.infer<typeof mailboxSchema>;

interface MailboxDialogProps {
  mailbox?: Mailbox;
  children?: React.ReactNode;
}

export function MailboxDialog({ mailbox, children }: MailboxDialogProps) {
  const [open, setOpen] = useState(false);
  const [createMailbox, { isLoading: isCreating }] = useCreateMailboxMutation();
  const [updateMailbox, { isLoading: isUpdating }] = useUpdateMailboxMutation();

  const isEditing = !!mailbox;
  const isLoading = isCreating || isUpdating;

  const form = useForm<MailboxFormValues>({
    resolver: zodResolver(mailboxSchema),
    defaultValues: mailbox || {
      label: "",
      type: "GMAIL_OAUTH",
      isDefault: false,
      gmailRefreshToken: "",
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassEnc: "",
      imapHost: "",
      imapPort: 993,
      imapUser: "",
      imapPassEnc: "",
    },
  });

  const mailboxType = form.watch("type");

  async function onSubmit(values: MailboxFormValues) {
    try {
      if (isEditing && mailbox) {
        await updateMailbox({
          id: mailbox.id,
          data: values,
        }).unwrap();
        toast.success("Mailbox updated successfully");
      } else {
        await createMailbox(values).unwrap();
        toast.success("Mailbox created successfully");
      }
      form.reset();
      setOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to save mailbox");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">{isEditing ? "Edit" : "Add Mailbox"}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Mailbox" : "Add New Mailbox"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your email mailbox configuration"
              : "Connect a new email account for sending campaigns"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Label */}
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mailbox Label *</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Outreach" {...field} />
                  </FormControl>
                  <FormDescription>A friendly name for this mailbox</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mailbox Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Provider *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="GMAIL_OAUTH">Gmail (OAuth)</SelectItem>
                      <SelectItem value="CUSTOM_SMTP">Custom SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Choose your email provider</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Gmail OAuth Section */}
            {mailboxType === "GMAIL_OAUTH" && (
              <div className="space-y-4 p-4 bg-muted/40 rounded-lg">
                <h3 className="font-semibold text-sm">Gmail OAuth Setup</h3>
                <FormField
                  control={form.control}
                  name="gmailRefreshToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refresh Token</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Paste your Gmail refresh token"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Get this from Google Cloud Console OAuth setup
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Custom SMTP Section */}
            {mailboxType === "CUSTOM_SMTP" && (
              <div className="space-y-4 p-4 bg-muted/40 rounded-lg">
                <h3 className="font-semibold text-sm">SMTP Configuration</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtpHost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Host</FormLabel>
                        <FormControl>
                          <Input placeholder="smtp.gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPort"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Port</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="587" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="smtpUser"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Username</FormLabel>
                        <FormControl>
                          <Input placeholder="your-email@gmail.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="smtpPassEnc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SMTP Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your SMTP password"
                            type="password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* IMAP Section (both types) */}
            <div className="space-y-4 p-4 bg-muted/40 rounded-lg">
              <h3 className="font-semibold text-sm">IMAP Configuration (for replies)</h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imapHost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMAP Host</FormLabel>
                      <FormControl>
                        <Input placeholder="imap.gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imapPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMAP Port</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="993" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="imapUser"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMAP Username</FormLabel>
                      <FormControl>
                        <Input placeholder="your-email@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="imapPassEnc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IMAP Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your IMAP password"
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Set as Default */}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div>
                    <FormLabel className="cursor-pointer">Set as default mailbox</FormLabel>
                    <FormDescription>
                      This mailbox will be used for new campaigns by default
                    </FormDescription>
                  </div>
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
                {isLoading ? "Saving..." : isEditing ? "Update Mailbox" : "Create Mailbox"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
