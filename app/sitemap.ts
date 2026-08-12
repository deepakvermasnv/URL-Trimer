import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';
import { submitAllSiteUrls } from '@/lib/indexnow';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.baseUrl;
  
  const routes = [
    '',
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
    '/tools/xml-sitemap-generator',
    '/blog/physics-of-zero-server-link-cleaning',
    '/blog/mastering-bulk-url-trimming-seo-best-practices',
    '/blog/link-protocol-v1-4-0-release-notes',
  ]; 

  // Fire-and-forget background ping to IndexNow (deduplicated automatically)
  submitAllSiteUrls().catch(() => {
    // Suppress background errors during static generation or crawler fetches
  });

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
