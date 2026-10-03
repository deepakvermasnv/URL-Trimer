import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';
import Script from 'next/script';

export const metadata: Metadata = {
  title: SEO_METADATA.llmsTxtGenerator.title,
  description: SEO_METADATA.llmsTxtGenerator.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.llmsTxtGenerator.canonical),
  },
  openGraph: {
    title: SEO_METADATA.llmsTxtGenerator.title,
    description: SEO_METADATA.llmsTxtGenerator.description,
    url: getCanonical(SEO_METADATA.llmsTxtGenerator.canonical),
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'LLMs.txt Generator - URLTrim' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: SEO_METADATA.llmsTxtGenerator.title,
    description: SEO_METADATA.llmsTxtGenerator.description,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function LlmsTxtGeneratorLayout({ children }: { children: React.ReactNode }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "LLMs.txt Generator – URLTrim",
    "url": getCanonical(SEO_METADATA.llmsTxtGenerator.canonical),
    "description": SEO_METADATA.llmsTxtGenerator.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Automated sitemap XML parsing",
      "Deduplication and link normalization",
      "Section categorization for LLMs and AI crawlers",
      "100% browser-based private processing",
      "Instant Markdown preview and file download"
    ]
  };

  return (
    <>
      <Script
        id="llms-txt-generator-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
