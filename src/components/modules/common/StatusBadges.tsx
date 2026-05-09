"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle, XCircle, Zap } from "lucide-react";
import type { Lead } from "@/redux/features/leads/leads.api";

// Status Badge Components
export function LeadStatusBadge({ status }: { status: Lead["status"] }) {
  const config: Record<
    Lead["status"],
    { color: string; icon: React.ReactNode; label: string }
  > = {
    NEW: {
      color: "bg-slate-100 text-slate-800 border-slate-300",
      icon: <Clock className="h-3 w-3" />,
      label: "New",
    },
    CONTACTED: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <Zap className="h-3 w-3" />,
      label: "Contacted",
    },
    ACTIVE: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Active",
    },
    INTERESTED: {
      color: "bg-purple-100 text-purple-800 border-purple-300",
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Interested",
    },
    CONVERTED: {
      color: "bg-emerald-100 text-emerald-800 border-emerald-300",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Converted",
    },
    REJECTED: {
      color: "bg-red-100 text-red-800 border-red-300",
      icon: <XCircle className="h-3 w-3" />,
      label: "Rejected",
    },
  };

  const cfg = config[status];

  return (
    <Badge variant="outline" className={cfg.color}>
      {cfg.icon}
      <span className="ml-1">{cfg.label}</span>
    </Badge>
  );
}

export function CampaignStatusBadge({
  status,
}: {
  status: "DRAFT" | "RUNNING" | "PAUSED" | "COMPLETED";
}) {
  const config = {
    DRAFT: {
      color: "bg-slate-100 text-slate-800 border-slate-300",
      icon: <Clock className="h-3 w-3" />,
      label: "Draft",
    },
    RUNNING: {
      color: "bg-green-100 text-green-800 border-green-300",
      icon: <Zap className="h-3 w-3" />,
      label: "Running",
    },
    PAUSED: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      icon: <AlertCircle className="h-3 w-3" />,
      label: "Paused",
    },
    COMPLETED: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: "Completed",
    },
  };

  const cfg = config[status];

  return (
    <Badge variant="outline" className={cfg.color}>
      {cfg.icon}
      <span className="ml-1">{cfg.label}</span>
    </Badge>
  );
}

export function MailboxTypeBadge({ type }: { type: "GMAIL_OAUTH" | "CUSTOM_SMTP" }) {
  const config = {
    GMAIL_OAUTH: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      label: "Gmail OAuth",
    },
    CUSTOM_SMTP: {
      color: "bg-purple-100 text-purple-800 border-purple-300",
      label: "Custom SMTP",
    },
  };

  const cfg = config[type];

  return (
    <Badge variant="outline" className={cfg.color}>
      {cfg.label}
    </Badge>
  );
}

export function TemplateTypeBadge({
  type,
}: {
  type: "INITIAL" | "FOLLOWUP_1" | "FOLLOWUP_2" | "FINAL";
}) {
  const config = {
    INITIAL: {
      color: "bg-blue-100 text-blue-800 border-blue-300",
      label: "Initial",
    },
    FOLLOWUP_1: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      label: "Follow-up 1",
    },
    FOLLOWUP_2: {
      color: "bg-orange-100 text-orange-800 border-orange-300",
      label: "Follow-up 2",
    },
    FINAL: {
      color: "bg-red-100 text-red-800 border-red-300",
      label: "Final",
    },
  };

  const cfg = config[type];

  return (
    <Badge variant="outline" className={cfg.color}>
      {cfg.label}
    </Badge>
  );
}

// Inline Status Indicators
export function AIEnrichedIndicator({ enriched, score }: { enriched: boolean; score?: number }) {
  if (!enriched) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        Not enriched
      </Badge>
    );
  }

  return (
    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
      {score ? `AI Score: ${score}/10` : "Enriched"}
    </Badge>
  );
}

export function RepliedIndicator({ hasReplied }: { hasReplied: boolean }) {
  if (!hasReplied) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        No reply
      </Badge>
    );
  }

  return (
    <Badge className="bg-green-100 text-green-800">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Replied
    </Badge>
  );
}

export function InterestedIndicator({ isInterested }: { isInterested: boolean }) {
  if (!isInterested) return null;

  return (
    <Badge className="bg-purple-100 text-purple-800">
      <Zap className="h-3 w-3 mr-1" />
      Interested
    </Badge>
  );
}

export function ActiveIndicator({ isActive }: { isActive: boolean }) {
  if (!isActive) {
    return (
      <Badge variant="outline" className="bg-gray-100 text-gray-700">
        Inactive
      </Badge>
    );
  }

  return (
    <Badge className="bg-green-100 text-green-800">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      Active
    </Badge>
  );
}
