import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.xmlSitemapGenerator.title,
  description: SEO_METADATA.xmlSitemapGenerator.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.xmlSitemapGenerator.canonical),
  },
  openGraph: {
    title: SEO_METADATA.xmlSitemapGenerator.title,
    description: SEO_METADATA.xmlSitemapGenerator.description,
    url: getCanonical(SEO_METADATA.xmlSitemapGenerator.canonical),
    siteName: SITE_CONFIG.siteName,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_METADATA.xmlSitemapGenerator.title,
    description: SEO_METADATA.xmlSitemapGenerator.description,
    site: SITE_CONFIG.twitterHandle,
  },
};

export default function XMLSitemapGeneratorLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "XML Sitemap Generator – URLTrim",
    "url": getCanonical(SEO_METADATA.xmlSitemapGenerator.canonical),
    "description": SEO_METADATA.xmlSitemapGenerator.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Instant internal page website crawler",
      "Free up to 500 pages and 5 crawl depth levels",
      "Robots.txt parsing and duplicate URL filtering",
      "Real-time crawling progress monitor",
      "Instant XML sitemap preview and download",
      "Valid sitemaps.org schema XML format"
    ],
    "browserRequirements": "Requires JavaScript."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
