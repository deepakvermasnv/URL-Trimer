import { Metadata } from 'next';
import { SEO_METADATA } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.imageConverter.title,
  description: SEO_METADATA.imageConverter.description,
  alternates: {
    canonical: SEO_METADATA.imageConverter.canonical,
  },
};

export default function ImageConverterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
