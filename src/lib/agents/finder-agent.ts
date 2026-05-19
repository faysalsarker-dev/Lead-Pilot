import { z } from "zod";

export const findLeadsRequestSchema = z.object({
  country: z.string().trim().min(2).max(80),
  location: z.string().trim().max(120).optional().default(""),
  category: z.string().trim().min(2).max(120),
  keywords: z.string().trim().max(240).optional().default(""),
  leadCount: z.coerce.number().int().min(1).max(50).default(10),
  save: z.boolean().optional().default(false),
});

export type FindLeadsRequest = z.infer<typeof findLeadsRequestSchema>;

export const generatedLeadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  businessName: z.string().trim().min(2).max(160),
  businessType: z.string().trim().max(120).optional().default(""),
  website: z.string().trim().url().optional().or(z.literal("")).default(""),
  country: z.string().trim().max(80).optional().default(""),
  timezone: z.string().trim().max(80).optional().default(""),
  notes: z.string().trim().max(1000).optional().default(""),
  aiScore: z.coerce.number().int().min(1).max(10).optional().default(6),
  aiSummary: z.string().trim().max(1000).optional().default(""),
  aiPainPoints: z.string().trim().max(1000).optional().default(""),
  aiEmailOpener: z.string().trim().max(500).optional().default(""),
});

export type GeneratedLead = z.infer<typeof generatedLeadSchema>;

const categoryLabels: Record<string, string> = {
  saas: "SaaS company",
  "real-estate": "real estate agency",
  ecommerce: "ecommerce brand",
  clinics: "healthcare clinic",
  restaurants: "restaurant",
  agencies: "marketing agency",
};

const firstNames = [
  "Alex",
  "Jordan",
  "Taylor",
  "Morgan",
  "Casey",
  "Riley",
  "Sam",
  "Jamie",
  "Avery",
  "Cameron",
];

const companyWords = [
  "Northstar",
  "Brightline",
  "Summit",
  "Launchpad",
  "Evergreen",
  "Bluebird",
  "Foundry",
  "Signal",
  "Pioneer",
  "Atlas",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

function normalizeCategory(category: string) {
  return categoryLabels[category] || category.replace(/-/g, " ");
}

function normalizeCountry(country: string) {
  return country.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function buildFinderPrompt(input: FindLeadsRequest) {
  const country = normalizeCountry(input.country);
  const category = normalizeCategory(input.category);
  const location = input.location || country;
  const keywords = input.keywords || "owner, founder, decision maker";

  return [
    "You are a B2B lead research assistant for an outreach CRM.",
    "Return only JSON. No markdown, no prose.",
    "Create plausible lead candidates for prospecting research, but do not claim they are verified.",
    "Prefer business or role-based emails such as hello@, info@, contact@, sales@, partnerships@.",
    "Do not include private personal data, phone numbers, or sensitive personal attributes.",
    `Generate ${input.leadCount} leads.`,
    `Country: ${country}`,
    `Location: ${location}`,
    `Business category: ${category}`,
    `Keywords: ${keywords}`,
    "JSON shape:",
    JSON.stringify({
      leads: [
        {
          name: "Decision maker name or role",
          email: "public-business-email@example.com",
          businessName: "Business name",
          businessType: category,
          website: "https://example.com",
          country,
          timezone: "IANA timezone if obvious",
          notes: "Why this account fits the search",
          aiScore: 7,
          aiSummary: "Short account summary",
          aiPainPoints: "Likely business pain points",
          aiEmailOpener: "Personalized first sentence",
        },
      ],
    }),
  ].join("\n");
}

export function parseGeneratedLeads(value: unknown) {
  const rawLeads = Array.isArray(value)
    ? value
    : typeof value === "object" && value !== null && "leads" in value
      ? (value as { leads: unknown }).leads
      : [];

  const parsed = z.array(generatedLeadSchema).safeParse(rawLeads);
  return parsed.success ? parsed.data : [];
}

export function buildFallbackLeads(input: FindLeadsRequest): GeneratedLead[] {
  const country = normalizeCountry(input.country);
  const category = normalizeCategory(input.category);
  const locationSlug = slugify(input.location || country) || "market";
  const categorySlug = slugify(category) || "business";

  return Array.from({ length: input.leadCount }, (_, index) => {
    const firstName = firstNames[index % firstNames.length];
    const company = `${companyWords[index % companyWords.length]} ${category.split(" ")[0]} ${index + 1}`;
    const domain = `${slugify(company)}-${locationSlug}.example.com`;

    return {
      name: `${firstName} ${category.includes("restaurant") ? "Owner" : "Director"}`,
      email: `hello@${domain}`,
      businessName: company,
      businessType: category,
      website: `https://${domain}`,
      country,
      timezone: "",
      notes: `Fallback prospect seed for ${category} in ${input.location || country}. Use enrichment before outreach.`,
      aiScore: Math.min(10, 6 + (index % 4)),
      aiSummary: `${company} is a generated prospect seed for ${category} outreach.`,
      aiPainPoints: `Likely needs more qualified leads, better conversion tracking, and consistent follow-up.`,
      aiEmailOpener: `I noticed ${company} is active in the ${categorySlug} space and may be scaling outreach.`,
    };
  });
}
