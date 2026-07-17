import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.textToImage.title,
  description: SEO_METADATA.textToImage.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.textToImage.canonical),
  },
};

export default function TextToImageLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Text-to-Image Generator — Create High-Quality Graphics",
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.textToImage.canonical}`,
    "description": SEO_METADATA.textToImage.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Natural language text prompt to image generation",
      "Multiple image style presets (Vibrant, Scenic, Sketch, Cinematic)",
      "High-speed generation utilizing server-side Gemini AI model technology",
      "No user login or registration required"
    ],
    "browserRequirements": "Requires JavaScript. Server API proxies the requests securely."
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
