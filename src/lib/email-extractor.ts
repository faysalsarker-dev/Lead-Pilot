/**
 * Extracts email address from text
 * Handles multiple formats: plain email, email from headers, HTML, etc.
 */
export function extractEmail(text: string): string | null {
  if (!text) return null;

  // RFC 5322 simplified email regex
  const emailRegex = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailRegex);

  if (matches && matches.length > 0) {
    // Return first match, prefer addresses that don't look like system emails
    const filtered = matches.filter(
      (e) => !e.toLowerCase().includes('noreply') && !e.toLowerCase().includes('no-reply')
    );
    return filtered.length > 0 ? filtered[0] : matches[0];
  }

  return null;
}

/**
 * Extracts plain text from HTML email content
 * Removes HTML tags, scripts, styles, and cleans up whitespace
 */
export function extractText(html: string): string {
  if (!html) return '';

  let text = html
    // Remove script and style elements
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove HTML tags
    .replace(/<[^>]+>/g, ' ')
    // Decode HTML entities
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    // Clean up whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Fetches a web page and returns its text content
 * Used for lead website enrichment
 */
export async function fetchPage(url: string, timeoutMs = 5000): Promise<string> {
  try {
    // Ensure URL has protocol
    let fetchUrl = url;
    if (!fetchUrl.startsWith('http://') && !fetchUrl.startsWith('https://')) {
      fetchUrl = `https://${fetchUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(fetchUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return '';
    }

    const html = await response.text();
    const text = extractText(html);

    // Truncate to first 10000 characters to avoid huge payloads
    return text.substring(0, 10000);
  } catch (error) {
    // Silently fail - could be network issue, timeout, or page unavailable
    return '';
  }
}

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname || '';
  } catch {
    return '';
  }
}
