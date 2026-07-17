import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.about.title,
  description: SEO_METADATA.about.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.about.canonical),
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_CONFIG.baseUrl}${SEO_METADATA.about.canonical}`,
        "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.about.canonical}`,
        "name": SEO_METADATA.about.title,
        "description": SEO_METADATA.about.description,
        "isPartOf": {
          "@type": "WebSite",
          "@id": `${SITE_CONFIG.baseUrl}/`,
          "name": SITE_CONFIG.siteName,
          "url": `${SITE_CONFIG.baseUrl}/`
        }
      },
      {
        "@type": "Organization",
        "@id": `${SITE_CONFIG.baseUrl}/#organization`,
        "name": "Trimmer Labs",
        "url": `${SITE_CONFIG.baseUrl}/`,
        "logo": {
          "@type": "ImageObject",
          "url": "https://i.postimg.cc/5209g15c/favicon-32x32.png"
        },
        "sameAs": [
          "https://twitter.com/urltrim"
        ]
      }
    ]
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
