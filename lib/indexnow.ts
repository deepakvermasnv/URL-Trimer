/**
 * IndexNow Service Module
 *
 * Implements Microsoft's IndexNow protocol to instantly notify search engines
 * (Bing, Yandex, Seznam, Naver) about page additions, updates, and deletions.
 *
 * Specification: https://www.indexnow.org/documentation
 */

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
}

export interface IndexNowSubmitOptions {
  /** Override default host (e.g. urltrim.online) */
  host?: string;
  /** Override default verification key */
  key?: string;
  /** Override default key location URL */
  keyLocation?: string;
  /** Bypass duplicate submission filter */
  force?: boolean;
}

export interface IndexNowResponse {
  success: boolean;
  statusCode: number;
  message: string;
  submittedUrls: string[];
  skippedDuplicates: string[];
}

// Default Configuration
const DEFAULT_HOST = process.env.INDEXNOW_HOST || 'urltrim.online';
const DEFAULT_KEY = process.env.INDEXNOW_KEY || '6eb31472270545a2acba5fbbb0e9d175';
const DEFAULT_KEY_LOCATION =
  process.env.INDEXNOW_KEY_LOCATION ||
  `https://${DEFAULT_HOST}/${DEFAULT_KEY}.txt`;
const INDEXNOW_API_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * In-memory cache to prevent redundant indexnow calls.
 * Stores normalized URL -> timestamp of last successful submission.
 */
const submissionCache = new Map<string, number>();

/** Cooldown period in milliseconds (e.g., 10 minutes) to prevent spamming */
const DEDUPLICATION_COOLDOWN_MS = 10 * 60 * 1000;

/**
 * Normalizes relative paths or full URLs into canonical absolute URL strings for IndexNow.
 */
export function normalizeUrl(urlOrPath: string, host: string = DEFAULT_HOST): string {
  let url = urlOrPath.trim();
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `https://${host}${cleanPath}`;
}

/**
 * Submits a list of URLs to IndexNow search engine endpoint.
 * Includes automatic deduplication and payload validation.
 */
export async function submitToIndexNow(
  urls: string | string[],
  options: IndexNowSubmitOptions = {}
): Promise<IndexNowResponse> {
  const host = options.host || DEFAULT_HOST;
  const key = options.key || DEFAULT_KEY;
  const keyLocation = options.keyLocation || DEFAULT_KEY_LOCATION;
  const force = options.force ?? false;

  const rawUrls = Array.isArray(urls) ? urls : [urls];
  const now = Date.now();

  const validUrls: string[] = [];
  const skippedDuplicates: string[] = [];

  // Filter & normalize URLs, removing duplicates
  for (const item of rawUrls) {
    const normalized = normalizeUrl(item, host);
    if (!normalized) continue;

    const lastSubmitted = submissionCache.get(normalized);
    const isDuplicate =
      !force && lastSubmitted && now - lastSubmitted < DEDUPLICATION_COOLDOWN_MS;

    if (isDuplicate) {
      if (!skippedDuplicates.includes(normalized)) {
        skippedDuplicates.push(normalized);
      }
    } else {
      if (!validUrls.includes(normalized)) {
        validUrls.push(normalized);
      }
    }
  }

  // If no new URLs to submit, exit early
  if (validUrls.length === 0) {
    return {
      success: true,
      statusCode: 200,
      message: skippedDuplicates.length > 0
        ? 'All requested URLs were recently submitted (deduplicated).'
        : 'No valid URLs provided.',
      submittedUrls: [],
      skippedDuplicates,
    };
  }

  const payload: IndexNowPayload = {
    host,
    key,
    keyLocation,
    urlList: validUrls,
  };

  try {
    const response = await fetch(INDEXNOW_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const statusCode = response.status;
    let message = '';

    switch (statusCode) {
      case 200:
        message = 'IndexNow: URLs submitted successfully (200 OK).';
        break;
      case 202:
        message = 'IndexNow: URLs received and pending validation (202 Accepted).';
        break;
      case 400:
        message = 'IndexNow Error: Invalid request format (400 Bad Request).';
        break;
      case 403:
        message = 'IndexNow Error: Invalid key or key location mismatch (403 Forbidden).';
        break;
      case 422:
        message = 'IndexNow Error: Unprocessable entity / URLs do not match host (422).';
        break;
      case 429:
        message = 'IndexNow Error: Rate limited (429 Too Many Requests).';
        break;
      default:
        message = `IndexNow response status: ${statusCode}`;
    }

    const isSuccess = statusCode >= 200 && statusCode < 300;

    if (isSuccess) {
      // Record submission timestamp for deduplication
      validUrls.forEach((url) => submissionCache.set(url, now));
    }

    return {
      success: isSuccess,
      statusCode,
      message,
      submittedUrls: validUrls,
      skippedDuplicates,
    };
  } catch (error: any) {
    return {
      success: false,
      statusCode: 500,
      message: `IndexNow Submission Failed: ${error?.message || 'Network error'}`,
      submittedUrls: [],
      skippedDuplicates,
    };
  }
}

/**
 * Helper to notify IndexNow when a page is published.
 */
export async function notifyPagePublished(
  urlOrPath: string,
  options?: IndexNowSubmitOptions
): Promise<IndexNowResponse> {
  return submitToIndexNow(urlOrPath, options);
}

/**
 * Helper to notify IndexNow when a page is updated.
 */
export async function notifyPageUpdated(
  urlOrPath: string,
  options?: IndexNowSubmitOptions
): Promise<IndexNowResponse> {
  return submitToIndexNow(urlOrPath, options);
}

/**
 * Helper to notify IndexNow when a page is deleted.
 */
export async function notifyPageDeleted(
  urlOrPath: string,
  options?: IndexNowSubmitOptions
): Promise<IndexNowResponse> {
  return submitToIndexNow(urlOrPath, options);
}

/**
 * Utility to retrieve the list of all known site URLs from the application routes.
 */
export function getAllSiteUrls(): string[] {
  const routes = [
    '/',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/tools',
    '/tools/word-counter',
    '/tools/pdf-converter',
    '/tools/image-compressor',
    '/tools/image-converter',
    '/tools/text-to-image',
    '/tools/chrome-extension',
    '/blog/physics-of-zero-server-link-cleaning',
    '/blog/mastering-bulk-url-trimming-seo-best-practices',
    '/blog/link-protocol-v1-4-0-release-notes',
  ];

  return routes.map((r) => normalizeUrl(r));
}

/**
 * Submits all main application URLs to IndexNow.
 */
export async function submitAllSiteUrls(
  options?: IndexNowSubmitOptions
): Promise<IndexNowResponse> {
  const allUrls = getAllSiteUrls();
  return submitToIndexNow(allUrls, options);
}
