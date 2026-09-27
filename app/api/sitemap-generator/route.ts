import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import dns from 'node:dns/promises';

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

const STANDARD_BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

/**
 * SSRF Protection: verify if an IP is private, link-local, loopback, or cloud-internal
 */
function isPrivateOrRestrictedIp(ip: string): boolean {
  if (ip.includes('.')) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;
    const [a, b] = parts;

    if (a === 0) return true; // 0.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 169 && b === 254) return true; // 169.254.0.0/16
    if (a === 100 && b >= 64 && b <= 127) return true; // 100.64.0.0/10
    if (a === 192 && b === 0) return true;
    if (a === 198 && b === 51 && parts[2] === 100) return true;
    if (a === 203 && b === 0 && parts[2] === 113) return true;
    if (a >= 224) return true;

    return false;
  }

  const clean = ip.toLowerCase();
  if (
    clean === '::1' ||
    clean === '::' ||
    clean.startsWith('fe80:') ||
    clean.startsWith('fc') ||
    clean.startsWith('fd') ||
    clean.startsWith('::ffff:127.') ||
    clean.startsWith('::ffff:10.') ||
    clean.startsWith('::ffff:192.168.') ||
    clean.startsWith('::ffff:169.254.')
  ) {
    return true;
  }
  return false;
}

/**
 * Validate that a URL is a public web address and not an SSRF exploit attempt
 */
async function validateUrlForSsrf(targetUrl: string): Promise<{ valid: boolean; error?: string; parsed?: URL }> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format. Please provide a valid HTTP or HTTPS URL.' };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { valid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
  }

  const hostname = parsed.hostname.toLowerCase();

  const forbiddenHosts = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'metadata.google.internal',
    '169.254.169.254',
    'instance-data',
  ];

  if (
    forbiddenHosts.includes(hostname) ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname.endsWith('.lan') ||
    hostname.endsWith('.home') ||
    hostname.endsWith('.corp') ||
    hostname.endsWith('.test') ||
    hostname.endsWith('.example') ||
    hostname.endsWith('.invalid')
  ) {
    return { valid: false, error: 'Access to localhost, local services, or internal network addresses is not allowed.' };
  }

  try {
    const addresses = await dns.lookup(hostname, { all: true });
    if (!addresses || addresses.length === 0) {
      return { valid: false, error: 'Could not resolve domain name. Please verify the URL.' };
    }

    for (const record of addresses) {
      if (isPrivateOrRestrictedIp(record.address)) {
        return { valid: false, error: 'Access to private, loopback, or restricted IP addresses is prohibited.' };
      }
    }
  } catch {
    return { valid: false, error: `Could not resolve hostname "${hostname}". Please check if the website exists.` };
  }

  return { valid: true, parsed };
}

function cleanAndNormalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.hash = '';

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
    if (clean.endsWith('/') && parsed.pathname !== '/') {
      clean = clean.slice(0, -1);
    }
    return clean;
  } catch {
    return rawUrl;
  }
}

function isNonPageResource(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const pathname = parsed.pathname.toLowerCase();
    const parts = pathname.split('/');
    const lastPart = parts[parts.length - 1] || '';
    if (!lastPart.includes('.')) return false;
    const dotParts = lastPart.split('.');
    const ext = dotParts[dotParts.length - 1].toLowerCase();
    return IGNORED_EXTENSIONS.has(ext);
  } catch {
    return true;
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

function generateXmlSitemap(urls: string[]): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of urls) {
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(u)}</loc>\n`;
    xml += `  </url>\n`;
  }
  xml += `</urlset>`;
  return xml;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      url,
      maxPages = 0,
      maxDepth = 10,
    } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid website URL.' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const ssrfCheck = await validateUrlForSsrf(targetUrl);
    if (!ssrfCheck.valid || !ssrfCheck.parsed) {
      return NextResponse.json({ error: ssrfCheck.error || 'Invalid or prohibited URL.' }, { status: 400 });
    }

    const startUrl = ssrfCheck.parsed.toString();
    const origin = ssrfCheck.parsed.origin;

    // Normalize domain host (allowing both www and non-www domain aliases)
    const baseHost = ssrfCheck.parsed.hostname.replace(/^www\./i, '');

    const requestedMaxPages = Number(maxPages);
    const safeMaxPages = (isNaN(requestedMaxPages) || requestedMaxPages <= 0) ? 5000 : Math.min(requestedMaxPages, 5000);
    const requestedMaxDepth = Number(maxDepth);
    const safeMaxDepth = (isNaN(requestedMaxDepth) || requestedMaxDepth <= 0) ? 10 : Math.min(requestedMaxDepth, 10);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (data: Record<string, unknown>) => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      } catch {
        // Client closed stream
      }
    };

    (async () => {
      let isFinished = false;
      const discoveredUrls = new Set<string>();
      const visitedUrls = new Set<string>();
      const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
      const scannedScripts = new Set<string>();

      const isInternalUrl = (u: string): boolean => {
        try {
          const p = new URL(u);
          const h = p.hostname.replace(/^www\./i, '');
          return h === baseHost;
        } catch {
          return false;
        }
      };

      const addDiscoveredUrl = async (u: string, depth: number) => {
        if (isNonPageResource(u)) return;
        const cleaned = cleanAndNormalizeUrl(u);
        if (!isInternalUrl(cleaned)) return;

        if (!discoveredUrls.has(cleaned)) {
          discoveredUrls.add(cleaned);
          await sendEvent({
            type: 'url_discovered',
            url: cleaned,
            depth,
            discoveredCount: discoveredUrls.size,
          });
        }
      };

      const finishCrawl = async (message?: string) => {
        if (isFinished) return;
        isFinished = true;

        const finalUrls = Array.from(discoveredUrls)
          .filter((u) => !isNonPageResource(u))
          .sort();

        if (finalUrls.length === 0) {
          await sendEvent({
            type: 'error',
            error: 'Could not access or crawl any pages from this website. Please verify that the website is online.'
          });
        } else {
          const xml = generateXmlSitemap(finalUrls);
          await sendEvent({
            type: 'complete',
            totalPages: finalUrls.length,
            urls: finalUrls,
            xml,
            message: message || `Successfully discovered ${finalUrls.length} internal pages.`
          });
        }

        try {
          await writer.close();
        } catch {}
      };

      try {
        await sendEvent({
          type: 'start',
          message: `Initializing fast crawler for ${origin}...`,
          targetUrl: startUrl
        });

        // Add start URL to discovered
        await addDiscoveredUrl(startUrl, 0);

        // Pre-seed from robots.txt & sitemap.xml if available
        try {
          const robotsUrl = new URL('/robots.txt', origin).href;
          const rres = await fetch(robotsUrl, {
            headers: { 'User-Agent': STANDARD_BROWSER_USER_AGENT },
            signal: AbortSignal.timeout(3000)
          });
          if (rres.ok) {
            const rtext = await rres.text();
            const smatches = rtext.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
            if (smatches) {
              for (const sm of smatches) {
                const sUrl = sm.replace(/Sitemap:\s*/i, '').trim();
                try {
                  const smRes = await fetch(sUrl, {
                    headers: { 'User-Agent': STANDARD_BROWSER_USER_AGENT },
                    signal: AbortSignal.timeout(4000)
                  });
                  if (smRes.ok) {
                    const smText = await smRes.text();
                    const locMatches = smText.match(/<loc>(https?:\/\/[^<]+)<\/loc>/gi);
                    if (locMatches) {
                      for (const loc of locMatches) {
                        const cleanLoc = loc.replace(/<\/?loc>/gi, '').trim();
                        if (isInternalUrl(cleanLoc) && !isNonPageResource(cleanLoc)) {
                          await addDiscoveredUrl(cleanLoc, 1);
                          queue.push({ url: cleanLoc, depth: 1 });
                        }
                      }
                    }
                  }
                } catch {}
              }
            }
          }
        } catch {}

        // Timeout safety limit (45s max)
        const timeoutTimer = setTimeout(() => {
          finishCrawl('Crawl safety time limit reached. Compiling discovered URLs...');
        }, 45000);

        let crawledPagesCount = 0;
        const CONCURRENCY = 6;

        while (queue.length > 0 && discoveredUrls.size < safeMaxPages && !isFinished) {
          const batch = queue.splice(0, CONCURRENCY);

          await Promise.all(
            batch.map(async ({ url: currentUrl, depth }) => {
              if (isFinished) return;
              const cleanedCurrent = cleanAndNormalizeUrl(currentUrl);

              if (visitedUrls.has(cleanedCurrent)) return;
              visitedUrls.add(cleanedCurrent);

              crawledPagesCount++;
              await sendEvent({
                type: 'progress',
                currentUrl: cleanedCurrent,
                depth,
                crawledCount: crawledPagesCount,
                discoveredCount: discoveredUrls.size,
                message: `Crawling: ${cleanedCurrent}`
              });

              try {
                const res = await fetch(cleanedCurrent, {
                  headers: {
                    'User-Agent': STANDARD_BROWSER_USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                  },
                  redirect: 'follow',
                  signal: AbortSignal.timeout(8000),
                });

                if (!res.ok) return;
                const contentType = res.headers.get('content-type') || '';
                if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) return;

                const html = await res.text();
                const $ = cheerio.load(html);

                // 1. Extract <a> links
                $('a[href]').each((_, el) => {
                  const href = $(el).attr('href');
                  if (!href || href.startsWith('javascript:') || href.startsWith('data:') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

                  try {
                    const resolved = new URL(href, cleanedCurrent).href;
                    const cleanedResolved = cleanAndNormalizeUrl(resolved);

                    if (isInternalUrl(cleanedResolved) && !isNonPageResource(cleanedResolved)) {
                      if (!discoveredUrls.has(cleanedResolved)) {
                        addDiscoveredUrl(cleanedResolved, depth + 1);
                        if (depth + 1 <= safeMaxDepth) {
                          queue.push({ url: cleanedResolved, depth: depth + 1 });
                        }
                      }
                    }
                  } catch {}
                });

                // 2. Canonical and alternate link tags
                $('link[rel="canonical"], link[rel="alternate"]').each((_, el) => {
                  const href = $(el).attr('href');
                  if (!href) return;
                  try {
                    const resolved = new URL(href, cleanedCurrent).href;
                    const cleanedResolved = cleanAndNormalizeUrl(resolved);
                    if (isInternalUrl(cleanedResolved) && !isNonPageResource(cleanedResolved)) {
                      if (!discoveredUrls.has(cleanedResolved)) {
                        addDiscoveredUrl(cleanedResolved, depth + 1);
                        if (depth + 1 <= safeMaxDepth) {
                          queue.push({ url: cleanedResolved, depth: depth + 1 });
                        }
                      }
                    }
                  } catch {}
                });

                // 3. Scan Next.js / React script chunks for client-side routes
                const scriptSrcs: string[] = [];
                $('script[src]').each((_, el) => {
                  const src = $(el).attr('src');
                  if (src && (src.includes('/_next/static/chunks/') || src.includes('/static/js/') || src.includes('/assets/'))) {
                    try {
                      const fullSrc = new URL(src, cleanedCurrent).href;
                      if (!scannedScripts.has(fullSrc)) {
                        scannedScripts.add(fullSrc);
                        scriptSrcs.push(fullSrc);
                      }
                    } catch {}
                  }
                });

                for (const scriptUrl of scriptSrcs) {
                  try {
                    const sres = await fetch(scriptUrl, {
                      headers: { 'User-Agent': STANDARD_BROWSER_USER_AGENT },
                      signal: AbortSignal.timeout(4000)
                    });
                    if (sres.ok) {
                      const code = await sres.text();
                      const routeRegex = /["'](\/(?:about|blog|contact|privacy|terms|disclaimer|tools(?:\/[a-zA-Z0-9_-]+)?|blog\/[a-zA-Z0-9_-]+))["']/g;
                      let m;
                      while ((m = routeRegex.exec(code)) !== null) {
                        try {
                          const resolved = new URL(m[1], origin).href;
                          const cleanedResolved = cleanAndNormalizeUrl(resolved);
                          if (isInternalUrl(cleanedResolved) && !isNonPageResource(cleanedResolved)) {
                            if (!discoveredUrls.has(cleanedResolved)) {
                              addDiscoveredUrl(cleanedResolved, depth + 1);
                              if (depth + 1 <= safeMaxDepth) {
                                queue.push({ url: cleanedResolved, depth: depth + 1 });
                              }
                            }
                          }
                        } catch {}
                      }
                    }
                  } catch {}
                }
              } catch (err) {
                // Ignore individual page fetch errors during crawl
              }
            })
          );
        }

        clearTimeout(timeoutTimer);
        await finishCrawl();
      } catch (err) {
        await sendEvent({
          type: 'error',
          error: err instanceof Error ? err.message : 'An error occurred during website crawling.'
        });
        try {
          await writer.close();
        } catch {}
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid request payload' },
      { status: 500 }
    );
  }
}
