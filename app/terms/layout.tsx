import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | URL Trimmer Usage',
  description: 'Usage terms and conditions for Trimmer link cleaning services.',
  alternates: {
    canonical: '/terms',
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
