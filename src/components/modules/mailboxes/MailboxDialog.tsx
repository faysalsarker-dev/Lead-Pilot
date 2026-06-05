"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCreateMailboxMutation, useUpdateMailboxMutation } from "@/redux/hooks";
import { toast } from "sonner";
import {
  Loader2,
  CheckCircle2,
  AlertCircle,
  Mail,
  Shield,
  Server,
  Globe,
  Info,
} from "lucide-react";
import type { MailboxModel } from "@/app/generated/prisma/models";
import type { MailboxType, MailboxStatus } from "@/app/generated/prisma/enums";

// Use Prisma-generated Mailbox model type
type MailboxFormValues = Partial<Omit<MailboxModel, "id" | "userId" | "createdAt" | "updatedAt">>;

interface MailboxDialogProps {
  mailbox?: MailboxModel | null;
  children?: React.ReactNode;
}

// Status badge component
function StatusBadge({ status }: { status?: MailboxStatus }) {
  if (!status) return null;

  const statusConfig: Record<MailboxStatus, { label: string; color: string; icon: React.ReactNode }> = {
    UNTESTED: {
      label: "Not Tested",
      color: "bg-gray-100 text-gray-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    CONNECTED: {
      label: "Connected",
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    SMTP_ERROR: {
      label: "SMTP Error",
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    IMAP_ERROR: {
      label: "IMAP Error",
      color: "bg-red-100 text-red-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    AUTH_ERROR: {
      label: "Auth Error",
      color: "bg-orange-100 text-orange-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    RATE_LIMITED: {
      label: "Rate Limited",
      color: "bg-yellow-100 text-yellow-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
    DISCONNECTED: {
      label: "Disconnected",
      color: "bg-gray-100 text-gray-800",
      icon: <AlertCircle className="w-4 h-4" />,
    },
  };

  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={`${config.color} gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

// Type description helper
function getMailboxTypeInfo(type: MailboxType) {
  const info: Record<MailboxType, { label: string; description: string; icon: React.ReactNode }> = {
    GMAIL_OAUTH: {
      label: "Gmail (OAuth)",
      description: "Gmail with full OAuth2 - most reliable for sending and receiving",
      icon: <Mail className="w-5 h-5" />,
    },
    GMAIL_IMAP: {
      label: "Gmail (IMAP)",
      description: "Gmail using IMAP with App Password - polling every 15 minutes",
      icon: <Mail className="w-5 h-5" />,
    },
    CUSTOM_SMTP: {
      label: "Custom SMTP",
      description: "Any email host (Zoho, Namecheap, Fastmail, etc.) - requires IMAP for replies",
      icon: <Server className="w-5 h-5" />,
    },
    CLOUDFLARE_WORKER: {
      label: "Cloudflare Worker",
      description: "Custom domain with real-time webhook detection - no polling needed",
      icon: <Globe className="w-5 h-5" />,
    },
  };
  return info[type];
}

export function MailboxDialog({ mailbox, children }: MailboxDialogProps) {
  const [open, setOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [createMailbox, { isLoading: isCreating }] = useCreateMailboxMutation();
  const [updateMailbox, { isLoading: isUpdating }] = useUpdateMailboxMutation();

  const isEditing = !!mailbox;
  const isLoading = isCreating || isUpdating || testingConnection;

  const form = useForm<MailboxFormValues>({
    mode: "onBlur",
    defaultValues: mailbox ? {
      label: mailbox.label,
      fromName: mailbox.fromName ?? "",
      replyTo: mailbox.replyTo ?? "",
      type: mailbox.type as MailboxType,
      isDefault: mailbox.isDefault,
      isActive: mailbox.isActive,
      gmailEmail: mailbox.gmailEmail ?? "",
      gmailRefreshToken: mailbox.gmailRefreshToken ?? "",
      smtpHost: mailbox.smtpHost ?? "",
      smtpPort: mailbox.smtpPort ?? 587,
      smtpUser: mailbox.smtpUser ?? "",
      smtpPassEnc: mailbox.smtpPassEnc ?? "",
      smtpSsl: mailbox.smtpSsl ?? true,
      imapEnabled: mailbox.imapEnabled ?? false,
      imapHost: mailbox.imapHost ?? "",
      imapPort: mailbox.imapPort ?? 993,
      imapUser: mailbox.imapUser ?? "",
      imapPassEnc: mailbox.imapPassEnc ?? "",
      imapSsl: mailbox.imapSsl ?? true,
      fromDomain: mailbox.fromDomain ?? "",
      dailySendLimit: mailbox.dailySendLimit ?? 400,
    } : {
      label: "",
      fromName: "",
      replyTo: "",
      type: "GMAIL_OAUTH" as MailboxType,
      isDefault: false,
      isActive: true,
      gmailEmail: "",
      gmailRefreshToken: "",
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassEnc: "",
      smtpSsl: true,
      imapEnabled: false,
      imapHost: "",
      imapPort: 993,
      imapUser: "",
      imapPassEnc: "",
      imapSsl: true,
      fromDomain: "",
      dailySendLimit: 400,
    }
  });

  const mailboxType = (form.watch("type") || "GMAIL_OAUTH") as MailboxType;
  const imapEnabled = form.watch("imapEnabled") ?? false;

  const handleTestConnection = async () => {
    setTestingConnection(true);
    try {
      const response = await fetch(`/api/mailboxes/${mailbox?.id}/test-connection`, {
        method: "POST",
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("Connection test successful! ✓");
      } else {
        toast.error(data.message || "Connection test failed");
      }
    } catch {
      toast.error("Failed to test connection");
    } finally {
      setTestingConnection(false);
    }
  };

  async function onSubmit(values: MailboxFormValues) {
    try {
      if (isEditing && mailbox) {
        await updateMailbox({
          id: mailbox.id,
          data: values as Record<string, unknown>,
        }).unwrap();
        toast.success("Mailbox updated successfully");
      } else {
        await createMailbox(values as Record<string, unknown>).unwrap();
        toast.success("Mailbox created successfully");
      }
      form.reset();
      setOpen(false);
    } catch (error: unknown) {
      const errorMessage = error && typeof error === "object" && "data" in error 
        ? (error as Record<string, unknown>).data
        : "Failed to save mailbox";
      const message = errorMessage && typeof errorMessage === "object" && "message" in errorMessage
        ? (errorMessage as Record<string, unknown>).message
        : null;
      toast.error((message as string) || "Failed to save mailbox");
    }
  }

  const typeInfo = getMailboxTypeInfo(mailboxType);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button size="sm">{isEditing ? "Edit" : "Add Mailbox"}</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {typeInfo.icon}
            {isEditing ? "Edit Mailbox" : "Add New Mailbox"}
          </DialogTitle>
          <DialogDescription className="flex items-center justify-between">
            <span>
              {isEditing
                ? "Update your email mailbox configuration"
                : "Connect a new email account for sending campaigns"}
            </span>
            {isEditing && mailbox && (
              <StatusBadge status={mailbox.connectionStatus} />
            )}
          </DialogDescription>
          {isEditing && mailbox?.lastError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{mailbox.lastError}</AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Configuration Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basic Configuration</h3>

              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mailbox Label *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Main Outreach, Follow-ups, VIP Leads"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A friendly name to identify this mailbox
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Faysal Sarker"
                          disabled={isLoading}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Sender name shown in emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="replyTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-To Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Optional override address"
                          disabled={isLoading}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Where replies are directed (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Email Provider Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Email Provider</h3>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} disabled={isLoading || isEditing}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GMAIL_OAUTH">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Gmail (OAuth)
                            </div>
                          </SelectItem>
                          <SelectItem value="GMAIL_IMAP">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              Gmail (IMAP)
                            </div>
                          </SelectItem>
                          <SelectItem value="CUSTOM_SMTP">
                            <div className="flex items-center gap-2">
                              <Server className="w-4 h-4" />
                              Custom SMTP
                            </div>
                          </SelectItem>
                          <SelectItem value="CLOUDFLARE_WORKER">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              Cloudflare Worker
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription className="flex items-start gap-2 pt-2">
                      <Info className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{typeInfo.description}</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Configuration Tabs */}
            <Tabs defaultValue="sending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="sending">
                  <Mail className="w-4 h-4 mr-2" />
                  Sending
                </TabsTrigger>
                {["GMAIL_IMAP", "CUSTOM_SMTP"].includes(mailboxType ?? "") && (
                  <TabsTrigger value="receiving">
                    <Shield className="w-4 h-4 mr-2" />
                    Receiving
                  </TabsTrigger>
                )}
                {["GMAIL_OAUTH", "CUSTOM_SMTP"].includes(mailboxType ?? "") && (
                  <TabsTrigger value="advanced">
                    <Server className="w-4 h-4 mr-2" />
                    Advanced
                  </TabsTrigger>
                )}
              </TabsList>

              {/* Sending Tab */}
              <TabsContent value="sending" className="space-y-4 mt-4">
                {mailboxType === "GMAIL_OAUTH" && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <FormField
                      control={form.control}
                      name="gmailRefreshToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Gmail Refresh Token *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Paste your refresh token here"
                              type="password"
                              disabled={isLoading}
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormDescription>
                            Get this from Google Cloud Console. Your refresh token is securely encrypted.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {mailboxType === "GMAIL_IMAP" && (
                  <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                    <FormField
                      control={form.control}
                      name="gmailEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gmail Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your-email@gmail.com"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your Gmail account address
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {mailboxType === "CUSTOM_SMTP" && (
                  <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
                    <h4 className="font-semibold text-sm">SMTP Configuration</h4>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="smtpHost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SMTP Host *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="smtp.example.com"
                                disabled={isLoading}
                                {...field}
                              />
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
                            <FormLabel>SMTP Port *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="587"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              587 (TLS) or 465 (SSL)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="smtpSsl"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 mt-2">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                          </FormControl>
                          <FormLabel className="mt-0!">Use SSL/TLS</FormLabel>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="smtpUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username/Email *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="your-email@example.com"
                                disabled={isLoading}
                                {...field}
                              />
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
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="Your SMTP password"
                                disabled={isLoading}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Securely encrypted
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {mailboxType === "CLOUDFLARE_WORKER" && (
                  <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-900">
                    <FormField
                      control={form.control}
                      name="fromDomain"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Domain *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="example.com"
                              disabled={isLoading}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Your custom domain configured with Cloudflare
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </TabsContent>

              {/* Receiving Tab - IMAP */}
              {["GMAIL_IMAP", "CUSTOM_SMTP"].includes(mailboxType ?? "") && (
                <TabsContent value="receiving" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="imapEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                        </FormControl>
                        <div>
                        <FormLabel className="mt-0!">Enable IMAP Reply Detection</FormLabel>
                          <FormDescription>
                            Monitor for replies (scanned every 15 minutes)
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  {imapEnabled && (
                    <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
                      <h4 className="font-semibold text-sm">IMAP Configuration</h4>

                      {mailboxType === "GMAIL_IMAP" && (
                        <Alert variant="default" className="bg-blue-100 dark:bg-blue-900/30">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Use your Gmail App Password (16 chars), not your regular password. Generate one in your Google Account security settings.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="imapHost"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IMAP Host *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={mailboxType === "GMAIL_IMAP" ? "imap.gmail.com" : "imap.example.com"}
                                  disabled={isLoading}
                                  {...field}
                                />
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
                              <FormLabel>IMAP Port *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="993"
                                  disabled={isLoading}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Usually 993 (SSL) or 143 (TLS)
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="imapSsl"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                            </FormControl>
                            <FormLabel className="mt-0!">Use SSL/TLS</FormLabel>
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="imapUser"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username/Email *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={mailboxType === "GMAIL_IMAP" ? "your-email@gmail.com" : "your-email@example.com"}
                                  disabled={isLoading}
                                  {...field}
                                />
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
                              <FormLabel>Password/App Password *</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Your IMAP password"
                                  disabled={isLoading}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                Securely encrypted
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  )}
                </TabsContent>
              )}

              {/* Advanced Settings Tab */}
              {["GMAIL_OAUTH", "CUSTOM_SMTP"].includes(mailboxType ?? "") && (
                <TabsContent value="advanced" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="dailySendLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Send Limit</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            disabled={isLoading}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Maximum emails per day (default: 400 for Gmail)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                        </FormControl>
                        <div>
                          <FormLabel className="mt-0!">Active</FormLabel>
                          <FormDescription>
                            When disabled, this mailbox won&apos;t be used for sending
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </TabsContent>
              )}
            </Tabs>

            {/* Default Mailbox Setting */}
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-3 border rounded-lg p-4 bg-muted/40">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isLoading} />
                  </FormControl>
                  <div className="flex-1">
                    <FormLabel className="mt-0! font-semibold">Set as Default</FormLabel>
                    <FormDescription>
                      Use this mailbox for new campaigns by default
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex justify-between gap-3 pt-4 border-t">
              <div>
                {isEditing && mailbox && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isLoading || !mailbox.id}
                    className="gap-2"
                  >
                    {testingConnection && <Loader2 className="h-4 w-4 animate-spin" />}
                    Test Connection
                  </Button>
                )}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Saving..." : isEditing ? "Update Mailbox" : "Create Mailbox"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
