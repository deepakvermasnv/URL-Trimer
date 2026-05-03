import { Metadata } from 'next';
import { SEO_METADATA } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.privacy.title,
  description: SEO_METADATA.privacy.description,
  alternates: {
    canonical: SEO_METADATA.privacy.canonical,
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
