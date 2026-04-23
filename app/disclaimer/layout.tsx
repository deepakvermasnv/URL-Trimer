import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Disclaimer | URL Trimmer',
  description: 'Official disclaimer regarding the usage and warranty of URL Trimmer services.',
  alternates: {
    canonical: '/disclaimer',
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
