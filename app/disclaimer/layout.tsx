import { Metadata } from 'next';
import { SEO_METADATA } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.disclaimer.title,
  description: SEO_METADATA.disclaimer.description,
  alternates: {
    canonical: SEO_METADATA.disclaimer.canonical,
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
