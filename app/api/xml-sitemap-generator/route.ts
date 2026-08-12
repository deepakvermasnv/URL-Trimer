import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';
import { SitemapStream, streamToPromise } from 'sitemap';

export const runtime = 'nodejs';
export const maxDuration = 60;

const IGNORED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff', 'avif',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv',
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso', 'dmg',
  'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'ogg', 'wav',
  'css', 'js', 'mjs', 'json', 'xml', 'rss', 'atom', 'woff', 'woff2', 'ttf', 'eot', 'otf'
]);

function isIgnoredExtension(pathname: string): boolean {
  const parts = pathname.split('.');
  if (parts.length <= 1) return false;
  const ext = parts[parts.length - 1].toLowerCase();
  return IGNORED_EXTENSIONS.has(ext);
}

function normalizeUrl(rawUrl: string, baseOrigin: string): string | null {
  try {
    const parsed = new URL(rawUrl, baseOrigin);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    
    // Only internal domain links
    const targetOrigin = new URL(baseOrigin).hostname.replace(/^www\./, '');
    const currentHost = parsed.hostname.replace(/^www\./, '');
    if (currentHost !== targetOrigin) return null;

    if (isIgnoredExtension(parsed.pathname)) return null;

    parsed.hash = ''; // Strip fragment
    
    let clean = parsed.toString();
    if (clean.endsWith('/') && parsed.pathname !== '/') {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return null;
  }
}

async function fetchRobotsTxt(origin: string): Promise<string[]> {
  try {
    const res = await fetch(`${origin}/robots.txt`, {
      signal: AbortSignal.timeout(3000),
      headers: { 'User-Agent': 'URLTrimSitemapBot/1.0 (+https://www.urltrim.online)' }
    });
    if (!res.ok) return [];
    const text = await res.text();
    const rules: string[] = [];
    let isTargetUserAgent = true;

    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || !trimmed) continue;
      const [key, ...valueParts] = trimmed.split(':');
      if (!key || valueParts.length === 0) continue;
      
      const val = valueParts.join(':').trim();
      const lowerKey = key.trim().toLowerCase();

      if (lowerKey === 'user-agent') {
        isTargetUserAgent = val === '*' || val.toLowerCase().includes('bot');
      } else if (lowerKey === 'disallow' && isTargetUserAgent && val) {
        rules.push(val);
      }
    }
    return rules;
  } catch {
    return [];
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function createXmlSitemapString(
  pages: Array<{ url: string; lastmod?: string }>,
  options: { changefreq: string; priority: string }
): Promise<string> {
  try {
    const firstUrl = pages[0]?.url || 'https://example.com';
    const parsedOrigin = new URL(firstUrl).origin;
    const smStream = new SitemapStream({ hostname: parsedOrigin });

    for (const [index, page] of pages.entries()) {
      const isHomepage = index === 0 || new URL(page.url).pathname === '/';
      smStream.write({
        url: page.url,
        changefreq: options.changefreq || 'weekly',
        priority: isHomepage ? 1.0 : parseFloat(options.priority || '0.8'),
        lastmod: page.lastmod || new Date().toISOString().split('T')[0],
      });
    }
    smStream.end();
    const buffer = await streamToPromise(smStream);
    return buffer.toString();
  } catch {
    // Fallback XML generator
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    pages.forEach((page, index) => {
      const isHomepage = index === 0 || new URL(page.url).pathname === '/';
      const prio = isHomepage ? '1.0' : (options.priority || '0.8');
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(page.url)}</loc>\n`;
      xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
      xml += `    <changefreq>${options.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${prio}</priority>\n`;
      xml += `  </url>\n`;
    });
    xml += `</urlset>`;
    return xml;
  }
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();

  let body: {
    url?: string;
    maxPages?: number;
    maxDepth?: number;
    changeFreq?: string;
    priority?: string;
    respectRobots?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let startUrlParsed: URL;
  try {
    let formattedUrl = rawUrl;
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    startUrlParsed = new URL(formattedUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Please enter a valid website URL (e.g. https://example.com)' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const maxPages = Math.min(Math.max(1, body.maxPages || 100), 500);
  const maxDepth = Math.min(Math.max(1, body.maxDepth || 3), 5);
  const changeFreq = body.changeFreq || 'weekly';
  const priority = body.priority || '0.8';
  const respectRobots = body.respectRobots !== false;

  const startUrl = startUrlParsed.toString();
  const baseOrigin = startUrlParsed.origin;

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        sendEvent({ type: 'status', message: 'Checking robots.txt...' });

        const disallowRules = respectRobots ? await fetchRobotsTxt(baseOrigin) : [];

        sendEvent({ type: 'status', message: 'Starting website crawl...' });

        const visited = new Set<string>();
        const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
        visited.add(startUrl);

        const discoveredPages: Array<{
          url: string;
          depth: number;
          status: number;
          title: string;
          lastmod: string;
        }> = [];

        const startTime = Date.now();
        const maxCrawlTimeMs = 50000; // 50 seconds safety timeout

        while (queue.length > 0 && discoveredPages.length < maxPages) {
          if (Date.now() - startTime > maxCrawlTimeMs) {
            sendEvent({ type: 'status', message: 'Crawl time limit reached (50s safety limit).' });
            break;
          }

          // Process batch of 3 requests concurrently
          const batch = queue.splice(0, 3);
          
          await Promise.all(
            batch.map(async (item) => {
              if (discoveredPages.length >= maxPages) return;

              // Check disallow rules
              const path = new URL(item.url).pathname;
              if (disallowRules.some((rule) => rule && path.startsWith(rule))) {
                return;
              }

              try {
                const controllerAbort = new AbortController();
                const timeoutId = setTimeout(() => controllerAbort.abort(), 6000);

                const res = await fetch(item.url, {
                  signal: controllerAbort.signal,
                  headers: {
                    'User-Agent': 'URLTrimSitemapBot/1.0 (+https://www.urltrim.online)',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
                  },
                });
                clearTimeout(timeoutId);

                const contentType = res.headers.get('content-type') || '';
                const lastModHeader = res.headers.get('last-modified');
                const lastmod = lastModHeader ? new Date(lastModHeader).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

                if (!res.ok) {
                  return;
                }

                if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
                  return;
                }

                const html = await res.text();
                const $ = cheerio.load(html);

                const title = $('title').text().trim().replace(/\s+/g, ' ').substring(0, 80) || 'Untitled Page';

                discoveredPages.push({
                  url: item.url,
                  depth: item.depth,
                  status: res.status,
                  title,
                  lastmod,
                });

                sendEvent({
                  type: 'progress',
                  url: item.url,
                  status: res.status,
                  depth: item.depth,
                  title,
                  totalFound: discoveredPages.length,
                  queueSize: queue.length,
                });

                // Extract internal links if depth < maxDepth
                if (item.depth < maxDepth && discoveredPages.length < maxPages) {
                  $('a[href]').each((_, el) => {
                    const href = $(el).attr('href');
                    if (!href) return;

                    const trimmedHref = href.trim();
                    if (
                      trimmedHref.startsWith('mailto:') ||
                      trimmedHref.startsWith('tel:') ||
                      trimmedHref.startsWith('javascript:') ||
                      trimmedHref.startsWith('#') ||
                      trimmedHref.startsWith('data:')
                    ) {
                      return;
                    }

                    const normalized = normalizeUrl(trimmedHref, item.url);
                    if (normalized && !visited.has(normalized)) {
                      visited.add(normalized);
                      if (visited.size <= maxPages * 2) {
                        queue.push({ url: normalized, depth: item.depth + 1 });
                      }
                    }
                  });
                }
              } catch {
                // Ignore fetch failure for individual non-responsive page
              }
            })
          );
        }

        if (discoveredPages.length === 0) {
          sendEvent({
            type: 'error',
            message: 'No crawlable HTML pages were found at this URL. Please verify the URL and try again.',
          });
          controller.close();
          return;
        }

        sendEvent({ type: 'status', message: 'Generating sitemap XML...' });

        const xmlString = await createXmlSitemapString(discoveredPages, { changefreq: changeFreq, priority });

        sendEvent({
          type: 'complete',
          xml: xmlString,
          totalPages: discoveredPages.length,
          pages: discoveredPages,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to complete website crawl.';
        sendEvent({ type: 'error', message: errorMsg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
