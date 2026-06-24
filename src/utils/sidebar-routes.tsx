import {
  LayoutDashboardIcon,
  UsersIcon,
  Globe2Icon,
  MegaphoneIcon,
  FileTextIcon,
  InboxIcon,
  BellIcon,
  Settings2Icon,
  CircleHelpIcon,
  
} from "lucide-react"


export const data = {


  // Primary navigation — core pages
  navMain: [
    {
      title: "Dashboard",
      url: "/main",
      icon: <LayoutDashboardIcon />,
      badge: null,
    },
    {
      title: "Leads",
      url: "/main/leads",
      icon: <UsersIcon />,
      badge: null,
    },
    {
      title: "Generate Leads",
      url: "/main/generate-leads",
      icon: <Globe2Icon />,
      badge: null,
    },
    {
      title: "Campaigns",
      url: "/main/campaigns",
      icon: <MegaphoneIcon />,
      badge: null,
    },
    {
      title: "Templates",
      url: "/main/templates",
      icon: <FileTextIcon />,
      badge: null,
    },
    {
      title: "Inbox",
      url: "/main/inbox",
      icon: <InboxIcon />,
      badge: null,
    },
    {
      title: "Notifications",
      url: "/main/notifications",
      icon: <BellIcon />,
      badge: null,
    },
     {
      title: "Settings",
      url: "/main/settings/mailboxes",
      icon: <Settings2Icon />,
    },
  ],

  // Bottom secondary navigation
  navSecondary: [
    {
      title: "Settings",
      url: "/main/settings/mailboxes",
      icon: <Settings2Icon />,
    },
    {
      title: "Get Help",
      url: "/main/help",
      icon: <CircleHelpIcon />,
    },
  ],
}