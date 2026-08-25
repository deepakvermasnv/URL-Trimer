import { NextRequest } from 'next/server';
import * as cheerio from 'cheerio';
import { SitemapStream, streamToPromise } from 'sitemap';

export const runtime = 'nodejs';
export const maxDuration = 60;

const IGNORED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff', 'avif',
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'txt',
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'iso', 'dmg', 'exe', 'bin', 'apk',
  'mp3', 'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'ogg', 'wav', 'm4a',
  'css', 'js', 'mjs', 'json', 'xml', 'rss', 'atom', 'map',
  'woff', 'woff2', 'ttf', 'eot', 'otf'
]);

const TRACKING_PARAMS = new Set([
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
  'gclid', 'fbclid', 'ref', 'source', 'mc_cid', 'mc_eid', '_hsenc', '_hsmi',
  'igshid', 'twclid'
]);

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"Windows"',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Upgrade-Insecure-Requests': '1',
};

function isIgnoredExtension(pathname: string): boolean {
  const parts = pathname.split('/');
  const lastPart = parts[parts.length - 1] || '';
  if (!lastPart.includes('.')) return false;
  const dotParts = lastPart.split('.');
  const ext = dotParts[dotParts.length - 1].toLowerCase();
  return IGNORED_EXTENSIONS.has(ext);
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, '');
}

function normalizeUrl(rawUrl: string, currentContextUrl: string, baseOriginUrl: string): string | null {
  try {
    const parsed = new URL(rawUrl, currentContextUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;

    const baseParsed = new URL(baseOriginUrl);
    const baseDomain = normalizeHostname(baseParsed.hostname);
    const currentDomain = normalizeHostname(parsed.hostname);

    // Only allow links matching the exact root domain
    if (currentDomain !== baseDomain) return null;

    if (isIgnoredExtension(parsed.pathname)) return null;

    // Strip hash fragment
    parsed.hash = '';

    // Strip common tracking query params
    const searchParams = new URLSearchParams(parsed.search);
    let hasModifiedSearch = false;
    for (const key of Array.from(searchParams.keys())) {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.startsWith('utm_')) {
        searchParams.delete(key);
        hasModifiedSearch = true;
      }
    }
    if (hasModifiedSearch) {
      parsed.search = searchParams.toString() ? `?${searchParams.toString()}` : '';
    }

    let clean = parsed.toString();
    // Normalize trailing slash for paths other than root
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
      signal: AbortSignal.timeout(4000),
      headers: BROWSER_HEADERS
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
        // Exclude root disallow if empty or just /
        if (val !== '/') {
          rules.push(val);
        }
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
  pages: Array<{ url: string; lastmod?: string; priority?: string; changefreq?: string }>,
  defaultOptions: { changefreq: string; priority: string }
): Promise<string> {
  try {
    const firstUrl = pages[0]?.url || 'https://example.com';
    const parsedOrigin = new URL(firstUrl).origin;
    const smStream = new SitemapStream({ hostname: parsedOrigin });

    for (const [index, page] of pages.entries()) {
      const isHomepage = index === 0 || new URL(page.url).pathname === '/';
      smStream.write({
        url: page.url,
        changefreq: page.changefreq || defaultOptions.changefreq || 'weekly',
        priority: page.priority ? parseFloat(page.priority) : (isHomepage ? 1.0 : parseFloat(defaultOptions.priority || '0.8')),
        lastmod: page.lastmod || new Date().toISOString().split('T')[0],
      });
    }
    smStream.end();
    const buffer = await streamToPromise(smStream);
    return buffer.toString();
  } catch {
    // Robust fallback XML generator
    const today = new Date().toISOString().split('T')[0];
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    pages.forEach((page, index) => {
      const isHomepage = index === 0 || new URL(page.url).pathname === '/';
      const prio = page.priority || (isHomepage ? '1.0' : (defaultOptions.priority || '0.8'));
      const freq = page.changefreq || defaultOptions.changefreq || 'weekly';
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(page.url)}</loc>\n`;
      xml += `    <lastmod>${page.lastmod || today}</lastmod>\n`;
      xml += `    <changefreq>${freq}</changefreq>\n`;
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
    urlsList?: string[];
    maxPages?: number;
    maxDepth?: number;
    changeFreq?: string;
    priority?: string;
    respectRobots?: boolean;
    directGenerate?: boolean;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const changeFreq = body.changeFreq || 'weekly';
  const priority = body.priority || '0.8';

  // DIRECT GENERATION FROM URL LIST (Instant mode)
  if (body.directGenerate && Array.isArray(body.urlsList) && body.urlsList.length > 0) {
    try {
      const cleanUrls: Array<{ url: string; lastmod: string; title: string; depth: number; status: number }> = [];
      const seen = new Set<string>();

      for (const raw of body.urlsList) {
        let u = raw.trim();
        if (!u) continue;
        if (!/^https?:\/\//i.test(u)) {
          u = `https://${u}`;
        }
        try {
          const parsed = new URL(u);
          parsed.hash = '';
          const normalized = parsed.toString();
          if (!seen.has(normalized)) {
            seen.add(normalized);
            cleanUrls.push({
              url: normalized,
              lastmod: new Date().toISOString().split('T')[0],
              title: parsed.pathname === '/' ? 'Home Page' : parsed.pathname.replace(/^\//, ''),
              depth: 0,
              status: 200,
            });
          }
        } catch {
          // ignore invalid
        }
      }

      if (cleanUrls.length === 0) {
        return new Response(JSON.stringify({ error: 'No valid URLs provided in the list.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const xml = await createXmlSitemapString(cleanUrls, { changefreq: changeFreq, priority });
      return new Response(JSON.stringify({
        xml,
        totalPages: cleanUrls.length,
        pages: cleanUrls,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err: unknown) {
      return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Failed to generate XML' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // CRAWLER STREAMING MODE
  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return new Response(JSON.stringify({ error: 'Website URL is required.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let initialUrl: string;
  try {
    let formatted = rawUrl;
    if (!/^https?:\/\//i.test(formatted)) {
      formatted = `https://${formatted}`;
    }
    const testParsed = new URL(formatted);
    initialUrl = testParsed.toString();
  } catch {
    return new Response(JSON.stringify({ error: 'Please enter a valid website URL (e.g., https://example.com).' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const maxPages = Math.min(Math.max(1, body.maxPages || 100), 500);
  const maxDepth = Math.min(Math.max(1, body.maxDepth || 3), 5);
  const respectRobots = body.respectRobots !== false;

  const stream = new ReadableStream({
    async start(controller) {
      function sendEvent(data: Record<string, unknown>) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      try {
        sendEvent({ type: 'status', message: 'Testing connection to website...' });

        let currentBaseUrl = initialUrl;
        let startUrlParsed = new URL(initialUrl);

        // Verify initial page connection and resolve redirects
        const initialAbort = new AbortController();
        const initialTimeout = setTimeout(() => initialAbort.abort(), 12000);

        let initialResponse: Response;
        try {
          initialResponse = await fetch(initialUrl, {
            signal: initialAbort.signal,
            headers: BROWSER_HEADERS,
            redirect: 'follow',
          });
        } catch (fetchErr: unknown) {
          clearTimeout(initialTimeout);
          const msg = fetchErr instanceof Error ? fetchErr.message : 'Network failure';
          sendEvent({
            type: 'error',
            message: `Could not connect to ${initialUrl}. Error: ${msg}. Please check if the domain is live and accessible.`,
          });
          controller.close();
          return;
        }
        clearTimeout(initialTimeout);

        if (!initialResponse.ok) {
          sendEvent({
            type: 'error',
            message: `Website returned HTTP ${initialResponse.status} ${initialResponse.statusText}. The site might require login or be protected by a firewall.`,
          });
          controller.close();
          return;
        }

        // If redirect occurred, update base origin
        if (initialResponse.url && initialResponse.url !== initialUrl) {
          try {
            startUrlParsed = new URL(initialResponse.url);
            currentBaseUrl = initialResponse.url;
            sendEvent({ type: 'status', message: `Followed redirect to: ${currentBaseUrl}` });
          } catch {
            // Keep original if parse fails
          }
        }

        const baseOrigin = startUrlParsed.origin;

        if (respectRobots) {
          sendEvent({ type: 'status', message: 'Checking robots.txt...' });
        }

        const disallowRules = respectRobots ? await fetchRobotsTxt(baseOrigin) : [];

        sendEvent({ type: 'status', message: 'Starting website crawl...' });

        const visited = new Set<string>();
        const queue: Array<{ url: string; depth: number }> = [{ url: currentBaseUrl, depth: 0 }];
        visited.add(currentBaseUrl);

        const discoveredPages: Array<{
          url: string;
          depth: number;
          status: number;
          title: string;
          lastmod: string;
        }> = [];

        const startTime = Date.now();
        const maxCrawlTimeMs = 50000; // 50s runtime safety cap

        // Process starting page with already fetched content
        try {
          const initialContentType = initialResponse.headers.get('content-type') || '';
          if (initialContentType.includes('text/html') || initialContentType.includes('application/xhtml+xml')) {
            const initialHtml = await initialResponse.text();
            const $ = cheerio.load(initialHtml);

            // Extract base href if specified in HTML
            let baseTagHref = $('base[href]').attr('href');
            let resolutionBase = currentBaseUrl;
            if (baseTagHref) {
              try {
                resolutionBase = new URL(baseTagHref, currentBaseUrl).toString();
              } catch {
                resolutionBase = currentBaseUrl;
              }
            }

            const title = $('title').text().trim().replace(/\s+/g, ' ').substring(0, 90) || 'Home Page';
            const lastModHeader = initialResponse.headers.get('last-modified');
            const metaModTime = $('meta[property="article:modified_time"]').attr('content') || $('meta[name="revised"]').attr('content');
            
            let lastmod = new Date().toISOString().split('T')[0];
            if (lastModHeader) {
              try { lastmod = new Date(lastModHeader).toISOString().split('T')[0]; } catch {}
            } else if (metaModTime) {
              try { lastmod = new Date(metaModTime).toISOString().split('T')[0]; } catch {}
            }

            discoveredPages.push({
              url: currentBaseUrl,
              depth: 0,
              status: initialResponse.status,
              title,
              lastmod,
            });

            sendEvent({
              type: 'progress',
              url: currentBaseUrl,
              status: initialResponse.status,
              depth: 0,
              title,
              totalFound: discoveredPages.length,
              queueSize: queue.length,
            });

            // Extract internal links from homepage
            if (maxDepth > 0) {
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

                const normalized = normalizeUrl(trimmedHref, resolutionBase, currentBaseUrl);
                if (normalized && !visited.has(normalized)) {
                  visited.add(normalized);
                  queue.push({ url: normalized, depth: 1 });
                }
              });
            }
          }
        } catch {
          // Continue to loop
        }

        // Remove starting url from queue if already processed
        if (queue.length > 0 && queue[0].url === currentBaseUrl) {
          queue.shift();
        }

        // Crawl remaining queue
        while (queue.length > 0 && discoveredPages.length < maxPages) {
          if (Date.now() - startTime > maxCrawlTimeMs) {
            sendEvent({ type: 'status', message: 'Crawl safety time limit reached (50s). Generating sitemap with found pages...' });
            break;
          }

          // Concurrency of 4 requests
          const batch = queue.splice(0, 4);

          await Promise.all(
            batch.map(async (item) => {
              if (discoveredPages.length >= maxPages) return;

              // Check robots.txt disallows
              const path = new URL(item.url).pathname;
              if (disallowRules.some((rule) => rule && path.startsWith(rule))) {
                return;
              }

              try {
                const controllerAbort = new AbortController();
                const timeoutId = setTimeout(() => controllerAbort.abort(), 7000);

                const res = await fetch(item.url, {
                  signal: controllerAbort.signal,
                  headers: BROWSER_HEADERS,
                  redirect: 'follow',
                });
                clearTimeout(timeoutId);

                if (!res.ok) return;

                const contentType = res.headers.get('content-type') || '';
                if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
                  return;
                }

                const html = await res.text();
                const $ = cheerio.load(html);

                let baseTagHref = $('base[href]').attr('href');
                let resolutionBase = item.url;
                if (baseTagHref) {
                  try {
                    resolutionBase = new URL(baseTagHref, item.url).toString();
                  } catch {
                    resolutionBase = item.url;
                  }
                }

                const title = $('title').text().trim().replace(/\s+/g, ' ').substring(0, 90) || 'Untitled Page';
                const lastModHeader = res.headers.get('last-modified');
                const metaModTime = $('meta[property="article:modified_time"]').attr('content') || $('meta[name="revised"]').attr('content');

                let lastmod = new Date().toISOString().split('T')[0];
                if (lastModHeader) {
                  try { lastmod = new Date(lastModHeader).toISOString().split('T')[0]; } catch {}
                } else if (metaModTime) {
                  try { lastmod = new Date(metaModTime).toISOString().split('T')[0]; } catch {}
                }

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

                // Add children to queue if depth < maxDepth
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

                    const normalized = normalizeUrl(trimmedHref, resolutionBase, currentBaseUrl);
                    if (normalized && !visited.has(normalized)) {
                      visited.add(normalized);
                      if (visited.size <= maxPages * 3) {
                        queue.push({ url: normalized, depth: item.depth + 1 });
                      }
                    }
                  });
                }
              } catch {
                // Ignore individual page timeout or fail
              }
            })
          );
        }

        if (discoveredPages.length === 0) {
          sendEvent({
            type: 'error',
            message: 'No crawlable HTML pages could be extracted from this URL. Please verify the URL or try Direct URL mode.',
          });
          controller.close();
          return;
        }

        sendEvent({ type: 'status', message: 'Generating valid XML Sitemap...' });

        const xmlString = await createXmlSitemapString(discoveredPages, { changefreq: changeFreq, priority });

        sendEvent({
          type: 'complete',
          xml: xmlString,
          totalPages: discoveredPages.length,
          pages: discoveredPages,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Crawler encountered an unexpected error.';
        sendEvent({ type: 'error', message: errorMsg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
