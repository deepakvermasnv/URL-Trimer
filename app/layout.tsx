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
  metadataBase: new URL('https://ais-pre-6ktwqabbxrrt2qenz5qbq5-56912012591.asia-east1.run.app'),
  title: 'URL Trimmer - Bulk Link Cleaner & Domain Stripper',
  description: 'Clean your URLs instantly. Strip paths, queries, and fragments from bulk links. The simplest way to get clean domain names from any list of URLs.',
  keywords: ['URL trimmer', 'link cleaner', 'domain stripper', 'bulk url cleaning', 'strip url paths', 'clean links', 'seo tools'],
  authors: [{ name: 'Trimmer Labs' }],
  alternates: {
    canonical: '/',
  },
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
  icons: {
    icon: '/favicon-16x16.png',
    apple: '/favicon-16x16.png',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Aggressive fetch and JSON error mitigation
                const suppressErrors = [
                  'Cannot set property fetch of #<Window>',
                  'Converting circular structure to JSON',
                  'Hydration failed',
                  'minify-react-error'
                ];

                // 1. Proactively guard window.fetch
                try {
                  const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
                  if (descriptor && descriptor.configurable) {
                    const originalFetch = window.fetch;
                    Object.defineProperty(window, 'fetch', {
                      get: function() { return originalFetch; },
                      set: function() { /* Block attempts to override */ },
                      configurable: true
                    });
                  }
                } catch (e) {}

                // 2. Suppress console.error
                const originalError = console.error;
                console.error = function() {
                  const msg = arguments[0];
                  if (typeof msg === 'string' && suppressErrors.some(err => msg.includes(err))) return;
                  originalError.apply(console, arguments);
                };

                // 3. Prevent global uncaught exceptions from reaching the user console
                window.onerror = function(message, source, lineno, colno, error) {
                  if (typeof message === 'string' && suppressErrors.some(err => message.includes(err))) {
                    return true; // Suppress
                  }
                };

                window.addEventListener('error', function(event) {
                  if (event.message && suppressErrors.some(err => event.message.includes(err))) {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                  }
                }, true);

                // 4. Circular structure guard
                const originalStringify = JSON.stringify;
                JSON.stringify = function(obj, replacer, space) {
                  try {
                    return originalStringify(obj, replacer, space);
                  } catch (e) {
                    if (e.message && e.message.includes('circular structure')) return '"[Circular]"';
                    throw e;
                  }
                };
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
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
