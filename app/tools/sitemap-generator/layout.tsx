import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';
import Script from 'next/script';

export const metadata: Metadata = {
  title: SEO_METADATA.sitemapGenerator.title,
  description: SEO_METADATA.sitemapGenerator.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.sitemapGenerator.canonical),
  },
  openGraph: {
    title: SEO_METADATA.sitemapGenerator.title,
    description: SEO_METADATA.sitemapGenerator.description,
    url: getCanonical(SEO_METADATA.sitemapGenerator.canonical),
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sitemap Generator - URLTrim' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_METADATA.sitemapGenerator.title,
    description: SEO_METADATA.sitemapGenerator.description,
    images: ['/og-image.png'],
  },
};

export default function SitemapGeneratorLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Sitemap Generator – URLTrim",
    "url": getCanonical(SEO_METADATA.sitemapGenerator.canonical),
    "description": SEO_METADATA.sitemapGenerator.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Server-side website crawler",
      "Valid sitemaps.org XML schema generation",
      "SSRF and loopback protection",
      "Robots.txt compliance",
      "Instant XML preview and download"
    ]
  };

  return (
    <>
      <Script
        id="sitemap-generator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
