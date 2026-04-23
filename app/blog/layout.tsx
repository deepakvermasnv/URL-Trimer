import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Blog | URL Trimmer Insights',
  description: 'Technical insights, SEO tips, and updates from the URL Trimmer engineering team.',
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
