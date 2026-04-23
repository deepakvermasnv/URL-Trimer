import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About | URL Trimmer Protocol',
  description: 'Learn about the technology and mission behind URL Trimmer.',
  alternates: {
    canonical: '/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
