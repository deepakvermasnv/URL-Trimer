declare module 'sitemap-generator' {
  export interface SitemapGeneratorOptions {
    stripQuerystring?: boolean;
    maxEntriesPerFile?: number;
    maxDepth?: number;
    filepath?: string | null;
    userAgent?: string;
    respectRobotsTxt?: boolean;
    ignoreInvalidSSL?: boolean;
    timeout?: number;
    decodeResponses?: boolean;
    lastMod?: boolean;
    changeFreq?: string;
    priorityMap?: unknown[];
    ignoreAMP?: boolean;
    ignore?: ((url: string) => boolean) | null;
  }

  export interface QueueItem {
    url: string;
    depth: number;
    protocol: string;
    host: string;
    port: number;
    path: string;
    uriPath: string;
    stateData?: {
      code?: number;
      headers?: Record<string, string>;
    };
  }

  export interface SimpleCrawlerInstance {
    interval: number;
    maxConcurrency: number;
    maxDepth: number;
    userAgent: string;
    respectRobotsTxt: boolean;
    timeout: number;
    domainValid: (host: string) => boolean;
    urlIsAllowed: (url: string) => boolean;
    queueURL: (url: string | object, referrer?: unknown, force?: boolean) => boolean;
    addFetchCondition: (fn: (queueItem: QueueItem, referrer?: unknown) => boolean) => void;
    addDownloadCondition: (fn: (queueItem: QueueItem, response?: unknown) => boolean) => void;
    discoverResources: (buffer: Buffer, queueItem: QueueItem) => string[];
    on: (event: string, listener: (...args: any[]) => void) => SimpleCrawlerInstance;
    start: () => void;
    stop: () => void;
    wait: () => () => void;
  }

  export interface SitemapGeneratorInstance {
    start: () => void;
    stop: () => void;
    getCrawler: () => SimpleCrawlerInstance;
    getSitemap: () => unknown;
    queueURL: (url: string) => void;
    on: (event: string, listener: (...args: any[]) => void) => void;
    off: (event: string, listener: (...args: any[]) => void) => void;
  }

  export default function SitemapGenerator(
    uri: string,
    options?: SitemapGeneratorOptions
  ): SitemapGeneratorInstance;
}
