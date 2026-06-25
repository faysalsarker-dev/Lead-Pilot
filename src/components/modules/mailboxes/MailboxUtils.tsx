import { MailboxStatus, MailboxType } from "@/app/generated/prisma/enums";
import { Badge, Input } from "@/components/ui";
import { Mailbox } from "@/redux/features/mailbox/mailbox.api";
import { CheckCircle2, Clock, Eye, EyeOff, Loader2, Mail, Server, XCircle } from "lucide-react";
import { useState } from "react";

export const MAILBOX_TYPES: {
  value: MailboxType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    value: "GMAIL_OAUTH",
    label: "Gmail — Connect with Google",
    description: "Best for personal Gmail. Uses OAuth2 — no password needed.",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    value: "GMAIL_IMAP",
    label: "Gmail — App Password",
    description: "Personal Gmail with a 16-character App Password.",
    icon: <Mail className="w-4 h-4" />,
  },
  {
    value: "CUSTOM_SMTP",
    label: "Custom SMTP",
    description:
      "Works with Resend, Brevo, Mailgun, your own server, or any SMTP provider.",
    icon: <Server className="w-4 h-4" />,
  },
];

const STATUS_CONFIG: Record<
  MailboxStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  UNTESTED: {
    label: "Not tested",
    className: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    icon: <Clock className="w-3 h-3" />,
  },
  TESTING: {
    label: "Testing…",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  CONNECTED: {
    label: "Connected",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    icon: <XCircle className="w-3 h-3" />,
  },
};


export type MailboxFormValues = {
  label: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  type: MailboxType;
  isDefault: boolean;
  isActive: boolean;
  dailySendLimit: number;
  // Gmail
  gmailEmail: string;
  gmailRefreshToken: string;
  // SMTP
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassEnc: string;
  smtpSsl: boolean;
  // IMAP
  imapEnabled: boolean;
  imapHost: string;
  imapPort: number;
  imapUser: string;
  imapPassEnc: string;
  imapSsl: boolean;
};


// ── Default form values ───────────────────────────────────────────────────────

export function buildDefaults(mailbox?: Mailbox | null): MailboxFormValues {
  return {
    label: mailbox?.label ?? "",
    fromName: mailbox?.fromName ?? "",
    fromEmail: mailbox?.fromEmail ?? "",
    replyTo: mailbox?.replyTo ?? "",
    type: (mailbox?.type as MailboxType) ?? "GMAIL_OAUTH",
    isDefault: mailbox?.isDefault ?? false,
    isActive: mailbox?.isActive ?? true,
    dailySendLimit: mailbox?.dailySendLimit ?? 400,
    gmailEmail: mailbox?.gmailEmail ?? "",
    gmailRefreshToken: "", // never pre-fill secrets
    smtpHost: mailbox?.smtpHost ?? "",
    smtpPort: mailbox?.smtpPort ?? 587,
    smtpUser: mailbox?.smtpUser ?? "",
    smtpPassEnc: "", // never pre-fill secrets
    smtpSsl: mailbox?.smtpSsl ?? true,
    imapEnabled: mailbox?.imapEnabled ?? false,
    imapHost: mailbox?.imapHost ?? "",
    imapPort: mailbox?.imapPort ?? 993,
    imapUser: mailbox?.imapUser ?? "",
    imapPassEnc: "", // never pre-fill secrets
    imapSsl: mailbox?.imapSsl ?? true,
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: MailboxStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <Badge
      variant="outline"
      className={`gap-1 text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon}
      {cfg.label}
    </Badge>
  );
}

export function PasswordInput({
  placeholder,
  disabled,
  value,
  onChange,
}: {
  placeholder?: string;
  disabled?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export function SectionCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border bg-muted/30 p-4 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}
