import prisma from '@/lib/prisma';
import { fetchPage, extractEmail, extractDomain } from '@/lib/email-extractor';
import { generateGeminiJson } from '@/lib/gemini';
import { decrypt, encrypt } from '@/lib/encryption';

/**
 * Enriches a lead with AI data:
 * - Visits website, tries to extract email
 * - Scores 1-10 on fit
 * - Generates personalized email opener
 * - Identifies pain points
 * Triggered on lead create or manual enrichment button
 */
export async function runEnricherAgent(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { user: true },
  });

  if (!lead) {
    throw new Error(`Lead not found: ${leadId}`);
  }

  // Set enrichment status to RUNNING
  await prisma.lead.update({
    where: { id: leadId },
    data: { enrichmentStatus: 'RUNNING' },
  });

  try {
    const user = lead.user;
    const geminiApiKey = user.geminiApiKey ? decrypt(user.geminiApiKey) : undefined;

    if (!geminiApiKey) {
      throw new Error('User has no Gemini API key configured');
    }

    // Fetch website content if available
    let websiteContent = '';
    if (lead.website) {
      websiteContent = await fetchPage(lead.website);
    }

    // Build enrichment prompt
    const prompt = `You are analyzing a potential business client to determine if they are a good lead.

Lead Information:
- Name: ${lead.name}
- Business: ${lead.businessName || 'Unknown'}
- Website: ${lead.website || 'None'}
- Website Content (first 5000 chars): ${websiteContent.substring(0, 5000) || 'Not available'}

Based on this information, provide:
1. A score from 1-10 on how good a fit they are as a potential client
2. A 2-3 sentence summary of the business
3. 2-3 key pain points they likely face
4. A personalized 1-2 sentence email opener that references something specific about their business

Return as JSON:
{
  "score": 8,
  "summary": "...",
  "painPoints": ["pain1", "pain2", "pain3"],
  "emailOpener": "..."
}`;

    // Call Gemini
    const result = (await generateGeminiJson(prompt, geminiApiKey)) as {
      score?: number;
      summary?: string;
      painPoints?: string[];
      emailOpener?: string;
    };

    // Validate and extract results
    const score = Math.min(10, Math.max(1, result.score || 5));
    const summary = result.summary || '';
    const painPoints = (result.painPoints || []).slice(0, 3);
    const opener = result.emailOpener || '';

    // Update lead with enrichment data
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        aiScore: score,
        aiSummary: summary,
        aiPainPoints: JSON.stringify(painPoints),
        aiEmailOpener: opener,
        aiEnrichedAt: new Date(),
        enrichmentStatus: 'DONE',
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: lead.userId,
        leadId,
        type: 'AI_ENRICHMENT_DONE',
        message: `Lead enrichment complete. Score: ${score}/10`,
      },
    });

    return { success: true, score, summary };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);

    // Set enrichment status to FAILED
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        enrichmentStatus: 'FAILED',
        aiSummary: `Enrichment failed: ${errorMsg}`,
      },
    });

    throw new Error(`Enrichment failed: ${errorMsg}`);
  }
}
