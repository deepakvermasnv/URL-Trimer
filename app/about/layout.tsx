import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.about.title,
  description: SEO_METADATA.about.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.about.canonical),
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
