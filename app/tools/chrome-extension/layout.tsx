import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.chromeExtension.title,
  description: SEO_METADATA.chromeExtension.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.chromeExtension.canonical),
  },
};

export default function ChromeExtensionLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Chrome Extension Builder — Custom Link Trimming Builder",
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.chromeExtension.canonical}`,
    "description": SEO_METADATA.chromeExtension.description,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "ChromeOS, Windows, macOS, Linux",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Compile custom Chrome extension to clean links automatically",
      "Option to customize allowed and blocked tracking extensions",
      "Generates lightweight standard manifest-v3 and content scripts",
      "Compiles directly to downloadable ZIP entirely client-side"
    ],
    "browserRequirements": "Requires Google Chrome or Chromium-based browsers for extension usage."
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
