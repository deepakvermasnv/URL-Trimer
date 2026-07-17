import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.imageCompressor.title,
  description: SEO_METADATA.imageCompressor.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.imageCompressor.canonical),
  },
};

export default function ImageCompressorLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Compressor — Free In-Browser Compression",
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.imageCompressor.canonical}`,
    "description": SEO_METADATA.imageCompressor.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Lossless and lossy image compression",
      "Support for JPEG, PNG, and WebP formats",
      "Interactive compression level slider with instant live preview",
      "Client-side processing protecting user privacy",
      "Batch download support"
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
