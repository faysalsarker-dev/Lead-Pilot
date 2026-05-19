export const runtime = "nodejs";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { generateGeminiJson } from "@/lib/gemini";
import {
  buildFallbackLeads,
  buildFinderPrompt,
  findLeadsRequestSchema,
  parseGeneratedLeads,
  type GeneratedLead,
} from "@/lib/agents/finder-agent";


type ApiError = {
  success: false;
  message: string;
  statusCode: number;
  errors?: unknown;
};

function errorResponse(message: string, statusCode: number, errors?: unknown) {
  const body: ApiError = {
    success: false,
    message,
    statusCode,
    ...(errors ? { errors } : {}),
  };

  return NextResponse.json(body, { status: statusCode });
}

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

function uniqueLeads(leads: GeneratedLead[]) {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    const email = cleanEmail(lead.email);
    if (seen.has(email)) return false;
    seen.add(email);
    lead.email = email;
    return true;
  });
}

async function getSessionUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return errorResponse("Unauthorized", 401);
    }

    const json = (await request.json()) as unknown;
    const validation = findLeadsRequestSchema.safeParse(json);
    if (!validation.success) {
      return errorResponse("Invalid lead generation input", 400, validation.error.flatten().fieldErrors);
    }

    const input = validation.data;
    const prompt = buildFinderPrompt(input);
    const geminiResult = await generateGeminiJson(prompt);
    const aiLeads = geminiResult.ok ? parseGeneratedLeads(geminiResult.data) : [];
    const source = geminiResult.ok && aiLeads.length > 0 ? "gemini" : "fallback";
    const generatedLeads = uniqueLeads(
      (aiLeads.length > 0 ? aiLeads : buildFallbackLeads(input)).slice(0, input.leadCount)
    );

    let saved = 0;
    let duplicates = 0;

    if (input.save && generatedLeads.length > 0) {
      const emails = generatedLeads.map((lead) => lead.email);
      const existing = await prisma.lead.findMany({
        where: {
          userId,
          email: {
            in: emails,
          },
        },
        select: {
          email: true,
        },
      });

      const existingEmails = new Set(existing.map((lead) => cleanEmail(lead.email)));
      const newLeads = generatedLeads.filter((lead) => !existingEmails.has(lead.email));
      duplicates = generatedLeads.length - newLeads.length;

      if (newLeads.length > 0) {
        const result = await prisma.lead.createMany({
          data: newLeads.map((lead) => ({
            userId,
            name: lead.name,
            email: lead.email,
            businessName: lead.businessName,
            businessType: lead.businessType || null,
            website: lead.website || null,
            country: lead.country || input.country,
            timezone: lead.timezone || null,
            notes: lead.notes || null,
            aiScore: lead.aiScore,
            aiSummary: lead.aiSummary || null,
            aiPainPoints: lead.aiPainPoints || null,
            aiEmailOpener: lead.aiEmailOpener || null,
            aiEnriched: true,
            aiEnrichedAt: new Date(),
          })),
        });
        saved = result.count;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: input.save ? "Lead generation completed" : "Lead preview generated",
        data: {
          leads: generatedLeads,
          saved,
          duplicates,
          source,
          warning: geminiResult.ok ? null : geminiResult.reason,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("Invalid lead generation input", 400, error.flatten().fieldErrors);
    }

    console.error("AI lead generation failed:", error);
    return errorResponse("Failed to generate leads", 500);
  }
}
