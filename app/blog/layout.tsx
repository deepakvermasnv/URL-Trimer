import { Metadata } from 'next';
import { SEO_METADATA, getCanonical, SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.blog.title,
  description: SEO_METADATA.blog.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.blog.canonical),
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_CONFIG.baseUrl}${SEO_METADATA.blog.canonical}`,
    "url": `${SITE_CONFIG.baseUrl}${SEO_METADATA.blog.canonical}`,
    "name": SITE_CONFIG.siteName + " Technical Blog",
    "description": SEO_METADATA.blog.description,
    "publisher": {
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
