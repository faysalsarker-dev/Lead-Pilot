"use client"

import * as React from "react"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  LayoutDashboardIcon,
  UsersIcon,
  MegaphoneIcon,
  FileTextIcon,
  InboxIcon,
  BellIcon,
  Settings2Icon,
  CircleHelpIcon,
  Zap,
} from "lucide-react"

// ─── Static badge counts (replace with dynamic data later) ────────────────
const BADGE_COUNTS = {
  inbox: 3,        // unread lead replies
  notifications: 5, // unread notifications
  campaigns: 2,    // actively running campaigns
}

// ─── Badge component ───────────────────────────────────────────────────────
function NavBadge({ count, variant = "default" }: { count: number; variant?: "default" | "danger" | "blue" }) {
  if (count === 0) return null

  const styles = {
    default: "bg-muted text-muted-foreground",
    danger:  "bg-red-500 text-white",
    blue:    "bg-blue-500 text-white",
  }

  return (
    <span
      className={`ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none ${styles[variant]}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}

// ─── Data ──────────────────────────────────────────────────────────────────
const data = {
  user: {
    name: "Faysal Sarker",
    email: "faysal@pitchpilot.dev",
    avatar: "",
  },

  // Primary navigation — core pages
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: <LayoutDashboardIcon />,
      badge: null,
    },
    {
      title: "Leads",
      url: "/leads",
      icon: <UsersIcon />,
      badge: null,
    },
    {
      title: "Campaigns",
      url: "/campaigns",
      icon: <MegaphoneIcon />,
      badge: BADGE_COUNTS.campaigns > 0
        ? <NavBadge count={BADGE_COUNTS.campaigns} variant="blue" />
        : null,
    },
    {
      title: "Templates",
      url: "/templates",
      icon: <FileTextIcon />,
      badge: null,
    },
    {
      title: "Inbox",
      url: "/inbox",
      icon: <InboxIcon />,
      badge: <NavBadge count={BADGE_COUNTS.inbox} variant="danger" />,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: <BellIcon />,
      badge: <NavBadge count={BADGE_COUNTS.notifications} variant="danger" />,
    },
  ],

  // Bottom secondary navigation
  navSecondary: [
    {
      title: "Settings",
      url: "/settings/mailboxes",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: <CircleHelpIcon />,
    },
  ],
}

// ─── AppSidebar ────────────────────────────────────────────────────────────
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>

      {/* ── Header: Logo ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </span>
                <span className="text-base font-bold tracking-tight">PitchPilot</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* ── Footer: User ── */}
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

    </Sidebar>
  )
}