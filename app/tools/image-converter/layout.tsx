import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.imageConverter.title,
  description: SEO_METADATA.imageConverter.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.imageConverter.canonical),
  },
};

export default function ImageConverterLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Converter — local file format transformer",
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.imageConverter.canonical}`,
    "description": SEO_METADATA.imageConverter.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Offline local image file conversion",
      "Converts to WebP, PNG, JPEG, AVIF, and BMP formats",
      "Batch convert multiple files concurrently",
      "No file size limitations or server upload latency",
      "Maintains absolute privacy with 100% browser-based memory execution"
    ],
    "browserRequirements": "Requires JavaScript. Runs entirely client-side."
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
