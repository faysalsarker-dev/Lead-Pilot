import { NextRequest, NextResponse } from 'next/server';

/**
 * Email open pixel tracking
 * Returns 1x1 transparent GIF and logs open event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Log open event asynchronously (don't await)
    recordPixelOpen(token).catch((error) => {
      console.error('Failed to record pixel open:', error);
    });

    // Return 1x1 transparent PNG GIF
    const gif = Buffer.from([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0xff, 0xff, 0xff,
      0x00, 0x00, 0x00, 0x21, 0xf9, 0x04, 0x01, 0x0a, 0x00, 0x01, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x4c, 0x01, 0x00, 0x3b,
    ]);

    return new NextResponse(gif, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': gif.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Pixel tracking error:', error);
    return new NextResponse(Buffer.alloc(0), { status: 204 });
  }
}

/**
 * Records pixel open in database
 */
async function recordPixelOpen(token: string) {
  // In a real implementation, you would:
  // 1. Look up the email queue record by pixel token
  // 2. Update the corresponding CampaignLead.openedAt
  // For now, this is a placeholder that could be extended

  // Since we don't have a direct pixel token lookup,
  // this would require storing it in EmailQueue
  // For now, just log for monitoring
  console.log(`[PIXEL OPEN] Token: ${token}`);
}
