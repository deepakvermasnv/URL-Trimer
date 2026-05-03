import { Metadata } from 'next';
import { SEO_METADATA } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.wordCounter.title,
  description: SEO_METADATA.wordCounter.description,
  alternates: {
    canonical: SEO_METADATA.wordCounter.canonical,
  },
};

export default function WordCounterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
