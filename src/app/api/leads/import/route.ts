import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import Papa from 'papaparse';

const csvLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  businessName: z.string(),
  website: z.string().url().optional().or(z.literal('')),
  timezone: z.string().optional().or(z.literal('')),
  country: z.string().optional().or(z.literal('')),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Parse CSV
    const text = await file.text();
    const results = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (results.errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid CSV format' },
        { status: 400 }
      );
    }

    // Validate and create leads
    const leads = [];
    const errors = [];

    for (let i = 0; i < results.data.length; i++) {
      const row = results.data[i];

      try {
        const validated = csvLeadSchema.parse(row);

        // Check if email already exists
        const existing = await prisma.lead.findFirst({
          where: { email: validated.email, userId: session.user.id },
        });

        if (existing) {
          errors.push(`Row ${i + 2}: Email already exists`);
          continue;
        }

        leads.push({
          userId: session.user.id,
          name: validated.name,
          email: validated.email,
          businessName: validated.businessName,
          website: validated.website || null,
          timezone: validated.timezone || null,
          country: validated.country || null,
          source: 'CSV_IMPORT',
          status: 'NEW',
        });
      } catch (error) {
        errors.push(`Row ${i + 2}: ${error instanceof z.ZodError ? error.errors[0]?.message : 'Invalid data'}`);
      }
    }

    if (leads.length === 0) {
      return NextResponse.json(
        { error: 'No valid leads to import', details: errors },
        { status: 400 }
      );
    }

    // Bulk create
    const created = await prisma.lead.createMany({
      data: leads,
    });

    return NextResponse.json({
      data: {
        imported: created.count,
        skipped: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 400 });
  }
}
