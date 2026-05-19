import Link from "next/link";
import { Bell, CalendarClock, Plus, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { dashboardData } from "./data";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function DashboardHeader() {
  const { alerts } = dashboardData;

  return (
    <div className="mb-6 space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Outreach workspace
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              {getGreeting()}, Faysal
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Monitor campaigns, generated leads, and replies from one focused command center.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:items-center">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <CalendarClock className="h-4 w-4" />
              {getFormattedDate()}
            </div>
            <Button asChild variant="outline" className="gap-2">
              <Link href="/generate-leads">
                <Search className="h-4 w-4" />
                Find Leads
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-slate-950 hover:bg-slate-800">
              <Link href="/campaigns/new">
                <Plus className="h-4 w-4" />
                New Campaign
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
        <span className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-blue-600" />
          <strong>{alerts.unreadReplies} unread replies</strong>
          <span className="text-muted-foreground">including {alerts.highlight}</span>
        </span>
        <span className="ml-auto flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <strong>{alerts.followUpsDue} follow-ups</strong> due today.
        </span>
      </div>
    </div>
  );
}
