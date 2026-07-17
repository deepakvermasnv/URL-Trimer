import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.wordCounter.title,
  description: SEO_METADATA.wordCounter.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.wordCounter.canonical),
  },
};

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Word Counter — Professional Text Analysis Tool",
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.wordCounter.canonical}`,
    "description": SEO_METADATA.wordCounter.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Real-time word and character counting",
      "Paragraph and sentence extraction",
      "Estimated reading and speaking times",
      "Local browser-based analysis (100% private)",
      "Interactive rich text WYSIWYG editor",
      "PDF and Image document exports"
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
