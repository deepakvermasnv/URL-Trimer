import { NextRequest, NextResponse } from 'next/server';
import SitemapGenerator from 'sitemap-generator';
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

const CRAWLER_USER_AGENT = 'Mozilla/5.0 (compatible; URLTrim-SitemapGenerator/1.0; +https://www.urltrim.online)';

/**
 * SSRF Protection: verify if an IP is private, link-local, loopback, or cloud-internal
 */
function isPrivateOrRestrictedIp(ip: string): boolean {
  if (ip.includes('.')) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(isNaN)) return true;
    const [a, b] = parts;

    // 0.0.0.0/8 (Current network)
    if (a === 0) return true;
    // 127.0.0.0/8 (Loopback)
    if (a === 127) return true;
    // 10.0.0.0/8 (Private)
    if (a === 10) return true;
    // 172.16.0.0/12 (Private)
    if (a === 172 && b >= 16 && b <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (a === 192 && b === 168) return true;
    // 169.254.0.0/16 (Link-local / Cloud metadata: 169.254.169.254)
    if (a === 169 && b === 254) return true;
    // 100.64.0.0/10 (Carrier-grade NAT)
    if (a === 100 && b >= 64 && b <= 127) return true;
    // 192.0.0.0/24, 192.0.2.0/24 (Test networks)
    if (a === 192 && b === 0) return true;
    // 198.51.100.0/24 (Test-Net-2)
    if (a === 198 && b === 51 && parts[2] === 100) return true;
    // 203.0.113.0/24 (Test-Net-3)
    if (a === 203 && b === 0 && parts[2] === 113) return true;
    // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
    if (a >= 224) return true;

    return false;
  }

  // IPv6
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

  // Block forbidden hostnames
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

  // DNS lookup verification to prevent private IP bypass
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
      maxPages = 50, 
      maxDepth = 3, 
      respectRobots = true 
    } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid website URL.' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // SSRF Check on initial URL
    const ssrfCheck = await validateUrlForSsrf(targetUrl);
    if (!ssrfCheck.valid || !ssrfCheck.parsed) {
      return NextResponse.json({ error: ssrfCheck.error || 'Invalid or prohibited URL.' }, { status: 400 });
    }

    const startUrl = ssrfCheck.parsed.toString();
    const origin = ssrfCheck.parsed.origin;

    // Constrain limits for performance and server safety
    const safeMaxPages = Math.min(Math.max(1, Number(maxPages) || 50), 100);
    const safeMaxDepth = Math.min(Math.max(1, Number(maxDepth) || 3), 5);

    // Prepare Streaming SSE response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    const sendEvent = async (data: Record<string, unknown>) => {
      try {
        await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      } catch {
        // Stream closed by client
      }
    };

    // Run sitemap-generator crawler in background of the stream
    (async () => {
      let isCompleted = false;
      let crawlTimer: NodeJS.Timeout | null = null;
      const discoveredUrls = new Set<string>();
      const visitedPagesCount = { count: 0 };

      const finishCrawl = async (customMessage?: string) => {
        if (isCompleted) return;
        isCompleted = true;
        if (crawlTimer) clearTimeout(crawlTimer);

        try {
          // Normalize and sort discovered URLs
          const finalUrls = Array.from(discoveredUrls)
            .map(cleanAndNormalizeUrl)
            .filter((u, idx, self) => self.indexOf(u) === idx && !isNonPageResource(u))
            .sort();

          if (finalUrls.length === 0) {
            await sendEvent({
              type: 'error',
              error: 'Could not access or crawl any pages from this website. Please verify that the website is online and allows crawling.'
            });
          } else {
            const xml = generateXmlSitemap(finalUrls);
            await sendEvent({
              type: 'complete',
              totalPages: finalUrls.length,
              urls: finalUrls,
              xml,
              message: customMessage || `Successfully discovered ${finalUrls.length} internal pages and generated XML sitemap.`
            });
          }
        } catch (err) {
          await sendEvent({
            type: 'error',
            error: err instanceof Error ? err.message : 'An error occurred while compiling the sitemap.'
          });
        } finally {
          try {
            await writer.close();
          } catch {}
        }
      };

      try {
        await sendEvent({ 
          type: 'start', 
          message: `Initializing sitemap-generator crawler for ${origin}...`,
          targetUrl: startUrl
        });

        // Initialize sitemap-generator instance
        const generator = SitemapGenerator(startUrl, {
          stripQuerystring: true,
          maxDepth: safeMaxDepth,
          filepath: null,
          respectRobotsTxt: Boolean(respectRobots),
          userAgent: CRAWLER_USER_AGENT,
          timeout: 10000,
          ignore: (urlStr: string) => {
            return isNonPageResource(urlStr);
          }
        });

        const crawler = generator.getCrawler();
        crawler.interval = 35; // Fast pacing between fetches
        crawler.maxConcurrency = 5; // Concurrent fetching

        // Fetch condition to prevent downloading non-page resources
        crawler.addFetchCondition((queueItem) => {
          return !isNonPageResource(queueItem.url);
        });

        // Track script chunks already scanned for SPA route discovery
        const scannedScriptChunks = new Set<string>();

        // Event: crawler started
        crawler.on('crawlstart', () => {
          sendEvent({
            type: 'info',
            message: `Crawler started. Crawling homepage and following internal links...`
          });
        });

        // Event: individual page fetch start
        crawler.on('fetchstart', (queueItem) => {
          visitedPagesCount.count++;
          sendEvent({
            type: 'progress',
            currentUrl: queueItem.url,
            depth: queueItem.depth,
            crawledCount: visitedPagesCount.count,
            discoveredCount: discoveredUrls.size,
            message: `Crawling: ${queueItem.url}`
          });
        });

        // Event: URL discovered and added to sitemap by sitemap-generator
        generator.on('add', (addedUrl: string) => {
          if (isNonPageResource(addedUrl)) return;
          const clean = cleanAndNormalizeUrl(addedUrl);

          if (!discoveredUrls.has(clean)) {
            discoveredUrls.add(clean);

            sendEvent({
              type: 'url_discovered',
              url: clean,
              depth: 1,
              discoveredCount: discoveredUrls.size,
            });

            // Stop crawler early if requested maxPages limit reached
            if (discoveredUrls.size >= safeMaxPages) {
              generator.stop();
              finishCrawl(`Reached requested limit of ${safeMaxPages} pages. Finalizing XML sitemap...`);
            }
          }
        });

        // Event: fetch complete -> enhance resource discovery for SPA / Next.js scripts & canonicals
        crawler.on('fetchcomplete', async (queueItem, responseBuffer) => {
          const resume = crawler.wait();
          try {
            const html = responseBuffer.toString('utf8');
            const $ = cheerio.load(html);

            // 1. Canonical and alternate link tags
            $('link[rel="canonical"], link[rel="alternate"]').each((_, el) => {
              const href = $(el).attr('href');
              if (href) {
                try {
                  const resolved = new URL(href, queueItem.url).href;
                  generator.queueURL(resolved);
                } catch {}
              }
            });

            // 2. Discover client-side SPA routes from script chunks (e.g. Next.js chunks, Vite, Webpack)
            const scriptSrcs: string[] = [];
            $('script[src]').each((_, el) => {
              const src = $(el).attr('src');
              if (src && (src.includes('/_next/static/chunks/') || src.includes('/static/js/') || src.includes('/assets/'))) {
                try {
                  const fullSrc = new URL(src, queueItem.url).href;
                  if (!scannedScriptChunks.has(fullSrc)) {
                    scannedScriptChunks.add(fullSrc);
                    scriptSrcs.push(fullSrc);
                  }
                } catch {}
              }
            });

            for (const scriptUrl of scriptSrcs) {
              try {
                const sres = await fetch(scriptUrl, { signal: AbortSignal.timeout(4000) });
                if (sres.ok) {
                  const code = await sres.text();
                  // Extract standard route patterns like "/about", "/blog/...", "/tools/..."
                  const routeRegex = /["'](\/(?:about|blog|contact|privacy|terms|disclaimer|tools(?:\/[a-zA-Z0-9_-]+)?|blog\/[a-zA-Z0-9_-]+))["']/g;
                  let m;
                  while ((m = routeRegex.exec(code)) !== null) {
                    try {
                      const resolved = new URL(m[1], origin).href;
                      generator.queueURL(resolved);
                    } catch {}
                  }

                  // Extract blog slugs
                  const slugRegex = /slug:\s*["']([a-zA-Z0-9_-]+)["']/g;
                  let sm;
                  while ((sm = slugRegex.exec(code)) !== null) {
                    try {
                      const resolved = new URL(`/blog/${sm[1]}`, origin).href;
                      generator.queueURL(resolved);
                    } catch {}
                  }
                }
              } catch {}
            }
          } catch {} finally {
            resume();
          }
        });

        // Parse robots.txt Sitemap: directives to seed crawl queue with all declared internal pages before starting
        try {
          const robotsUrl = new URL('/robots.txt', origin).href;
          const rres = await fetch(robotsUrl, { signal: AbortSignal.timeout(3000) });
          if (rres.ok) {
            const rtext = await rres.text();
            const smatches = rtext.match(/Sitemap:\s*(https?:\/\/[^\s]+)/gi);
            if (smatches) {
              for (const sm of smatches) {
                const sUrl = sm.replace(/Sitemap:\s*/i, '').trim();
                try {
                  const smRes = await fetch(sUrl, { signal: AbortSignal.timeout(5000) });
                  if (smRes.ok) {
                    const smText = await smRes.text();
                    const locMatches = smText.match(/<loc>(https?:\/\/[^<]+)<\/loc>/gi);
                    if (locMatches) {
                      for (const loc of locMatches) {
                        const cleanLoc = loc.replace(/<\/?loc>/gi, '').trim();
                        if (!isNonPageResource(cleanLoc)) {
                          generator.queueURL(cleanLoc);
                        }
                      }
                    }
                  }
                } catch {}
              }
            }
          }
        } catch {}

        // Event: done
        generator.on('done', () => {
          finishCrawl();
        });

        // Event: error
        generator.on('error', (err: unknown) => {
          // Log or handle non-fatal crawler error
          console.warn('Crawler warning:', err);
        });

        // 25s timeout safety guard
        crawlTimer = setTimeout(() => {
          try {
            generator.stop();
          } catch {}
          finishCrawl('Crawl safety time limit reached (25s). Finalizing all discovered URLs...');
        }, 25000);

        // Start crawling!
        generator.start();
      } catch (err) {
        if (crawlTimer) clearTimeout(crawlTimer);
        await sendEvent({
          type: 'error',
          error: err instanceof Error ? err.message : 'Failed to initialize sitemap generator crawler.'
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
