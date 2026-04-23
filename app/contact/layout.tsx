import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Support | URL Trimmer Help',
  description: 'Get in touch with Trimmer Labs for technical assistance or feature requests.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
