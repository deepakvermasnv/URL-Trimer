import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://ais-pre-6ktwqabbxrrt2qenz5qbq5-56912012591.asia-east1.run.app/sitemap.xml',
  };
}
