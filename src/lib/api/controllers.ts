import type { NextRequest } from "next/server";
import {
  BudgetRange,
  CampaignStatus,
  EnrichmentStatus,
  LeadSource,
  LeadStatus,
  Prisma,
  Priority,
  TemplateType,
  Urgency,
  WorkType,
} from "@/app/generated/prisma/client";
import prisma from "@/lib/prisma";
import { requireAuth } from "./middleware/auth";
import { handleError, NotFoundError, UnauthorizedError } from "./middleware/errors";
import {
  createErrorResponse,
  createSuccessResponse,
  sendJsonResponse,
  sendPaginatedResponse,
} from "./middleware/response-handler";

type Params = { id: string };
type LeadBody = {
  name: string;
  businessName: string;
  email?: string | null;
  businessType?: string;
  jobTitle?: string;
  avatarUrl?: string;
  phone?: string;
  whatsapp?: string;
  whatsappOptedIn?: boolean;
  facebookUrl?: string;
  instagramHandle?: string;
  linkedinUrl?: string;
  twitterHandle?: string;
  youtubeUrl?: string;
  tiktokHandle?: string;
  website?: string;
  googleMapsUrl?: string;
  googleMapsPlaceId?: string;
  country?: string;
  city?: string;
  area?: string;
  timezone?: string;
  quickNote?: string;
  capturedFrom?: string;
  capturedAt?: string;
  observedProblems?: string[];
  workType?: WorkType;
  budgetRange?: BudgetRange;
  urgency?: Urgency;
  source?: LeadSource;
  notes?: string;
  internalLabel?: string;
  status?: LeadStatus;
  isActive?: boolean;
  hasReplied?: boolean;
  isInterested?: boolean;
  unsubscribed?: boolean;
  campaignRunning?: boolean;
  priority?: Priority;
  isPinned?: boolean;
  isFavorite?: boolean;
  enrichmentStatus?: EnrichmentStatus;
};

async function getUserId(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    throw new UnauthorizedError(auth.error);
  }
  return auth.userId;
}

function toInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function errorResponse(error: unknown) {
  const response = handleError(error);
  return sendJsonResponse(
    createErrorResponse(response.message, response.statusCode, response.errors),
    response.statusCode
  );
}

export const leadController = {
  async getLeads(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const { searchParams } = new URL(request.url);
      const page = toInt(searchParams.get("page"), 1);
      const limit = toInt(searchParams.get("limit"), 10);
      const search = searchParams.get("search");
      const status = searchParams.get("status");
      const enrichmentStatus = searchParams.get("enrichmentStatus");
      const skip = (page - 1) * limit;

      const where: Prisma.LeadWhereInput = {
        userId,
        softDeleted: false,
        ...(status && status in LeadStatus ? { status: status as LeadStatus } : {}),
        ...(enrichmentStatus && enrichmentStatus in EnrichmentStatus
          ? { enrichmentStatus: enrichmentStatus as EnrichmentStatus }
          : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { businessName: { contains: search, mode: Prisma.QueryMode.insensitive } },
              ],
            }
          : {}),
      };

      const [data, total] = await Promise.all([
        prisma.lead.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.lead.count({ where }),
      ]);

      return sendJsonResponse(sendPaginatedResponse(data, total, page, limit, "Leads retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getLeadById(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      const lead = await prisma.lead.findFirst({ where: { id: params.id, userId, softDeleted: false } });
      if (!lead) throw new NotFoundError("Lead not found");
      return sendJsonResponse(createSuccessResponse(lead, "Lead retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async createLead(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const body = (await request.json()) as LeadBody;
      const lead = await prisma.lead.create({
        data: {
          userId,
          name: body.name,
          email: body.email || null,
          businessName: body.businessName ?? body.name,
          businessType: body.businessType,
          jobTitle: body.jobTitle,
          avatarUrl: body.avatarUrl,
          phone: body.phone,
          whatsapp: body.whatsapp,
          whatsappOptedIn: body.whatsappOptedIn,
          facebookUrl: body.facebookUrl,
          instagramHandle: body.instagramHandle,
          linkedinUrl: body.linkedinUrl,
          twitterHandle: body.twitterHandle,
          youtubeUrl: body.youtubeUrl,
          tiktokHandle: body.tiktokHandle,
          website: body.website,
          googleMapsUrl: body.googleMapsUrl,
          googleMapsPlaceId: body.googleMapsPlaceId,
          country: body.country,
          city: body.city,
          area: body.area,
          timezone: body.timezone,
          quickNote: body.quickNote,
          capturedFrom: body.capturedFrom,
          capturedAt: body.capturedAt ? new Date(body.capturedAt) : undefined,
          observedProblems: body.observedProblems,
          workType: body.workType,
          budgetRange: body.budgetRange,
          urgency: body.urgency,
          source: body.source,
          priority: body.priority,
          internalLabel: body.internalLabel,
          notes: body.notes,
        },
      });
      return sendJsonResponse(createSuccessResponse(lead, "Lead created successfully"), 201);
    } catch (error) {
      return errorResponse(error);
    }
  },

  async updateLead(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.getExistingLead(params.id, userId);
      const body = (await request.json()) as Partial<LeadBody>;
      const lead = await prisma.lead.update({
        where: { id: params.id },
        data: {
          name: body.name,
          email: body.email === undefined ? undefined : body.email || null,
          businessName: body.businessName,
          businessType: body.businessType,
          jobTitle: body.jobTitle,
          avatarUrl: body.avatarUrl,
          phone: body.phone,
          whatsapp: body.whatsapp,
          whatsappOptedIn: body.whatsappOptedIn,
          facebookUrl: body.facebookUrl,
          instagramHandle: body.instagramHandle,
          linkedinUrl: body.linkedinUrl,
          twitterHandle: body.twitterHandle,
          youtubeUrl: body.youtubeUrl,
          tiktokHandle: body.tiktokHandle,
          website: body.website,
          googleMapsUrl: body.googleMapsUrl,
          googleMapsPlaceId: body.googleMapsPlaceId,
          country: body.country,
          city: body.city,
          area: body.area,
          timezone: body.timezone,
          quickNote: body.quickNote,
          capturedFrom: body.capturedFrom,
          capturedAt: body.capturedAt ? new Date(body.capturedAt) : undefined,
          observedProblems: body.observedProblems,
          workType: body.workType,
          budgetRange: body.budgetRange,
          urgency: body.urgency,
          source: body.source,
          priority: body.priority,
          internalLabel: body.internalLabel,
          notes: body.notes,
          status: body.status,
          statusUpdatedAt: body.status ? new Date() : undefined,
          isActive: body.isActive,
          hasReplied: body.hasReplied,
          isInterested: body.isInterested,
          unsubscribed: body.unsubscribed,
          campaignRunning: body.campaignRunning,
          isPinned: body.isPinned,
          isFavorite: body.isFavorite,
          enrichmentStatus: body.enrichmentStatus,
        },
      });
      return sendJsonResponse(createSuccessResponse(lead, "Lead updated successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async deleteLead(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.getExistingLead(params.id, userId);
      await prisma.lead.update({
        where: { id: params.id },
        data: { softDeleted: true, deletedAt: new Date() },
      });
      return sendJsonResponse(createSuccessResponse(null, "Lead deleted successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async bulkCreateLeads(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const body = (await request.json()) as { leads?: LeadBody[] };
      const leads = Array.isArray(body.leads) ? body.leads : [];
      const created = await Promise.all(
        leads.map((lead) =>
          prisma.lead.create({
            data: {
              userId,
              name: lead.name,
              email: lead.email || null,
              businessName: lead.businessName ?? lead.name,
              businessType: lead.businessType,
              website: lead.website,
              country: lead.country,
              timezone: lead.timezone,
              notes: lead.notes,
            },
          })
        )
      );

      return sendJsonResponse(
        createSuccessResponse(
          { created: created.length, failed: 0, leads: created },
          "Leads created successfully"
        ),
        201
      );
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getExistingLead(id: string, userId: string) {
    const lead = await prisma.lead.findFirst({ where: { id, userId, softDeleted: false } });
    if (!lead) throw new NotFoundError("Lead not found");
    return lead;
  },
};

export const campaignController = {
  async getCampaigns(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const { searchParams } = new URL(request.url);
      const page = toInt(searchParams.get("page"), 1);
      const limit = toInt(searchParams.get("limit"), 10);
      const status = searchParams.get("status");
      const mailboxId = searchParams.get("mailboxId");
      const skip = (page - 1) * limit;
      const where: Prisma.CampaignWhereInput = {
        userId,
        ...(status && status in CampaignStatus ? { status: status as CampaignStatus } : {}),
        ...(mailboxId ? { mailboxId } : {}),
      };

      const [data, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { campaignLeads: true, mailbox: true },
        }),
        prisma.campaign.count({ where }),
      ]);

      return sendJsonResponse(sendPaginatedResponse(data, total, page, limit, "Campaigns retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getCampaignById(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      const campaign = await prisma.campaign.findFirst({
        where: { id: params.id, userId },
        include: { campaignLeads: true, mailbox: true },
      });
      if (!campaign) throw new NotFoundError("Campaign not found");
      return sendJsonResponse(createSuccessResponse(campaign, "Campaign retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async createCampaign(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const body = await request.json();
      const campaign = await prisma.campaign.create({
        data: {
          userId,
          name: body.name,
          mailboxId: body.mailboxId,
          initialTemplateId: body.initialTemplateId,
          followup1TemplateId: body.followup1TemplateId,
          followup2TemplateId: body.followup2TemplateId,
          finalTemplateId: body.finalTemplateId,
          sendWindow: body.sendWindow,
          followup1Days: body.followup1Days,
          followup2Days: body.followup2Days,
          finalDays: body.finalDays,
          campaignLeads: Array.isArray(body.leadIds)
            ? { create: body.leadIds.map((leadId: string) => ({ leadId })) }
            : undefined,
        },
        include: { campaignLeads: true },
      });
      return sendJsonResponse(createSuccessResponse(campaign, "Campaign created successfully"), 201);
    } catch (error) {
      return errorResponse(error);
    }
  },

  async updateCampaign(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureCampaign(params.id, userId);
      const body = await request.json();
      const campaign = await prisma.campaign.update({
        where: { id: params.id },
        data: {
          name: body.name,
          mailboxId: body.mailboxId,
          initialTemplateId: body.initialTemplateId,
          followup1TemplateId: body.followup1TemplateId,
          followup2TemplateId: body.followup2TemplateId,
          finalTemplateId: body.finalTemplateId,
          sendWindow: body.sendWindow,
          followup1Days: body.followup1Days,
          followup2Days: body.followup2Days,
          finalDays: body.finalDays,
        },
      });
      return sendJsonResponse(createSuccessResponse(campaign, "Campaign updated successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async deleteCampaign(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureCampaign(params.id, userId);
      await prisma.campaign.delete({ where: { id: params.id } });
      return sendJsonResponse(createSuccessResponse(null, "Campaign deleted successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async launchCampaign(request: NextRequest, params: Params) {
    return this.setStatus(request, params, "RUNNING", { launchedAt: new Date() });
  },

  async pauseCampaign(request: NextRequest, params: Params) {
    return this.setStatus(request, params, "PAUSED");
  },

  async resumeCampaign(request: NextRequest, params: Params) {
    return this.setStatus(request, params, "RUNNING");
  },

  async setStatus(
    request: NextRequest,
    params: Params,
    status: "RUNNING" | "PAUSED",
    extra: { launchedAt?: Date } = {}
  ) {
    try {
      const userId = await getUserId(request);
      await this.ensureCampaign(params.id, userId);
      const campaign = await prisma.campaign.update({
        where: { id: params.id },
        data: { status, ...extra },
      });
      return sendJsonResponse(createSuccessResponse(campaign, "Campaign updated successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async ensureCampaign(id: string, userId: string) {
    const campaign = await prisma.campaign.findFirst({ where: { id, userId } });
    if (!campaign) throw new NotFoundError("Campaign not found");
    return campaign;
  },
};

export const templateController = {
  async getTemplates(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const { searchParams } = new URL(request.url);
      const page = toInt(searchParams.get("page"), 1);
      const limit = toInt(searchParams.get("limit"), 10);
      const type = searchParams.get("type");
      const skip = (page - 1) * limit;
      const where: Prisma.TemplateWhereInput = {
        userId,
        ...(type && type in TemplateType ? { type: type as TemplateType } : {}),
      };
      const [data, total] = await Promise.all([
        prisma.template.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.template.count({ where }),
      ]);
      return sendJsonResponse(sendPaginatedResponse(data, total, page, limit, "Templates retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getTemplateById(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      const template = await prisma.template.findFirst({ where: { id: params.id, userId } });
      if (!template) throw new NotFoundError("Template not found");
      return sendJsonResponse(createSuccessResponse(template, "Template retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async createTemplate(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const body = await request.json();
      const template = await prisma.template.create({
        data: {
          userId,
          name: body.name,
          type: body.type,
          subjectA: body.subjectA,
          subjectB: body.subjectB,
          body: body.body,
        },
      });
      return sendJsonResponse(createSuccessResponse(template, "Template created successfully"), 201);
    } catch (error) {
      return errorResponse(error);
    }
  },

  async updateTemplate(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureTemplate(params.id, userId);
      const body = await request.json();
      const template = await prisma.template.update({
        where: { id: params.id },
        data: {
          name: body.name,
          type: body.type,
          subjectA: body.subjectA,
          subjectB: body.subjectB,
          body: body.body,
        },
      });
      return sendJsonResponse(createSuccessResponse(template, "Template updated successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async deleteTemplate(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureTemplate(params.id, userId);
      await prisma.template.delete({ where: { id: params.id } });
      return sendJsonResponse(createSuccessResponse(null, "Template deleted successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async duplicateTemplate(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      const template = await this.ensureTemplate(params.id, userId);
      const body = await request.json();
      const duplicate = await prisma.template.create({
        data: {
          userId,
          name: body.name ?? `${template.name} Copy`,
          type: template.type,
          subjectA: template.subjectA,
          subjectB: template.subjectB,
          body: template.body,
        },
      });
      return sendJsonResponse(createSuccessResponse(duplicate, "Template duplicated successfully"), 201);
    } catch (error) {
      return errorResponse(error);
    }
  },

  async ensureTemplate(id: string, userId: string) {
    const template = await prisma.template.findFirst({ where: { id, userId } });
    if (!template) throw new NotFoundError("Template not found");
    return template;
  },
};

export const mailboxController = {
  async getMailboxes(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const { searchParams } = new URL(request.url);
      const page = toInt(searchParams.get("page"), 1);
      const limit = toInt(searchParams.get("limit"), 10);
      const skip = (page - 1) * limit;
      const where = { userId };
      const [data, total] = await Promise.all([
        prisma.mailbox.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" } }),
        prisma.mailbox.count({ where }),
      ]);
      return sendJsonResponse(sendPaginatedResponse(data, total, page, limit, "Mailboxes retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getMailboxById(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      const mailbox = await prisma.mailbox.findFirst({ where: { id: params.id, userId } });
      if (!mailbox) throw new NotFoundError("Mailbox not found");
      return sendJsonResponse(createSuccessResponse(mailbox, "Mailbox retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async getDefaultMailbox(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const mailbox = await prisma.mailbox.findFirst({ where: { userId, isDefault: true } });
      if (!mailbox) throw new NotFoundError("Default mailbox not found");
      return sendJsonResponse(createSuccessResponse(mailbox, "Default mailbox retrieved successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async createMailbox(request: NextRequest) {
    try {
      const userId = await getUserId(request);
      const body = await request.json();
      if (body.isDefault) {
        await prisma.mailbox.updateMany({ where: { userId }, data: { isDefault: false } });
      }
      const mailbox = await prisma.mailbox.create({
        data: {
          userId,
          label: body.label,
          type: body.type,
          isDefault: body.isDefault,
          gmailRefreshToken: body.gmailRefreshToken,
          smtpHost: body.smtpHost,
          smtpPort: body.smtpPort,
          smtpUser: body.smtpUser,
          smtpPassEnc: body.smtpPassEnc,
          imapHost: body.imapHost,
          imapPort: body.imapPort,
          imapUser: body.imapUser,
          imapPassEnc: body.imapPassEnc,
        },
      });
      return sendJsonResponse(createSuccessResponse(mailbox, "Mailbox created successfully"), 201);
    } catch (error) {
      return errorResponse(error);
    }
  },

  async updateMailbox(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureMailbox(params.id, userId);
      const body = await request.json();
      const mailbox = await prisma.mailbox.update({
        where: { id: params.id },
        data: {
          label: body.label,
          isActive: body.isActive,
          gmailRefreshToken: body.gmailRefreshToken,
          smtpHost: body.smtpHost,
          smtpPort: body.smtpPort,
          smtpUser: body.smtpUser,
          smtpPassEnc: body.smtpPassEnc,
        },
      });
      return sendJsonResponse(createSuccessResponse(mailbox, "Mailbox updated successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async deleteMailbox(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureMailbox(params.id, userId);
      await prisma.mailbox.delete({ where: { id: params.id } });
      return sendJsonResponse(createSuccessResponse(null, "Mailbox deleted successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async setDefaultMailbox(request: NextRequest, params: Params) {
    try {
      const userId = await getUserId(request);
      await this.ensureMailbox(params.id, userId);
      await prisma.mailbox.updateMany({ where: { userId }, data: { isDefault: false } });
      const mailbox = await prisma.mailbox.update({
        where: { id: params.id },
        data: { isDefault: true },
      });
      return sendJsonResponse(createSuccessResponse(mailbox, "Default mailbox updated successfully"));
    } catch (error) {
      return errorResponse(error);
    }
  },

  async ensureMailbox(id: string, userId: string) {
    const mailbox = await prisma.mailbox.findFirst({ where: { id, userId } });
    if (!mailbox) throw new NotFoundError("Mailbox not found");
    return mailbox;
  },
};
