
import * as React from "react"
import Link from "next/link"
import { 
  NavMain,
    NavSecondary,
 
 NavUser 
} from "@/components/blocks"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui"
import { data } from "@/utils/sidebar-routes"
import { Zap } from "lucide-react"
import getUser from "@/lib/get-user"






// ─── AppSidebar ────────────────────────────────────────────────────────────
export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
const user = await getUser()
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Zap className="size-4" />
                </span>
                <span className="text-base font-bold tracking-tight">PitchPilot</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Content ── */}
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>

    </Sidebar>
  )
}
