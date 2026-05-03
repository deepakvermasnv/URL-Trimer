import { Metadata } from 'next';
import { SEO_METADATA, getCanonical } from '@/lib/metadata';

export const metadata: Metadata = {
  title: SEO_METADATA.tools.title,
  description: SEO_METADATA.tools.description,
  alternates: {
    canonical: getCanonical(SEO_METADATA.tools.canonical),
  },
};

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
