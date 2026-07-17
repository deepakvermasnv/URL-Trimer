import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.pdfConverter.title,
  description: SEO_METADATA.pdfConverter.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.pdfConverter.canonical),
  },
};

export default function PDFConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF Converter — Local Document to PDF Transformer",
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.pdfConverter.canonical}`,
    "description": SEO_METADATA.pdfConverter.description,
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Convert PNG/JPG/WebP images to PDF offline",
      "Convert Word docx documents to PDF locally",
      "Convert PowerPoint pptx files to PDF locally",
      "Interactive page-order adjustment and custom margin controls",
      "Absolutely no files sent to remote servers"
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
