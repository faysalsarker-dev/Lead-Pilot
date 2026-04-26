export const dashboardData = {
  kpis: {
    totalLeads: 142,
    totalLeadsDelta: 12,
    activeLeads: 38,
    activeLeadsPct: 27,
    interested: 12,
    interestedDelta: 3,
    converted: 6,
    convertedDelta: 1,
    runningCampaigns: 2,
    avgReplyRate: 14,
    avgReplyRateDelta: 3,
  },

  pipeline: [
    { status: "New",        count: 60, color: "#378ADD" },
    { status: "Contacted",  count: 40, color: "#7F77DD" },
    { status: "Active",     count: 28, color: "#1D9E75" },
    { status: "Interested", count: 12, color: "#BA7517" },
    { status: "Converted",  count: 6,  color: "#639922" },
    { status: "Rejected",   count: 9,  color: "#B4B2A9" },
  ],

  activityChart: {
    labels: ["Apr 13","Apr 14","Apr 15","Apr 16","Apr 17","Apr 18","Apr 19","Apr 20","Apr 21","Apr 22","Apr 23","Apr 24","Apr 25","Apr 26"],
    sent:    [14, 22, 18, 20, 16, 10, 0, 19, 21, 17, 13, 15, 11, 8],
    replies: [1,  2,  3,  2,  4,  5,  0,  3,  5,  4,  6,  8,  5, 3],
  },

  campaigns: [
    { name: "BD Salons — Apr 2026",      sent: 142, replyRate: 18, status: "Running" },
    { name: "US Coaches — Mar 2026",     sent: 80,  replyRate: 8,  status: "Done"    },
    { name: "NY Agencies — Mar 2026",    sent: 55,  replyRate: 11, status: "Done"    },
    { name: "India IT Firms — Feb 2026", sent: 48,  replyRate: 4,  status: "Done"    },
    { name: "BD Restaurants — Feb 2026", sent: 38,  replyRate: 13, status: "Paused"  },
  ],

  recentReplies: [
    { initials: "KA", name: "Karim Ahmed",  business: "Karim Salon BD",     snippet: "Thanks for reaching out! Interested in knowing more...", time: "2h ago",  unread: true,  status: "Active",     avatarBg: "#E6F1FB", avatarColor: "#185FA5" },
    { initials: "TC", name: "TechCorp NY",  business: "TechCorp Inc",       snippet: "We have a dashboard project coming up next month...",   time: "1d ago",  unread: true,  status: "Interested", avatarBg: "#EEEDFE", avatarColor: "#534AB7" },
    { initials: "LC", name: "Laura Consult",business: "Laura Consulting LLC",snippet: "Yes we need help, our site looks very outdated...",      time: "2d ago",  unread: false, status: "Active",     avatarBg: "#EAF3DE", avatarColor: "#3B6D11" },
    { initials: "ST", name: "Sumon Tech",   business: "Sumon IT Solutions",  snippet: "Bhai dekhlam apnar portfolio. Onek sundor...",           time: "3d ago",  unread: false, status: "Interested", avatarBg: "#FAEEDA", avatarColor: "#854F0B" },
  ],

  workTypeSplit: { service: 62, project: 38 },

  leadSources: [
    { source: "Facebook",    count: 48, color: "#378ADD" },
    { source: "Google Maps", count: 30, color: "#1D9E75" },
    { source: "LinkedIn",    count: 18, color: "#7F77DD" },
    { source: "Instagram",   count: 10, color: "#D85A30" },
    { source: "Referral",    count: 8,  color: "#BA7517" },
    { source: "Manual",      count: 8,  color: "#B4B2A9" },
  ],

  followUps: [
    { name: "Rahim Electronics",   daysSince: 5 },
    { name: "Farhan Coffee House", daysSince: 4 },
    { name: "Ahmed Sweets & Bakery", daysSince: 3 },
  ],

  alerts: {
    unreadReplies: 3,
    followUpsDue: 2,
    highlight: "TechCorp NY and Karim Salon",
  },
}

export type DashboardData = typeof dashboardData