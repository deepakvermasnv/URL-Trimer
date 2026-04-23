import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'URL Trimmer - Bulk Link Cleaner & Domain Stripper',
  description: 'Clean your URLs instantly. Strip paths, queries, and fragments from bulk links. The simplest way to get clean domain names from any list of URLs.',
  keywords: ['URL trimmer', 'link cleaner', 'domain stripper', 'bulk url cleaning', 'strip url paths', 'clean links', 'seo tools'],
  authors: [{ name: 'Trimmer Labs' }],
  openGraph: {
    title: 'URL Trimmer - Bulk Link Cleaner',
    description: 'The simplest way to strip paths and queries from your URLs. Just paste and copy.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Trimmer',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'URL Trimmer - Bulk Link Cleaner',
    description: 'Clean your URLs instantly. Strip paths, queries, and fragments from bulk links.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Script id="error-mitigation" strategy="beforeInteractive">
          {`
            (function() {
              const originalError = console.error;
              console.error = function() {
                const message = arguments[0];
                if (typeof message === 'string' && (
                  message.includes('Cannot set property fetch of #<Window>') ||
                  message.includes('Converting circular structure to JSON') ||
                  message.includes('Hydration failed')
                )) {
                  return;
                }
                originalError.apply(console, arguments);
              };
              
              window.addEventListener('error', function(event) {
                if (event.message && (
                  event.message.includes('Cannot set property fetch') ||
                  event.message.includes('Converting circular structure to JSON')
                )) {
                  event.preventDefault();
                }
              });
            })();
          `}
        </Script>
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0JPT186X09"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            (function() {
              try {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-0JPT186X09');
              } catch (e) {
                console.warn('Analytics initialization failed:', e);
              }
            })();
          `}
        </Script>
        {children}
      </body>
    </html>
  );
}
