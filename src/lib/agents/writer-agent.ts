import prisma from '@/lib/prisma';
import { generateGeminiJson } from '@/lib/gemini';
import { decrypt } from '@/lib/encryption';

/**
 * Generates email templates using AI
 * User describes their goal, Gemini creates subject A, subject B, and body
 * Supports variables: {{name}} {{business}} {{pain_point}} {{your_name}}
 */
export async function runTemplateGeneratorAgent(
  userId: string,
  goal: string,
  templateType: 'INITIAL' | 'FOLLOWUP_1' | 'FOLLOWUP_2' | 'FINAL'
): Promise<{ subjectA: string; subjectB: string; body: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const geminiApiKey = user.geminiApiKey ? decrypt(user.geminiApiKey) : undefined;

  if (!geminiApiKey) {
    throw new Error('User has no Gemini API key configured');
  }

  // Build context based on template type
  let typeContext = '';
  if (templateType === 'INITIAL') {
    typeContext =
      'This is the FIRST cold outreach email. Make it personalized, specific, and show youve done research about their business.';
  } else if (templateType === 'FOLLOWUP_1') {
    typeContext =
      'This is the FIRST follow-up email (3 days after initial). Reference the first email politely and add new value.';
  } else if (templateType === 'FOLLOWUP_2') {
    typeContext =
      'This is the SECOND follow-up email (5 days after first follow-up). Make it urgent but respectful. Offer to show them quickly.';
  } else if (templateType === 'FINAL') {
    typeContext =
      'This is the FINAL email (1 week after second follow-up). Make it the last chance to connect. Keep it brief.';
  }

  const prompt = `You are an expert cold outreach email writer. Generate a high-converting ${templateType} email template.

${typeContext}

User's goal: ${goal}
User's name: ${user.name || 'Team'}
User's service: ${user.service || 'services'}

Generate TWO subject line variants and ONE compelling email body.

IMPORTANT:
- Subject lines should be short (<50 chars), intriguing, and relevant
- Email body should feel personal and specific, not generic
- MUST include these variables: {{name}}, {{business}}, {{pain_point}}
- Add {{your_name}} in signature or greeting
- Keep body to ~200 words max
- Make it feel like it's from a real person, not a template

Return as JSON:
{
  "subjectA": "First variant...",
  "subjectB": "Second variant...",
  "body": "Hi {{name}},\\n\\nBody text here with {{pain_point}} and {{business}}..."
}`;

  try {
    const result = (await generateGeminiJson(prompt, geminiApiKey)) as {
      subjectA?: string;
      subjectB?: string;
      body?: string;
    };

    if (!result.subjectA || !result.body) {
      throw new Error('Invalid response from Gemini');
    }

    return {
      subjectA: result.subjectA,
      subjectB: result.subjectB || result.subjectA,
      body: result.body,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate template: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
import prisma from '@/lib/prisma';
import { generateGeminiJson } from '@/lib/gemini';
import { decrypt } from '@/lib/encryption';

/**
 * Drafts a reply to a lead's email using AI
 * Triggered in the inbox when user opens a conversation
 * Returns ~80-word response that user can review and send
 */
export async function runWriterAgent(leadId: string, userId: string): Promise<string> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
  });

  if (!lead || lead.userId !== userId) {
    throw new Error('Lead not found or unauthorized');
  }

  // Get conversation history
  const conversation = await prisma.conversation.findUnique({
    where: { leadId },
  });

  if (!conversation) {
    throw new Error('No conversation found for lead');
  }

  // Get user for personalization
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const geminiApiKey = user.geminiApiKey ? decrypt(user.geminiApiKey) : undefined;

  if (!geminiApiKey) {
    throw new Error('User has no Gemini API key configured');
  }

  // Extract previous messages
  const messages = (conversation.messages as Array<any>) || [];
  const recentMessages = messages.slice(-4); // Last 2 exchanges

  let conversationContext = 'Recent email conversation:\n';
  for (const msg of recentMessages) {
    const sender = msg.role === 'user' ? user.name || 'You' : lead.name;
    conversationContext += `\n${sender}: ${msg.body}\n`;
  }

  // Build prompt
  const prompt = `You are ${user.name || 'a professional'} who provides ${user.service || 'services'}.

${conversationContext}

The lead just sent the above message. Draft a professional, friendly response that:
1. Addresses their specific question or concern
2. Shows genuine interest in helping them
3. Proposes a next step (call, demo, etc.)
4. Keeps tone conversational and warm
5. Is about 80 words

Do NOT include a subject line. Just the email body.`;

  try {
    const response = await generateGeminiText(prompt, geminiApiKey);
    return response;
  } catch (error) {
    throw new Error(
      `Failed to draft reply: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Helper to generate plain text from Gemini
 */
async function generateGeminiText(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' +
      apiKey,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = (await response.json()) as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  if (!text) {
    throw new Error('No response from Gemini');
  }

  return text.trim();
}
