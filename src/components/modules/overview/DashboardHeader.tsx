import { dashboardData } from "./data"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getFormattedDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function DashboardHeader() {
  const { alerts } = dashboardData

  return (
    <div className="mb-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {getGreeting()}, Faysal 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s what&apos;s happening with your outreach today.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{getFormattedDate()}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 flex-wrap">
        <span className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
          <strong>{alerts.unreadReplies} unread replies</strong> — including {alerts.highlight}.
        </span>
        <span className="flex items-center gap-2 ml-auto">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          <strong>{alerts.followUpsDue} follow-ups</strong> due today.
        </span>
      </div>
    </div>
  )
}