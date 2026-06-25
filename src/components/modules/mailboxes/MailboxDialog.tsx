"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
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
  Input,
  Button,
  Checkbox,
  Alert,
  AlertDescription,
} from "@/components/ui";
import {
  useCreateMailboxMutation,
  useUpdateMailboxMutation,
} from "@/redux/hooks";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  Wifi,
} from "lucide-react";

// ── Prisma-generated types only ───────────────────────────────────────────────
import type {
  MailboxType,
  MailboxStatus,
} from "@/app/generated/prisma/browser";
import type { MailboxModel as Mailbox } from "@/app/generated/prisma/models";
import {
  useTestMailboxMutation,
  type CreateMailboxRequest,
  type UpdateMailboxRequest,
} from "@/redux/features/mailbox/mailbox.api";
import { buildDefaults, MAILBOX_TYPES, MailboxFormValues, PasswordInput, SectionCard, SectionLabel, StatusBadge } from "./MailboxUtils";


interface MailboxDialogProps {
  mailbox?: Mailbox | null;
  children?: React.ReactNode;
}

export function MailboxDialog({ mailbox, children }: MailboxDialogProps) {
  const [open, setOpen] = useState(false);

  const [createMailbox, { isLoading: isCreating }] = useCreateMailboxMutation();
  const [updateMailbox, { isLoading: isUpdating }] = useUpdateMailboxMutation();
  const [testMailbox, { isLoading: testingConnection }] =
    useTestMailboxMutation();

  const isEditing = !!mailbox;
  const isSaving = isCreating || isUpdating;
  const isLoading = isSaving || testingConnection;

  const form = useForm<MailboxFormValues>({
    mode: "onBlur",
    defaultValues: buildDefaults(mailbox),
  });

  const type = useWatch({ control: form.control, name: "type" }) as MailboxType;
  const imapEnabled =
    useWatch({ control: form.control, name: "imapEnabled" }) ?? false;

  // ── Test connection ─────────────────────────────────────────────────────────

  async function handleTestConnection() {
    if (!mailbox?.id) return;

    try {
      await testMailbox(mailbox.id).unwrap();
      toast.success("Mailbox connection tested.");
    } catch (error) {
      toast.error("Failed to test mailbox connection.", {
        description: error instanceof Error ? error.message : undefined,
      });
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  async function onSubmit(values: MailboxFormValues) {
    try {
      if (isEditing && mailbox) {
        const data: UpdateMailboxRequest = {
          label: values.label || undefined,
          fromName: values.fromName || undefined,
          fromEmail: values.fromEmail || undefined,
          replyTo: values.replyTo || undefined,
          isDefault: values.isDefault,
          isActive: values.isActive,
          dailySendLimit: values.dailySendLimit,
          gmailRefreshToken: values.gmailRefreshToken || undefined,
          smtpHost: values.smtpHost || undefined,
          smtpPort: values.smtpPort || undefined,
          smtpUser: values.smtpUser || undefined,
          smtpPassEnc: values.smtpPassEnc || undefined,
          smtpSsl: values.smtpSsl,
          imapEnabled: values.imapEnabled,
          imapHost: values.imapHost || undefined,
          imapPort: values.imapPort || undefined,
          imapUser: values.imapUser || undefined,
          imapPassEnc: values.imapPassEnc || undefined,
          imapSsl: values.imapSsl,
        };
        await updateMailbox({ id: mailbox.id, data }).unwrap();
        toast.success("Mailbox updated.");
      } else {
        // Build typed create payload per type
        const base = {
          label: values.label,
          fromName: values.fromName || undefined,
          replyTo: values.replyTo || undefined,
          isDefault: values.isDefault,
          isActive: values.isActive,
          dailySendLimit: values.dailySendLimit,
        };

        let createData: CreateMailboxRequest;

        if (values.type === "GMAIL_OAUTH") {
          createData = {
            ...base,
            type: "GMAIL_OAUTH",
            gmailEmail: values.gmailEmail,
            gmailRefreshToken: values.gmailRefreshToken,
          };
        } else if (values.type === "GMAIL_IMAP") {
          createData = {
            ...base,
            type: "GMAIL_IMAP",
            gmailEmail: values.gmailEmail,
            smtpPassEnc: values.smtpPassEnc, // App Password goes in smtpPassEnc
            imapEnabled: values.imapEnabled,
            imapHost: values.imapHost || undefined,
            imapPort: values.imapPort || undefined,
            imapUser: values.imapUser || undefined,
            imapPassEnc: values.imapPassEnc || undefined,
            imapSsl: values.imapSsl,
          };
        } else {
          // CUSTOM_SMTP
          createData = {
            ...base,
            type: "CUSTOM_SMTP",
            fromEmail: values.fromEmail || undefined,
            smtpHost: values.smtpHost,
            smtpPort: values.smtpPort,
            smtpUser: values.smtpUser,
            smtpPassEnc: values.smtpPassEnc,
            smtpSsl: values.smtpSsl,
            imapEnabled: values.imapEnabled,
            imapHost: values.imapHost || undefined,
            imapPort: values.imapPort || undefined,
            imapUser: values.imapUser || undefined,
            imapPassEnc: values.imapPassEnc || undefined,
            imapSsl: values.imapSsl,
          };
        }

        await createMailbox(createData).unwrap();
        toast.success("Mailbox added.");
      }

      form.reset();
      setOpen(false);
    } catch (error: unknown) {
      const msg =
        error &&
        typeof error === "object" &&
        "data" in error &&
        error.data &&
        typeof error.data === "object" &&
        "message" in error.data
          ? String((error.data as Record<string, unknown>).message)
          : "Failed to save mailbox.";
      toast.error(msg);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const selectedType = MAILBOX_TYPES.find((t) => t.value === type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button size="sm" variant="default">
            {isEditing ? "Edit mailbox" : "Add mailbox"}
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold">
              {isEditing ? "Edit mailbox" : "Add mailbox"}
            </DialogTitle>
            {isEditing && mailbox?.connectionStatus && (
              <StatusBadge status={mailbox.connectionStatus as MailboxStatus} />
            )}
          </div>
          {isEditing && mailbox?.lastError && (
            <Alert variant="destructive" className="mt-2 py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {mailbox.lastError}
              </AlertDescription>
            </Alert>
          )}
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 pt-1"
          >
            {/* ── Identity ─────────────────────────────────────────────────── */}
            <SectionCard>
              <SectionLabel>Identity</SectionLabel>

              <FormField
                control={form.control}
                name="label"
                rules={{ required: "Label is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Main outreach, Follow-ups"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A name to identify this mailbox in your dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="fromName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sender name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Faysal Sarker"
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
                  name="replyTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reply-to</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="optional@yourdomain.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* fromEmail — only for CUSTOM_SMTP */}
              {type === "CUSTOM_SMTP" && (
                <FormField
                  control={form.control}
                  name="fromEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="hello@yourdomain.com"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The address recipients see. Must match your verified
                        sending domain (e.g. Resend, Brevo).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </SectionCard>

            {/* ── Provider ─────────────────────────────────────────────────── */}
            <SectionCard>
              <SectionLabel>Provider</SectionLabel>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isLoading || isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MAILBOX_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              <div className="flex items-center gap-2">
                                {t.icon}
                                {t.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    {selectedType && (
                      <p className="text-xs text-muted-foreground pt-1">
                        {selectedType.description}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </SectionCard>

            {/* ── Credentials ──────────────────────────────────────────────── */}
            <SectionCard>
              <SectionLabel>
                {type === "GMAIL_OAUTH"
                  ? "OAuth credentials"
                  : type === "GMAIL_IMAP"
                    ? "Gmail App Password"
                    : "SMTP credentials"}
              </SectionLabel>

              {/* GMAIL_OAUTH */}
              {type === "GMAIL_OAUTH" && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="gmailEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gmail address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@gmail.com"
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
                    name="gmailRefreshToken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Refresh token</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={
                              isEditing
                                ? "Leave blank to keep existing token"
                                : "Paste OAuth refresh token"
                            }
                            disabled={isLoading}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          From Google Cloud Console → OAuth 2.0 credentials.
                          Stored encrypted.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* GMAIL_IMAP */}
              {type === "GMAIL_IMAP" && (
                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="gmailEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gmail address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="you@gmail.com"
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
                        <FormLabel>App Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder={
                              isEditing
                                ? "Leave blank to keep existing"
                                : "16-character App Password"
                            }
                            disabled={isLoading}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Generate at myaccount.google.com/apppasswords —
                          requires 2FA enabled. Stored encrypted.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* CUSTOM_SMTP */}
              {type === "CUSTOM_SMTP" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Host</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="smtp.resend.com"
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
                          <FormLabel>Port</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="587"
                              disabled={isLoading}
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            587 or 465
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="smtpUser"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="resend (or your email)"
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
                          <FormLabel>Password / API key</FormLabel>
                          <FormControl>
                            <PasswordInput
                              placeholder={
                                isEditing
                                  ? "Leave blank to keep existing"
                                  : "Your SMTP password or API key"
                              }
                              disabled={isLoading}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Stored encrypted.
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
                      <FormItem className="flex items-center gap-2 pt-1">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormLabel className="mt-0! font-normal">
                          Use SSL (port 465). Uncheck for STARTTLS on 587.
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </SectionCard>

            {/* ── IMAP — reply check ────────────────────────────────────────── */}
            {(type === "CUSTOM_SMTP" || type === "GMAIL_IMAP") && (
              <SectionCard>
                <div className="flex items-start gap-3">
                  <FormField
                    control={form.control}
                    name="imapEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 m-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isLoading}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium leading-none">
                      Enable reply detection
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Checks for replies on demand via IMAP — nothing stored in
                      the database.
                    </p>
                  </div>
                </div>

                {imapEnabled && (
                  <div className="space-y-3 pt-1">
                    {type === "GMAIL_IMAP" && (
                      <Alert className="py-2">
                        <ShieldCheck className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          For Gmail IMAP: host is <code>imap.gmail.com</code>,
                          port <code>993</code>. Use the same App Password as
                          above.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                      <FormField
                        control={form.control}
                        name="imapHost"
                        render={({ field }) => (
                          <FormItem className="col-span-2">
                            <FormLabel>IMAP host</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  type === "GMAIL_IMAP"
                                    ? "imap.gmail.com"
                                    : "imap.example.com"
                                }
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
                            <FormLabel>Port</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="993"
                                disabled={isLoading}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              993 (SSL)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="imapUser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input
                                placeholder={
                                  type === "GMAIL_IMAP"
                                    ? "you@gmail.com"
                                    : "you@example.com"
                                }
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <PasswordInput
                                placeholder={
                                  isEditing
                                    ? "Leave blank to keep existing"
                                    : "IMAP password"
                                }
                                disabled={isLoading}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Stored encrypted.
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
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormLabel className="mt-0! font-normal">
                            Use SSL
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </SectionCard>
            )}

            {/* ── Settings ─────────────────────────────────────────────────── */}
            <SectionCard>
              <SectionLabel>Settings</SectionLabel>

              <FormField
                control={form.control}
                name="dailySendLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily send limit</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        disabled={isLoading}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Cap emails per day. Gmail: 500. Resend free: 100. Brevo
                      free: 300.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-1">
                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="mt-0!">Set as default</FormLabel>
                        <FormDescription className="text-xs">
                          New campaigns will use this mailbox unless you pick
                          another.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div>
                        <FormLabel className="mt-0!">Active</FormLabel>
                        <FormDescription className="text-xs">
                          Inactive mailboxes are skipped during campaign sends.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </SectionCard>

            {/* ── Actions ──────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div>
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {testingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Wifi className="h-4 w-4" />
                    )}
                    {testingConnection ? "Testing…" : "Test connection"}
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading}
                  className="gap-2 min-w-24"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving
                    ? "Saving…"
                    : isEditing
                      ? "Save changes"
                      : "Add mailbox"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
