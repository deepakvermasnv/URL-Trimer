import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | URL Trimmer Security',
  description: 'Your data never leaves your device. Read about our zero-server privacy protocol.',
  alternates: {
    canonical: '/privacy',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
