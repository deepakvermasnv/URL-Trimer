import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.blog.title,
  description: SEO_METADATA.blog.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.blog.canonical),
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
