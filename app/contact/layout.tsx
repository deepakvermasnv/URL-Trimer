import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.contact.title,
  description: SEO_METADATA.contact.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.contact.canonical),
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${SITE_CONFIG.baseUrl}${SEO_METADATA.contact.canonical}`,
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.contact.canonical}`,
    "name": SEO_METADATA.contact.title,
    "description": SEO_METADATA.contact.description,
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${SITE_CONFIG.baseUrl}/`,
      "name": SITE_CONFIG.siteName,
      "url": `${SITE_CONFIG.baseUrl}/`
    },
    "mainEntity": {
      "@type": "Organization",
      "@id": `${SITE_CONFIG.baseUrl}/#organization`,
      "name": "Trimmer Labs"
    }
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
