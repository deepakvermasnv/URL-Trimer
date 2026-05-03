import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.imageCompressor.title,
  description: SEO_METADATA.imageCompressor.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.imageCompressor.canonical),
  },
};

export default function ImageCompressorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
