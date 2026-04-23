import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.urltrim.online';
  
  const routes = [
    '',
    '/about',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/blog/physics-of-zero-server-link-cleaning',
    '/blog/mastering-bulk-url-trimming-seo-best-practices',
    '/blog/link-protocol-v1-4-0-release-notes',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));
}
