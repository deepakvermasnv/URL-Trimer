import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.textToImage.title,
  description: SEO_METADATA.textToImage.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.textToImage.canonical),
  },
};

export default function TextToImageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
