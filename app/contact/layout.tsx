import { Metadata } from 'next';
import { SEO_METADATA } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.contact.title,
  description: SEO_METADATA.contact.description,
  alternates: {
    canonical: SEO_METADATA.contact.canonical,
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
