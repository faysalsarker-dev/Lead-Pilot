export type LeadStatus = "New" | "Contacted" | "Active" | "Interested" | "Rejected" | "Converted"
export type WorkType   = "Service" | "Project"
export type LeadSource = "Facebook" | "Google Maps" | "LinkedIn" | "Instagram" | "Referral" | "Manual" | "Twitter"

export interface Lead {
  id: string
  name: string
  business: string
  email: string
  phone: string
  whatsapp: string | null
  businessType: string
  workType: WorkType
  country: string
  status: LeadStatus
  aiScore: number
  isActive: boolean
  isInterested: boolean
  hasReplied: boolean
  source: LeadSource
  campaignRunning: boolean
  addedAt: string
  lastContacted: string | null
  notes: string
}

export const LEADS: Lead[] = [
  { id: "1",  name: "Karim Ahmed",      business: "Karim Salon BD",         email: "karim@salon.bd",       phone: "+880171100001", whatsapp: "+880171100001", businessType: "Salon",       workType: "Service", country: "Bangladesh", status: "Active",     aiScore: 8,  isActive: true,  isInterested: false, hasReplied: true,  source: "Facebook",    campaignRunning: true,  addedAt: "2026-04-01", lastContacted: "2026-04-20", notes: "Interested in a basic branding site." },
  { id: "2",  name: "Sarah Lee",        business: "Sarah Coaches",           email: "sarah@coach.us",       phone: "+12025550001",  whatsapp: null,             businessType: "Coaching",    workType: "Service", country: "USA",        status: "New",        aiScore: 9,  isActive: false, isInterested: false, hasReplied: false, source: "Google Maps", campaignRunning: false, addedAt: "2026-04-03", lastContacted: null,         notes: "" },
  { id: "3",  name: "Rahim Store",      business: "Rahim Electronics",       email: "rahim@store.bd",       phone: "+880181100003", whatsapp: "+880181100003", businessType: "Retail",      workType: "Project", country: "Bangladesh", status: "Contacted",  aiScore: 6,  isActive: false, isInterested: false, hasReplied: false, source: "Manual",      campaignRunning: true,  addedAt: "2026-04-05", lastContacted: "2026-04-18", notes: "Follow-up due." },
  { id: "4",  name: "TechCorp NY",      business: "TechCorp Inc",            email: "hello@techcorp.com",   phone: "+12025550004",  whatsapp: null,             businessType: "Agency",      workType: "Project", country: "USA",        status: "Interested", aiScore: 9,  isActive: true,  isInterested: true,  hasReplied: true,  source: "LinkedIn",    campaignRunning: false, addedAt: "2026-04-06", lastContacted: "2026-04-19", notes: "Dashboard rebuild project." },
  { id: "5",  name: "Nadia Beauty",     business: "Nadia Beauty Parlor",     email: "nadia@beauty.bd",      phone: "+880191100005", whatsapp: "+880191100005", businessType: "Salon",       workType: "Service", country: "Bangladesh", status: "Rejected",   aiScore: 4,  isActive: false, isInterested: false, hasReplied: false, source: "Facebook",    campaignRunning: false, addedAt: "2026-04-07", lastContacted: "2026-04-15", notes: "Not interested at this time." },
  { id: "6",  name: "Mark Johnson",     business: "Mark Fitness",            email: "mark@fitness.us",      phone: "+12025550006",  whatsapp: null,             businessType: "Fitness",     workType: "Service", country: "USA",        status: "Converted",  aiScore: 10, isActive: true,  isInterested: true,  hasReplied: true,  source: "Referral",    campaignRunning: false, addedAt: "2026-04-08", lastContacted: "2026-04-22", notes: "Signed contract. Onboarding next week." },
  { id: "7",  name: "Riya Designs",     business: "Riya Creative Studio",    email: "riya@designs.in",      phone: "+91900000007",  whatsapp: "+91900000007",  businessType: "Agency",      workType: "Project", country: "India",      status: "New",        aiScore: 7,  isActive: false, isInterested: false, hasReplied: false, source: "Google Maps", campaignRunning: false, addedAt: "2026-04-09", lastContacted: null,         notes: "" },
  { id: "8",  name: "Ahmed Sweets",     business: "Ahmed Sweets & Bakery",   email: "ahmed@sweets.bd",      phone: "+880161100008", whatsapp: "+880161100008", businessType: "Food",        workType: "Service", country: "Bangladesh", status: "Contacted",  aiScore: 5,  isActive: false, isInterested: false, hasReplied: false, source: "Facebook",    campaignRunning: true,  addedAt: "2026-04-10", lastContacted: "2026-04-17", notes: "Follow-up scheduled." },
  { id: "9",  name: "Laura Consult",    business: "Laura Consulting LLC",    email: "laura@consult.us",     phone: "+12025550009",  whatsapp: null,             businessType: "Consulting",  workType: "Service", country: "USA",        status: "Active",     aiScore: 8,  isActive: true,  isInterested: false, hasReplied: true,  source: "LinkedIn",    campaignRunning: false, addedAt: "2026-04-11", lastContacted: "2026-04-21", notes: "Outdated site. Good potential." },
  { id: "10", name: "Sumon Tech",       business: "Sumon IT Solutions",      email: "sumon@tech.bd",        phone: "+880151100010", whatsapp: "+880151100010", businessType: "IT",          workType: "Project", country: "Bangladesh", status: "Interested", aiScore: 9,  isActive: true,  isInterested: true,  hasReplied: true,  source: "Referral",    campaignRunning: false, addedAt: "2026-04-12", lastContacted: "2026-04-23", notes: "SaaS frontend project. Budget confirmed." },
  { id: "11", name: "Emily Rose",       business: "Emily Rose Photography",  email: "emily@photo.us",       phone: "+12025550011",  whatsapp: null,             businessType: "Photography", workType: "Project", country: "USA",        status: "New",        aiScore: 6,  isActive: false, isInterested: false, hasReplied: false, source: "Instagram",   campaignRunning: false, addedAt: "2026-04-13", lastContacted: null,         notes: "" },
  { id: "12", name: "Farhan Cafe",      business: "Farhan Coffee House",     email: "farhan@cafe.bd",       phone: "+880171100012", whatsapp: "+880171100012", businessType: "Food",        workType: "Service", country: "Bangladesh", status: "Contacted",  aiScore: 5,  isActive: false, isInterested: false, hasReplied: false, source: "Facebook",    campaignRunning: true,  addedAt: "2026-04-14", lastContacted: "2026-04-16", notes: "No reply yet." },
  { id: "13", name: "James Wilkins",    business: "Wilkins Real Estate",     email: "james@wilkins.us",     phone: "+12025550013",  whatsapp: null,             businessType: "Real Estate", workType: "Service", country: "USA",        status: "New",        aiScore: 8,  isActive: false, isInterested: false, hasReplied: false, source: "Google Maps", campaignRunning: false, addedAt: "2026-04-15", lastContacted: null,         notes: "" },
  { id: "14", name: "Priya Mehta",      business: "Priya Wellness Clinic",   email: "priya@wellness.in",    phone: "+91811000014",  whatsapp: "+91811000014",  businessType: "Healthcare",  workType: "Service", country: "India",      status: "Contacted",  aiScore: 7,  isActive: false, isInterested: false, hasReplied: false, source: "Instagram",   campaignRunning: true,  addedAt: "2026-04-16", lastContacted: "2026-04-20", notes: "" },
  { id: "15", name: "Tanvir Clothing",  business: "Tanvir Fashion House",    email: "tanvir@fashion.bd",    phone: "+880191100015", whatsapp: "+880191100015", businessType: "Retail",      workType: "Project", country: "Bangladesh", status: "Active",     aiScore: 7,  isActive: true,  isInterested: false, hasReplied: true,  source: "Facebook",    campaignRunning: false, addedAt: "2026-04-17", lastContacted: "2026-04-24", notes: "Wants e-commerce." },
  { id: "16", name: "Chris Morgan",     business: "Morgan Digital Agency",   email: "chris@morgan.us",      phone: "+12025550016",  whatsapp: null,             businessType: "Agency",      workType: "Project", country: "USA",        status: "Interested", aiScore: 9,  isActive: true,  isInterested: true,  hasReplied: true,  source: "Twitter",     campaignRunning: false, addedAt: "2026-04-18", lastContacted: "2026-04-25", notes: "White-label partnership potential." },
  { id: "17", name: "Laila Hossain",    business: "Laila Boutique",          email: "laila@boutique.bd",    phone: "+880151100017", whatsapp: "+880151100017", businessType: "Retail",      workType: "Service", country: "Bangladesh", status: "New",        aiScore: 6,  isActive: false, isInterested: false, hasReplied: false, source: "Facebook",    campaignRunning: false, addedAt: "2026-04-19", lastContacted: null,         notes: "" },
  { id: "18", name: "Anil Kumar",       business: "Anil Tech Startup",       email: "anil@startup.in",      phone: "+91722000018",  whatsapp: "+91722000018",  businessType: "IT",          workType: "Project", country: "India",      status: "Converted",  aiScore: 10, isActive: true,  isInterested: true,  hasReplied: true,  source: "LinkedIn",    campaignRunning: false, addedAt: "2026-04-20", lastContacted: "2026-04-26", notes: "MVP build in progress." },
  { id: "19", name: "Diana Fox",        business: "Fox Law Office",          email: "diana@foxlaw.us",      phone: "+12025550019",  whatsapp: null,             businessType: "Legal",       workType: "Service", country: "USA",        status: "Rejected",   aiScore: 3,  isActive: false, isInterested: false, hasReplied: false, source: "Google Maps", campaignRunning: false, addedAt: "2026-04-21", lastContacted: "2026-04-22", notes: "Budget too low." },
  { id: "20", name: "Sabbir Ahmed",     business: "Sabbir Auto Parts",       email: "sabbir@auto.bd",       phone: "+880171100020", whatsapp: "+880171100020", businessType: "Retail",      workType: "Service", country: "Bangladesh", status: "New",        aiScore: 5,  isActive: false, isInterested: false, hasReplied: false, source: "Manual",      campaignRunning: false, addedAt: "2026-04-22", lastContacted: null,         notes: "" },
]

export const BUSINESS_TYPES = [...new Set(LEADS.map(l => l.businessType))].sort()
export const COUNTRIES       = [...new Set(LEADS.map(l => l.country))].sort()
export const SOURCES: LeadSource[] = ["Facebook","Google Maps","LinkedIn","Instagram","Referral","Manual","Twitter"]
export const STATUSES: LeadStatus[] = ["New","Contacted","Active","Interested","Rejected","Converted"]