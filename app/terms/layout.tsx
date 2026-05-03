import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.terms.title,
  description: SEO_METADATA.terms.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.terms.canonical),
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
